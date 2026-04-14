import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { updateDoc, collection, doc, addDoc, getDoc ,getDocs, serverTimestamp} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Listen for auth state changes
onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        //const pfp = document.getElementById("hPFP"); // Get the element to display the profile picture
        //const name = document.getElementById("hName"); // Get the element to display the username
        //const role = document.getElementById("hRole"); // Get the element to display the username
        //name.textContent = user.displayName; // Set the username in the navbar
        //pfp.src = user.photoURL; // Set the profile picture in the navbar
        
        const userRef = await getDoc(doc(db, "users", user.uid));
  
        if(userRef.data().staffroles.owner){
          //role.textContent ="Role: Owner";
        }
        else if(userRef.data().staffroles.management){
          //role.textContent ="Role: Management";
        }
        else if(userRef.data().staffroles.chef){
          //role.textContent ="Role: Chef";
          window.location.href = "home.html";
        }
        else if(userRef.data().staffroles.waiter){
          //role.textContent ="Role: Waiter";
          window.location.href = "home.html";
        }
        else{
            window.location.href = "home.html";
          //role.textContent ="Role: Customer";
        }
  
      } catch (error) {
        console.error("Error fetching user:", error); 
      }
    } else {
      setTimeout(() => {
        window.location.href = "signin.html";
      }, 1000);
    }
    displayStaff();
  });

  async function displayStaff(){
    const list = document.getElementById("staffListed");
    list.innerHTML = ""; 
    const orderStaff = [];
    const staffSnapshot = await getDocs(collection(db, "users"));
    staffSnapshot.forEach((doc) => {
        orderStaff.push({ id: doc.id, ...doc.data() });
        orderStaff.sort((a, b) => b.createdAt - a.createdAt); // Sort comments by createdAt in descending order
        orderStaff.forEach(async (staff) => {
                const user = auth.user;

                const mainDiv =  document.createElement("div");
                mainDiv.className = "staffDiv";
                list.appendChild(mainDiv);

                const staffrole = document.createElement("span");
                staffrole.textContent ="";

                if(staff.staffroles.owner){
                    staffrole.textContent ="Owner";
                }
                else if(staff.staffroles.management){
                    staffrole.textContent ="Chef";
                }
                else if(staff.staffroles.chef){
                    staffrole.textContent ="Chef";
                }
                else if(staff.staffroles.waiter){
                    staffrole.textContent ="Waiter";
                }
                else{
                    staffrole.textContent ="Customer";
                }
                const staffinfo = document.createElement("p");
                staffinfo.textContent = staff.name + " | " + staff.id + " | " ;
                mainDiv.appendChild(staffinfo);
                staffinfo.appendChild(staffrole);

                const staffdd = document.createElement("select")
                staffinfo.appendChild(staffdd);

                if(user.owner){
                    
                }
                else if(user.staffroles.management){
                    staffrole.textContent ="Chef";
                }
                
        });
      });
  };
