import { auth, db } from "../firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { updateDoc, deleteDoc, setDoc, collection, doc, addDoc, getDoc ,getDocs, serverTimestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const pfp = document.querySelectorAll(".navPFP"); // Get the element to display the profile picture
      const name = document.querySelectorAll(".navName"); // Get the element to display the username
      const role = document.querySelectorAll(".navRole"); // Get the element to display the username
      name.forEach(el => {
      el.textContent = user.displayName;
      });

      pfp.forEach(el => {
        el.src = user.photoURL;
      });
      
      const userRef = await getDoc(doc(db, "users", user.uid));
      const roleRef = await getDoc(doc(db, "roles", user.uid));

      role.forEach(el => {
      if (roleRef.data().owner) {
          el.textContent = "Role: Owner";
      }
      else if (roleRef.data().management) {
          el.textContent = "Role: Management";
      }
      else if (roleRef.data().chef) {
          el.textContent = "Role: Chef";
      }
      else if (roleRef.data().waiter) {
          el.textContent = "Role: Waiter";
      }
      else {
          el.textContent = "Role: Customer";
      }
  });

    } catch (error) {
      console.error("Error fetching user:", error); 
    }
  } else {
    setTimeout(() => {
      window.location.href = "signin.html";
    }, 1000);
  }
});

/// Sign Out Button
    const logoutButtons = document.querySelectorAll(".navSignout");

    logoutButtons.forEach(btn => {
        btn.addEventListener("click", async () => {
            try {
                await signOut(auth);
                window.location.href = "signin.html";
            } catch (error) {
                console.log("Error logging out: " + error.message);
            }
        });
    });

    const homeButton = document.querySelectorAll(".navlogoClick");

    homeButton.forEach(btn => {
        btn.addEventListener("click", async () => {
          if( window.location.pathname.includes("accounting") ){
            window.location.href = "../home.html";
          }
          else{
            window.location.href = "home.html";
          }
        });
    });