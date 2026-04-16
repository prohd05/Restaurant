import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { updateDoc, collection, doc, addDoc, getDoc ,getDocs, serverTimestamp} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const userRef = await getDoc(doc(db, "users", user.uid));
            const roleRef = await getDoc(doc(db, "roles", user.uid));

            if (roleRef.data().chef || roleRef.data().waiter || !roleRef.data().owner && !roleRef.data().management) {
                window.location.href = "home.html";
            }

        } catch (error) {
            console.error("Error fetching user:", error); 
        }
    }

    displayStaff(user); // pass user
});

async function displayStaff(user){
    const list = document.getElementById("staffListed");
    list.innerHTML = ""; 

    const orderStaff = [];
    const staffSnapshot = await getDocs(collection(db, "users"));

    // Collect
    staffSnapshot.forEach((staffdoc) => {
        orderStaff.push({ id: staffdoc.id, ...staffdoc.data() });
    });

    // Sort ONCE
    orderStaff.sort((a, b) => b.createdAt - a.createdAt);

    // Get current user's role
    const roleRef = user ? await getDoc(doc(db, "roles", user.uid)) : null;
    const currentUserRole = roleRef?.data();

    // Render
    for (const staff of orderStaff) {
        const staffRef = await getDoc(doc(db, "roles", staff.id));

        const mainDiv = document.createElement("div");
        mainDiv.className = "staffDiv";
        list.appendChild(mainDiv);

        const staffrole = document.createElement("span");

        if (staffRef.data().owner) {
            staffrole.textContent = "Owner";
        } else if (staffRef.data().management) {
            staffrole.textContent = "Management";
        } else if (staffRef.data().chef) {
            staffrole.textContent = "Chef";
        } else if (staffRef.data().waiter) {
            staffrole.textContent = "Waiter";
        } else {
            staffrole.textContent = "Customer";
        }

        const staffinfo = document.createElement("p");
        staffinfo.textContent = `${staff.name} | ${staff.id} | `;
        mainDiv.appendChild(staffinfo);
        staffinfo.appendChild(staffrole);

        const staffdd = document.createElement("select");
        staffinfo.appendChild(staffdd);

        const cusSelect = new Option("Customer", "p");
        const waitSelect = new Option("Waiter", "w");
        const chefSelect = new Option("Chef", "c");
        const manSelect = new Option("Management", "m");
        const ownSelect = new Option("Owner", "o");

        staffdd.append(cusSelect, waitSelect, chefSelect, manSelect, ownSelect);

        // Restrict permissions
        if (currentUserRole?.management) {
            manSelect.disabled = true;
            ownSelect.disabled = true;

            if (staffRef.data().owner || staffRef.data().management) {
                staffdd.disabled = true;
            }
        }

        // Set selected
        if (staffRef.data().owner) ownSelect.selected = true;
        else if (staffRef.data().management) manSelect.selected = true;
        else if (staffRef.data().chef) chefSelect.selected = true;
        else if (staffRef.data().waiter) waitSelect.selected = true;
        else cusSelect.selected = true;
    }
}