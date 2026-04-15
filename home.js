import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { updateDoc, collection, doc, addDoc, getDoc ,getDocs, serverTimestamp} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Listen for auth state changes
  onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const pfp = document.getElementById("hPFP"); // Get the element to display the profile picture
      const name = document.getElementById("hName"); // Get the element to display the username
      const role = document.getElementById("hRole"); // Get the element to display the username
      name.textContent = user.displayName; // Set the username in the navbar
      pfp.src = user.photoURL; // Set the profile picture in the navbar
      
      const userRef = await getDoc(doc(db, "users", user.uid));
      const roleRef = await getDoc(doc(db, "roles", user.uid));

      if(roleRef.data().owner){
        role.textContent ="Role: Owner";
      }
      else if(roleRef.data().management){
        role.textContent ="Role: Management";
      }
      else if(roleRef.data().chef){
        role.textContent ="Role: Chef";
      }
      else if(roleRef.data().waiter){
        role.textContent ="Role: Waiter";
      }
      else{
        role.textContent ="Role: Customer";
      }

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
    const logoutButton = document.getElementById("hSignout"); // Select the logout button using its ID
    logoutButton.addEventListener("click", async () => {
    try {
    await signOut(auth);
    //alert("Logged out successfully!");
    window.location.href = "signin.html";
    } catch (error) {
    console.log("Error logging out: " + error.message);
    }
    });