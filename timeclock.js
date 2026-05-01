import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { updateDoc, arrayUnion, deleteDoc, setDoc, collection, doc, addDoc, getDoc ,getDocs, serverTimestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

let currentUser = null;
let currentRole = null;

const wages = {
  waiter: 16,
  chef: 25,
  management: 30
};

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
    const roleSnap = await getDoc(doc(db, "roles", user.uid));
    currentRole = roleSnap.data();
    currentUser = user;

    const shiftRef = doc(db, "shifts", user.uid);
    const shiftSnap = await getDoc(shiftRef);
    const btn = document.getElementById("clock");
    if (shiftSnap.exists() && shiftSnap.data().activeShift) {
        btn.textContent = "Clock Out";
    } else {
        btn.textContent = "Clock In";
    }

    setupClockButton();
    loadShifts();
});

function getRole() {
  if (currentRole.owner){
    return "management";
  }
  if (currentRole.management){
    return "management";
  } 
  if (currentRole.chef){
     return "chef";
  }
  if (currentRole.waiter){
     return "waiter";
  }
}

function setupClockButton() {
  const btn = document.getElementById("clock");

  btn.addEventListener("click", async () => {
    const shiftRef = doc(db, "shifts", currentUser.uid);
    const snap = await getDoc(shiftRef);

    let data = snap.exists() ? snap.data() : {};
    
    // CLOCK IN
    if (!data.activeShift) {
      await setDoc(shiftRef, {
        activeShift: {
          start: Date.now(),
          role: getRole()
        },
        history: data.history || []
      }, { merge: true });

      btn.textContent = "Clock Out";
    }

    // CLOCK OUT
    else {
      const start = data.activeShift.start;
      const end = Date.now();

      const hours = (end - start) / (1000 * 60 * 60);

      const wage = wages[getRole()] || 0;
      const earnings = parseFloat(hours * wage);

      const newShift = {
        start,
        end,
        hours: parseFloat(hours.toFixed(2)),
        earnings: parseFloat(earnings.toFixed(2)),
        role: getRole()
      };

      await updateDoc(shiftRef, {
        activeShift: null,
        history: [...(data.history || []), newShift]
      });

       await addDoc(collection(db, "accounting"), {
          user: currentUser.displayName,
          type: "shifts",
          item: parseFloat(hours.toFixed(2)),
          pricePer: wages[getRole()] || 0,
          totalPrice: parseFloat(earnings.toFixed(2)),
          timestamp: serverTimestamp()
      });

      btn.textContent = "Clock In";
    }

    loadShifts();
  });
}

async function loadShifts() {
  const container = document.getElementById("viewShifts");
  container.innerHTML = "";

  const shiftRef = doc(db, "shifts", currentUser.uid);
  const snap = await getDoc(shiftRef);

  if (!snap.exists()) return;

  const history = snap.data().history || [];

  history
    .sort((a, b) => b.start - a.start)
    .forEach(shift => {
      const div = document.createElement("div");
      div.className = "shiftDiv";

      const start = new Date(shift.start).toLocaleString();
      const end = new Date(shift.end).toLocaleString();

      const role = document.createElement("p");
        role.textContent = "Role: " + shift.role;
        div.appendChild(role);

        const startP = document.createElement("p");
        startP.textContent = "Start: " + start;
        div.appendChild(startP);

        const endP = document.createElement("p");
        endP.textContent = "End: " + end;
        div.appendChild(endP);

        const hours = document.createElement("p");
        hours.textContent = "Hours: " + shift.hours;
        div.appendChild(hours);

        const earnings = document.createElement("p");
        earnings.textContent = "Earnings: $" + shift.earnings;
        div.appendChild(earnings);

      container.appendChild(div);
    });
}