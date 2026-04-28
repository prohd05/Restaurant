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
            if(order.status == "pending"){
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
                orderTime.className = "orderTime"
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
                orderButton.className = "complete"
                orderButton.textContent = "Complete Order";
                mainDiv.appendChild(orderButton);
                
                async function confirmButton() {
                    if (confirm("Confirm to complete order")) {
                        try {
                            const orderRef = doc(db, "orders", order.id);
                            const orderSnap = await getDoc(orderRef);

                            if (!orderSnap.exists()) return;

                            const orderData = orderSnap.data();
                            const orderedItems = orderData.items || [];
                            const invSnapshot = await getDocs(collection(db, "inventory"));

                            for (const invDoc of invSnapshot.docs) {
                                const invData = invDoc.data();
                                const menuItems = invData.menuItems || [];

                                let totalDeduction = 0;

                                for (const orderedItem of orderedItems) {
                                    const found = menuItems.find(m => m.id === orderedItem.itemID);

                                    if (found) {
                                        totalDeduction += found.amount;
                                    }
                                }

                                if (totalDeduction > 0) {
                                    let newAmount = invData.amount - totalDeduction;

                                    if (newAmount < 0) {
                                        newAmount = 0;
                                    }

                                    await updateDoc(doc(db, "inventory", invDoc.id), {
                                        amount: newAmount
                                    });
                                }
                            }

                            await updateDoc(orderRef, {
                                status: "completed"
                            });

                            await addDoc(collection(db, "accounting"), {
                                user: orderData.user,
                                type: "orders",
                                item: String(orderData.items.map(i => i.title).join(", ")),
                                totalPrice: orderData.subTotal,
                                timestamp: serverTimestamp()
                            });

                            window.location.reload();

                        } catch (error) {
                            console.error("Error updating order:", error);
                        }
                    }
                }

                    orderButton.addEventListener("click", async () => {
                    confirmButton();
                });
            }
        }
    };