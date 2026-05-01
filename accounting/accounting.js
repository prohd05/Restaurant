import { auth, db } from "../firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { updateDoc, deleteDoc, setDoc, collection, doc, addDoc, getDoc ,getDocs, serverTimestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Listen for auth state changes
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const userRef = await getDoc(doc(db, "users", user.uid));
            const roleRef = await getDoc(doc(db, "roles", user.uid));

            if (!roleRef.data().owner && !roleRef.data().management) {
                window.location.href = "home.html";
            }

        } catch (error) {
            console.error("Error fetching user:", error); 
        }
    }
    else{
            window.location.href = "../signin.html";
    }

    viewAcc("all", "accAll");
    viewAcc("orders", "accOrders");
    viewAcc("shifts", "accShifts");
    viewAcc("inventory", "accInv");
    checkAcc();
});

async function checkAcc() {
    let expenses = 0;
    let income = 0;
    let balance = 0;

    const accRef = collection(db, "accounting");
    const accSnapshot = await getDocs(accRef);
    accSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.type === "orders") {
            income += parseFloat(data.totalPrice);
        } else if (data.type === "shifts" || data.type === "inventory") {
            expenses += parseFloat(data.totalPrice);
        }
    });
    balance = income - expenses;

    document.getElementById("income").textContent = "Income: $" + income.toFixed(2);
    document.getElementById("expenses").textContent = "Expenses: $" + expenses.toFixed(2);
    document.getElementById("balance").textContent = "$" + balance.toFixed(2);

    if(balance > 0){
        document.getElementById("balance").style.color = "green";
    }
    else{
        document.getElementById("balance").style.color = "red";
    }
}

async function viewAcc(src, div){
    const list = document.getElementById(div);
    list.innerHTML = ""; 
    const ordersInv = [];
    const InvSnapshot = await getDocs(collection(db, "accounting"));
    InvSnapshot.forEach((staffdoc) => {
        ordersInv.push({ id: staffdoc.id, ...staffdoc.data() });
    });
    ordersInv.sort((a, b) => a.createdAt - b.createdAt);
    for (const item of ordersInv) {
        if(item.type === src || src === "all"){
            const mainDiv = document.createElement("div");
            mainDiv.classList = "accDiv";
            list.appendChild(mainDiv);

            const user = document.createElement("p");
            user.textContent = "User: " + item.user;
            mainDiv.appendChild(user);
            
            if(src === "all"){
                const type = document.createElement("p");
                type.textContent = "Type: " + item.type;
                mainDiv.appendChild(type);
            }

            const Item = document.createElement("p");
            if(item.type === "inventory"){ Item.textContent = "Item: " + item.item;}
            else if(item.type === "shifts"){ Item.textContent = "Hours: " + item.item;}
            else if(item.type === "orders"){ Item.textContent = "Order: " + item.item;}
            mainDiv.appendChild(Item);

            if(item.type === "inventory"){
                const pricePer = document.createElement("p");
                pricePer.textContent = "Price Per: $" + item.pricePer;
                mainDiv.appendChild(pricePer);
            }
            if(item.type === "shifts"){
                const pricePer = document.createElement("p");
                pricePer.textContent = "Hourly Rate: $" + item.pricePer;
                mainDiv.appendChild(pricePer);
            }

            const amount = document.createElement("p");
            amount.textContent = "Amount: " + "$" + item.totalPrice;
            if(item.type === "shifts"){
                amount.textContent = "Total Pay: " + "$" + item.totalPrice;
            }
            mainDiv.appendChild(amount);

            const date = document.createElement("p");
            date.textContent = "Date: " + item.timestamp.toDate().toLocaleString();
            mainDiv.appendChild(date);
        }
    }
}