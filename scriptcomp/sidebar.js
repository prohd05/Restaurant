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

    const publicSelect = document.querySelectorAll(".publicLinks");

    function closeSidebar() {
        visible = false;
        sidebar.style.visibility = "hidden";
    }

    publicSelect.forEach(el => {
        el.addEventListener("click", closeSidebar);
    });
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const buttonArea = document.querySelectorAll(".navSideArea");
    const hSelect = document.querySelectorAll(".sideHome");
    const oSelect = document.querySelectorAll(".sideOrders");
    const sSelect = document.querySelectorAll(".sideShift");
    const mSelect = document.querySelectorAll(".sideManagement");
    const iSelect = document.querySelectorAll(".sideInventory");
    const aSelect = document.querySelectorAll(".sideAccounting");
    const roleRef = await getDoc(doc(db, "roles", user.uid));
    if(!roleRef.data().waiter && !roleRef.data().chef && !roleRef.data().management && !roleRef.data().owner){
        //navPublic.remove();
        hSelect.forEach(el => {
            el.remove();
        });
        sSelect.forEach(el => {
            el.remove();
        });
        oSelect.forEach(el => {
            el.remove();
        });
        mSelect.forEach(el => {
            el.remove();
        });
        iSelect.forEach(el => {
            el.remove();
        });
        aSelect.forEach(el => {
            el.remove();
        });
    }
    
    if(roleRef.data().waiter){
        iSelect.forEach(el => {
            el.remove();
        });
        mSelect.forEach(el => {
            el.remove();
        });
        aSelect.forEach(el => {
            el.remove();
        });
    }
    if(roleRef.data().chef ){
        mSelect.forEach(el => {
            el.remove();
        });
        aSelect.forEach(el => {
            el.remove();
        });
    }
  }
});