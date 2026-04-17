import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { updateDoc, collection, doc, addDoc, getDoc ,getDocs, serverTimestamp} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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
        setTimeout(() => {
            window.location.href = "signin.html";
            }, 1000);
    }
    displayStaff(user, document.getElementById("stfSrc").value);

    document.getElementById("stfSrcBtt").addEventListener("click", async (event) =>{
        document.getElementById("stfSrcBtt").disabled = true;
        setTimeout(() => {
            document.getElementById("stfSrcBtt").disabled = false;
        }, 500);
        displayStaff(user, document.getElementById("stfSrc").value);
        console.log("Seaching for '" + document.getElementById("stfSrc").value + "'.")
    });
});

async function displayStaff(user, src){
    const list = document.getElementById("staffListed");
    list.innerHTML = ""; 
    const orderStaff = [];
    const staffSnapshot = await getDocs(collection(db, "users"));
    staffSnapshot.forEach((staffdoc) => {
        orderStaff.push({ id: staffdoc.id, ...staffdoc.data() });
    });
    orderStaff.sort((a, b) => b.createdAt - a.createdAt);
    const roleRef = user ? await getDoc(doc(db, "roles", user.uid)) : null;
    const currentUserRole = roleRef?.data();
    for (const staff of orderStaff) {
        if(staff.name.toLowerCase().startsWith(src.toLowerCase()) && document.getElementById("stfOp").value == "Username" || staff.id?.toLowerCase().startsWith(src.toLowerCase()) && document.getElementById("stfOp").value == "ID Number" ){
        const staffRef = await getDoc(doc(db, "roles", staff.id));

        const mainDiv = document.createElement("div");
        mainDiv.className = "staffDiv";
        list.appendChild(mainDiv);

        const staffrole = document.createElement("span");

        if (staffRef.data().owner) {
            staffrole.textContent = "Owner,";
        } else if (staffRef.data().management) {
            staffrole.textContent = "Management,";
        } else if (staffRef.data().chef) {
            staffrole.textContent = "Chef,";
        } else if (staffRef.data().waiter) {
            staffrole.textContent = "Waiter,";
        } else {
            staffrole.textContent = "Customer,";
        }

        const staffinfo = document.createElement("p");
        staffinfo.appendChild(staffrole);
        staffinfo.textContent += ` ${staff.name} | ${staff.id} `;
        mainDiv.appendChild(staffinfo);
        

        const staffdd = document.createElement("select");
        staffinfo.appendChild(staffdd);

        const cusSelect = new Option("Customer", "p");
        const waitSelect = new Option("Waiter", "w");
        const chefSelect = new Option("Chef", "c");
        const manSelect = new Option("Management", "m");
        const ownSelect = new Option("Owner", "o");


        staffdd.append(cusSelect, waitSelect, chefSelect, manSelect, ownSelect);

        if (currentUserRole?.management) {
            manSelect.disabled = true;
            ownSelect.disabled = true;

            if (staffRef.data().owner || staffRef.data().management) {
                staffdd.disabled = true;
            }
        }
        
        if (staff.id === user.uid) {
                staffdd.disabled = true;
            }

        if (staffRef.data().owner){
            ownSelect.selected = true;
        }
        else if (staffRef.data().management) {
            manSelect.selected = true;
        }
        else if (staffRef.data().chef){
            chefSelect.selected = true;
        }
        else if (staffRef.data().waiter){
            waitSelect.selected = true;
        }
        else{
            cusSelect.selected = true;
        }

        staffdd.addEventListener("change", async (event) => {
        const value = event.target.value;

        if (value === "p") {
            console.log("Customer");
        } 
        else if (value === "w") {
            console.log("Waiter");
        } 
        else if (value === "c") {
            console.log("Chef");
        } 
        else if (value === "m") {
            console.log("Management");
        } 
        else if (value === "o") {
            console.log("Owner");
        }
    });
    }
    }
}

/*async function search(ur) {
    const srcBt = document.getElementById("stfSrcBtt");
    displayStaff(ur);
    srcBt.addEventListener("click", async (event) =>{
      if(document.getElementById("stfSrc").value == ""){
        displayStaff(ur);
        console.log("Search Box is Empty");
      }
      else{
        document.getElementById("staffListed").innerHTML = "";
        console.log("Search Box isn't Empty");
      }
      });
}*/