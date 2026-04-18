import { auth, db } from "./firebase-config.js";
import { getAuth, signInWithPopup, signInWithRedirect, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { doc, setDoc, getDocs, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const googleBttn = document.getElementById("google");

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

auth.languageCode = 'it';


googleBttn.addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then(async (result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;

      // Add user data to Firestore
      try {

        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if(!docSnap.exists()){
          await setDoc(doc(db, "roles", user.uid), {
            waiter:false,
            chef: false,
            management: false,
            owner: false,
          });
        }

          await setDoc(doc(db, "users", user.uid), {
          name: user.displayName,
          email: user.email,
          createdAt: serverTimestamp(),
          pfp: user.photoURL,
          viewType: false
        });
        
        //alert("Sign in successful! Welcome " + user.displayName);
        window.location.href = "home.html";
      } catch (dbError) {
        console.error("Error adding user to Firestore: ", dbError);
        alert("Error saving user data.");
      }
    })
    .catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      alert("Error signing in: " + errorMessage);
    });
});
