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
            window.location.href = "signin.html";
    }

    viewAcc("orders", "accOrders");
    viewAcc("shifts", "accShifts");
    viewAcc("inventory", "accInv");
});

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
        if(item.type === src){
            const mainDiv = document.createElement("div");
            list.appendChild(mainDiv);

            const user = document.createElement("p");
            user.textContent = "User: " + item.user;
            mainDiv.appendChild(user);

            let exp = "";
            if(src === "orders"){
                exp = "+";
            }
            if(src === "shifts" || src === "inventory"){
                exp = "-";
            }

            const Item = document.createElement("p");
            Item.textContent = "Item: " + item.item;
            mainDiv.appendChild(Item);

            const amount = document.createElement("p");
            amount.textContent = "Amount: $" + item.totalPrice;
            mainDiv.appendChild(amount);
        }
    }
}