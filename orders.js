import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { updateDoc, deleteDoc, setDoc, collection, doc, addDoc, getDoc ,getDocs, serverTimestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Listen for auth state changes
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const userRef = await getDoc(doc(db, "users", user.uid));
            const roleRef = await getDoc(doc(db, "roles", user.uid));

            if (!roleRef.data().owner && !roleRef.data().management && !roleRef.data().chef && !roleRef.data().waiter) {
                window.location.href = "home.html";
            }

        } catch (error) {
            console.error("Error fetching user:", error); 
        }
    }
    else{
            window.location.href = "signin.html";
    }
        orderList();
    });

    async function orderList() {
        const list = document.getElementById("orderViews");
        list.innerHTML = "";

        const ordersMenu = [];
        const ordersSnapshot = await getDocs(collection(db, "orders"));
        ordersSnapshot.forEach((allItems) => {
            ordersMenu.push({ id: allItems.id, ...allItems.data() });
        });
        ordersMenu.sort((a, b) => a.createdAt - b.createdAt);
        for (const order of ordersMenu) {
            const mainDiv = document.createElement("div");
            list.appendChild(mainDiv);

            const orderID = document.createElement("p");
            orderID.textContent = order.id;
            mainDiv.appendChild(orderID);
    };
};