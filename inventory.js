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

    viewInventory();
    viewMenu();

    const addIngForm = document.getElementById("addIng");
    addIngForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      addInventory();
    });
  });

  async function addInventory() {
    const itemName = document.getElementById("ogName").value;
    const itemAmount = document.getElementById("ogAmount").value;
    const itemType = document.getElementById("ogType").value;
    const itemLow = document.getElementById("ogLow").value;
    const addButton = document.getElementById("ogAdd");
      try {
        await setDoc(doc(db, "inventory", itemName), {
            name: itemName,
            amount: itemAmount,
            lowAmount: itemLow,
            measurement: itemType,
            createdAt: serverTimestamp()
        });
        document.getElementById("ogName").value = "";
        document.getElementById("ogAmount").value = "";
        document.getElementById("ogType").value = "";
        document.getElementById("ogLow").value = "";
        viewInventory();
    } catch (err) {
        console.error(err);
    }
  }

  async function viewInventory(){
    const list = document.getElementById("viewInventory");
        list.innerHTML = ""; 
        const ordersInv = [];
        const InvSnapshot = await getDocs(collection(db, "inventory"));
        InvSnapshot.forEach((staffdoc) => {
          ordersInv.push({ id: staffdoc.id, ...staffdoc.data() });
        });
        ordersInv.sort((a, b) => b.createdAt - a.createdAt);
        for (const item of ordersInv) {
          const mainDiv = document.createElement("div");
          mainDiv.className = "invDiv"
          list.appendChild(mainDiv);

          const name = document.createElement("p");
          name.textContent = "Item: " + item.name;
          mainDiv.appendChild(name);

          async function stateAmount() {
            const low = document.createElement("p");
            low.textContent = "LOW STOCK";
            low.style.color = "red";
            mainDiv.appendChild(low);
            if(item.amount > item.lowAmount){
              low.remove();
            }
            const amount = document.createElement("p");
            amount.textContent = "Amount: " + item.amount + " " + item.measurement;
            mainDiv.appendChild(amount);
          }
          
          stateAmount();

        // Menu (Amount) 
        // Buns Example: Burger (2)

        //Plus button with input to add or remove the amount

          const amountRef = doc(db, "inventory", item.id)

          const addAmount = document.createElement("button");
          addAmount.textContent = "+";
          mainDiv.appendChild(addAmount);

          addAmount.addEventListener("submit", async (event) => {
            let aa = item.amount + 1;
            try{
              await updateDoc(amountRef, {
                amount:aa
              });
            }
            catch{

            }
          });

          const amountV = document.createElement("input");
          amountV.placeholder = "Amount";
          mainDiv.appendChild(amountV);

          const minusAmount = document.createElement("button");
          minusAmount.textContent = "-";
          mainDiv.appendChild(minusAmount);
      }
  };

  async function viewMenu(){
    const list = document.getElementById("viewMenu");
        list.innerHTML = ""; 
        const ordersInv = [];
        const InvSnapshot = await getDocs(collection(db, "menu"));
        InvSnapshot.forEach((staffdoc) => {
          ordersInv.push({ id: staffdoc.id, ...staffdoc.data() });
        });
        ordersInv.sort((a, b) => b.createdAt - a.createdAt);
        for (const item of ordersInv) {
          const mainDiv = document.createElement("div");
          mainDiv.className = "invDiv"
          list.appendChild(mainDiv);

          const title = document.createElement("p");
          title.textContent = item.title;
          mainDiv.appendChild(title);
      }
  };

   document.addEventListener("DOMContentLoaded", () => {
    const mealForm = document.getElementById("addMeal");
    mealForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("mealTitle").value;
    const type = document.getElementById("mealType").value;
    const img = document.getElementById("mealImg").value;
    const price = parseFloat(document.getElementById("mealPrice").value);

    try {
        const newDoc = await addDoc(collection(db, "menu"), {
            title: title,
            type: type,
            picture: img,
            price: price,
            createdAt: serverTimestamp()
        });
        alert("Meal added to menu");
        window.location.reload();
    } catch (err) {
        console.error(err);
    }
});
  });