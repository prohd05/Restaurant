import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { updateDoc, collection, doc, addDoc, setDoc, getDoc ,getDocs, serverTimestamp} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Listen for auth state changes
onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        //const pfp = document.getElementById("hPFP"); // Get the element to display the profile picture
        //const name = document.getElementById("hName"); // Get the element to display the username
        //const role = document.getElementById("hRole"); // Get the element to display the username
        //name.textContent = user.displayName; // Set the username in the navbar
        //pfp.src = user.photoURL; // Set the profile picture in the navbar
        
        const userRef = await getDoc(doc(db, "roles", user.uid));
  
        if(userRef.data().owner){
          //role.textContent ="Role: Owner";
        }
        else if(userRef.data().management){
          //role.textContent ="Role: Management";
        }
        else if(userRef.data().chef){
          //role.textContent ="Role: Chef";
        }
        else if(userRef.data().waiter){
          //role.textContent ="Role: Waiter";
          window.location.href = "home.html";
        }
        else{
            window.location.href = "home.html";
          //role.textContent ="Role: Customer";
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

  document.addEventListener("DOMContentLoaded", () => {
    const mealForm = document.getElementById("addMeal");
    const IngForm = document.getElementById("addIng");
    const user = auth.currentUser;

    mealForm.addEventListener("submit", async (event) => {
      event.preventDefault();
    try{

      const newDoc = await addDoc(collection(db, "menu"), {
        title: document.getElementById("mealTitle").value,
        type: document.getElementById("mealType").value,
        price: document.getElementById("mealPrice").value,
        picture: document.getElementById("mealImg").value,
        createdAt: serverTimestamp()
      });
       await setDoc(doc(db, "items", newDoc.id), {
        title: "a"
      }); 

      document.getElementById("mealTitle").value = "";
      document.getElementById("mealType").value = "";
      document.getElementById("mealPrice").value = "";
    }
    catch(error){
      alert("Error placing order: " + error.message);
      console.error("Order error:", error); 
    };
    });
  });