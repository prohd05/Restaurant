import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { updateDoc, deleteDoc, setDoc, collection, doc, addDoc, getDoc ,getDocs, serverTimestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Listen for auth state changes
  onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const pfp = document.getElementById("hPFP"); // Get the element to display the profile picture
      const name = document.getElementById("hName"); // Get the element to display the username
      const role = document.getElementById("hRole"); // Get the element to display the username
      name.textContent = user.displayName; // Set the username in the navbar
      pfp.src = user.photoURL; // Set the profile picture in the navbar
      
      const userRef = await getDoc(doc(db, "users", user.uid));
      const roleRef = await getDoc(doc(db, "roles", user.uid));

      if(roleRef.data().owner){
        role.textContent ="Role: Owner";
      }
      else if(roleRef.data().management){
        role.textContent ="Role: Management";
      }
      else if(roleRef.data().chef){
        role.textContent ="Role: Chef";
      }
      else if(roleRef.data().waiter){
        role.textContent ="Role: Waiter";
      }
      else{
        role.textContent ="Role: Customer";
      }

    } catch (error) {
      console.error("Error fetching user:", error); 
    }
  } else {
    setTimeout(() => {
      window.location.href = "signin.html";
    }, 1000);
  }

  const typeBut = document.getElementById("typeBtt");
  let type = false;
  listenToCart(user);
  load(user, type);
  typeBut.addEventListener("click", () => {
      typeBut.disabled = true;   
      
      //console.log(type);
      setTimeout(() => {
          type = !type;
          if(type){
            document.getElementById("typeBtt").textContent = "View Menu";
          }
          else{
            document.getElementById("typeBtt").textContent = "View Order";
          }
          load(user, type);
          typeBut.disabled = false;
          
      }, 500);
  });
});

/// Sign Out Button
    const logoutButton = document.getElementById("hSignout"); // Select the logout button using its ID
    logoutButton.addEventListener("click", async () => {
    try {
    await signOut(auth);
    //alert("Logged out successfully!");
    window.location.href = "signin.html";
    } catch (error) {
    console.log("Error logging out: " + error.message);
    }
    });

    
// Place Order to Cart
    async function addToCart(user, item) {
    const ref = doc(db, "carts", user.uid);
    const snap = await getDoc(ref);
    let items = [];
    if (snap.exists()) {
        items = snap.data().items || [];
    }
        items.push({
            itemID: item.id,
            title: item.title,
            price: item.price,
            qty: 1
        });
    await setDoc(ref, { items }, { merge: true });
}

// Remove Order from Cart

async function removeFromCart(user, index) {
    const ref = doc(db, "carts", user.uid);
    const snap = await getDoc(ref);
    let items = snap.data().items || [];
    if (index < 0 || index >= items.length) return;
    items.splice(index, 1);
    await setDoc(ref, { items }, { merge: true });
    load(user, true);
}

// Return Order
async function getCart(user) {
    const ref = doc(db, "carts", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()){
       return [];
    }
    else{
      return snap.data().items;
    }
  }

    function listenToCart(user) {
      const ref = doc(db, "carts", user.uid);
      onSnapshot(ref, (snap) => {
          const totalText = document.getElementById("menuAmount");
          const menuTop = document.getElementById("menuTop");

          if (!snap.exists()) {
              menuTop.style.display = "none";
              totalText.textContent = "Total: $0";
              return;
          }
          else{
            menuTop.style.display = "block";
          }

          const items = snap.data().items || [];
          let total = 0;
          items.forEach(item => {
              const itemTotal = item.price * item.qty;
              total += itemTotal;
          });

          totalText.textContent = "Total: $" + total;
      });
  }

  // Place Order
  async function placeOrder(user) {
    const cartRef = doc(db, "carts", user.uid);
    const cartSnap = await getDoc(cartRef);
    if (!cartSnap.exists()) {
        alert("Cart is empty");
        return;
    }

    const items = cartSnap.data().items || [];

    if (items.length === 0) {
        alert("Cart is empty");
        return;
    }

    let total = 0;
    items.forEach(item => {
        total += item.price * item.qty;
    });

    try {
        await addDoc(collection(db, "orders"), {
            userId: user.uid,
            user: user.displayName,
            items: items,
            total: total,
            status: "pending",
            createdAt: serverTimestamp()
        });
        alert("Your order has been placed!")
        await deleteDoc(cartRef);
        window.location.reload();
    } catch (error) {
        console.error("Order error:", error);
    }
}

