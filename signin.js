import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { auth, db } from "./firebase-config.js";
import { doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const provider = new GoogleAuthProvider();

 async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const roleRef = doc(db, "roles", user.uid);

    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(roleRef, {
        waiter: false,
        chef: false,
        management: false,
        owner: false,
      });
    }

    await setDoc(userRef, {
      name: user.displayName,
      email: user.email,
      pfp: user.photoURL,
      viewType: false,
      createdAt: serverTimestamp()
    }, { merge: true });

      window.location.href = "home.html";

  } catch (error) {
    console.error("Google Sign-In Error:", error);
    alert("Failed to sign in.");
  }
}

const googleBttn = document.getElementById("google");

googleBttn.addEventListener("click", () => {
    signInWithGoogle();
});