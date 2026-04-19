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

    document.getElementById("ingAdd").addEventListener("click", () => {
    const container = document.getElementById("addIng");

    const row = document.createElement("div");
    row.className = "ingRow";

    row.innerHTML = `
        <input class="ingName" placeholder="Item" required>
        <input class="ingAmount" type="number" placeholder="Amount" required>
        <select class="ingUnit">
            <option>Tablespoons</option>
            <option>Ounces</option>
            <option>Grams</option>
            <option>Pounds</option>
        </select>
        <button class="ingRemove" type="button"> - </button>
    `;

    container.insertBefore(row, document.getElementById("ingAdd").lastElementChild);
    row.querySelector(".ingRemove").addEventListener("click", () => {
        row.remove();
    });
  });

    mealForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("mealTitle").value;
    const type = document.getElementById("mealType").value;
    const img = document.getElementById("mealImg").value;
    const price = parseFloat(document.getElementById("mealPrice").value);
    const ingRows = document.querySelectorAll(".ingRow");

    const ingredients = [];
    ingRows.forEach(row => {
        const name = row.querySelector(".ingName").value;
        const amount = row.querySelector(".ingAmount").value;
        const unit = row.querySelector(".ingUnit").value;

        if (name && amount) {
            ingredients.push({
                name: name,
                amount: amount,
                unit: unit,
            });
        }
    });

    try {
        const newDoc = await addDoc(collection(db, "menu"), {
            title: title,
            type: type,
            picture: img,
            price: price,
            createdAt: serverTimestamp()
        });
        await setDoc(doc(db, "items", newDoc.id), {
            ingredients: ingredients
        });
        alert("Meal added to menu");
        window.location.reload();
    } catch (err) {
        console.error(err);
    }
});
  });