// Load Main Area
    async function load(user, type){
      const list = document.getElementById("MenuListed");
      if (type == false){
        list.innerHTML = "";

        const mainT = document.createElement("h1");
        mainT.textContent = "Mains";
        const mart = document.createElement("hr");
        list.appendChild(mainT); 
        await displayFood("Main", user);
        list.appendChild(mart);

        const sideT = document.createElement("h1");
        sideT.textContent = "Sides";
        const sart = document.createElement("hr");
        list.appendChild(sideT);
        await displayFood("Side", user);
        list.appendChild(sart);

        const drinkT = document.createElement("h1");
        drinkT.textContent = "Drinks";
        list.appendChild(drinkT);
        await displayFood("Drink", user);
      }
      else{
        list.innerHTML = "";
        await displayFood("Cart", user);
      }
    }

    async function displayFood(type, user){
      const list = document.getElementById("MenuListed");
      
      // View Pending Order
      if (type == "Cart"){
        const items = await getCart(user);
        items.forEach(item => {
            const mainDiv = document.createElement("div");

            const name = document.createElement("p");
            name.textContent = `${item.title} x${item.qty}`;

            const price = document.createElement("p");
            const itemTotal = item.price * item.qty;
            price.textContent = "$" + itemTotal;

            const removeBtn = document.createElement("button");
            removeBtn.textContent = "-";

            removeBtn.addEventListener("click", async () => {
                await removeFromCart(user, item.itemID);
            });

            
            
            list.appendChild(mainDiv);
            mainDiv.appendChild(name);
            mainDiv.appendChild(price);
            mainDiv.appendChild(removeBtn);
            
        });
        
        const checkoutBtn = document.createElement("button");
        checkoutBtn.textContent = "Place Order";
        checkoutBtn.id = "checkoutBtn";
        list.appendChild(checkoutBtn);
        checkoutBtn.addEventListener("click", async () => {
          checkoutBtn.disabled = true;
          checkoutBtn.textContent = "Placing Order...";
          try {
              await placeOrder(user);
          } catch{
            alert("Error: " + error.message);
          }
      });
        }
        
      // View Menu
      else{
      const orderMenu = [];
      const menuSnapshot = await getDocs(collection(db, "menu"));
      menuSnapshot.forEach((allItems) => {
          orderMenu.push({ id: allItems.id, ...allItems.data() });
      });
      orderMenu.sort((a, b) => a.createdAt - b.createdAt);
      for (const item of orderMenu) {
        if (item.type === type) {
          const mainDiv = document.createElement("div");
          mainDiv.className = "menuDiv";
          list.appendChild(mainDiv);

          const title = document.createElement("p");
          title.textContent = item.title;
          mainDiv.appendChild(title);

          const picture = document.createElement("img");
          picture.src = item.picture;
          picture.className = "menuPic"
          picture.width = "50";
          picture.height = "50";
          mainDiv.appendChild(picture);

          const bottom = document.createElement("Btm")
          mainDiv.appendChild(bottom);
          
          const price = document.createElement("p");
          price.textContent = "$" + item.price;
          bottom.appendChild(price);

          const addItem = document.createElement("button");
          addItem.textContent = "Add Item";
          bottom.appendChild(addItem);

          addItem.addEventListener("click", async () => {
              await addToCart(user, item);
          });
        }
      };
    };
  };