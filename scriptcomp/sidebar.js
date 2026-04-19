import { auth, db } from "../firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { updateDoc, deleteDoc, setDoc, collection, doc, addDoc, getDoc ,getDocs, serverTimestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.querySelector(".sidebar");
    const toggleBtn = document.querySelector(".navSidebar");

    // default hidden
    sidebar.style.visibility = "hidden";
    let visible = false;
    toggleBtn.addEventListener("click", () => {
        visible = !visible;
        sidebar.style.visibility = visible ? "visible" : "hidden";
    });
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const buttonArea = document.querySelectorAll(".navSideArea");
    const hSelect = document.querySelectorAll(".sideHome");
    const oSelect = document.querySelectorAll(".sideOrders");
    const mSelect = document.querySelectorAll(".sideManagement");
    const iSelect = document.querySelectorAll(".sideInventory");
    const aSelect = document.querySelectorAll(".sideAccounting");
    const roleRef = await getDoc(doc(db, "roles", user.uid));
    if(!roleRef.data().waiter && !roleRef.data().chef && !roleRef.data().management && !roleRef.data().owner){
        buttonArea.forEach(el => {
            el.remove();
        });
    }
    else{
        navPublic.remove();
    }
    if(roleRef.data().waiter){
        iSelect.forEach(el => {
            el.style.visibility = "hidden";
        });
        mSelect.forEach(el => {
            el.style.visibility = "hidden";
        });
        aSelect.forEach(el => {
            el.style.visibility = "hidden";
        });
    }
    if(roleRef.data().chef ){
        mSelect.forEach(el => {
            el.style.visibility = "hidden";
        });
        aSelect.forEach(el => {
            el.style.visibility = "hidden";
        });
    }
  }
});