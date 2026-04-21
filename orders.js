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

    async function orderList(){
    const list = document.getElementById("orderViews");
    list.innerHTML = ""; 
    const ordersMenu = [];
    const orderSnapshot = await getDocs(collection(db, "orders"));
    orderSnapshot.forEach((staffdoc) => {
        ordersMenu.push({ id: staffdoc.id, ...staffdoc.data() });
    });
    ordersMenu.sort((a, b) => b.createdAt - a.createdAt);
    for (const order of ordersMenu) {
        const mainDiv = document.createElement("div");
        mainDiv.className = "orderDiv";
        list.appendChild(mainDiv);

        const topDiv = document.createElement("div");
        topDiv.className = "topDiv";
        mainDiv.appendChild(topDiv);
        
        const orderID = document.createElement("h4");
        orderID.textContent = "ID: " + order.id;
        topDiv.appendChild(orderID);


        const botDiv = document.createElement("div");
        botDiv.className = "bottomDiv";
        mainDiv.appendChild(botDiv);

        const itemref = await getDoc(doc(db, "orders", order.id));
        const orderList = document.createElement("ul");
        orderList.className = "orderul";
        orderList.textContent = "Orders:";
        itemref.data().items.forEach(i => {
            const li = document.createElement("li");
            li.textContent = `${i.title}`;
            orderList.appendChild(li);
        });
        botDiv.appendChild(orderList);
        
        const orderTime = document.createElement("h4");
        orderTime.textContent = order.createdAt.toDate().toLocaleString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });;
        orderTime.textContent += ", " + order.createdAt.toDate().toLocaleString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "2-digit",
        });
        botDiv.appendChild(orderTime);

        const orderButton = document.createElement("button");
        orderButton.textContent = "Complete";
        mainDiv.appendChild(orderButton);
    }
};