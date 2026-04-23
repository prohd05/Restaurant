import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { updateDoc, deleteDoc, setDoc, collection, doc, addDoc, getDoc ,getDocs, serverTimestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Listen for auth state changes
  onAuthStateChanged(auth, async (user) => {
  if (user) {
  const typeBut = document.getElementById("typeBtt");
  let type = false;
  listenToCart(user);
  load(user, type);
  typeBut.addEventListener("click", () => {
      typeBut.disabled = true;   
      //console.log(type);
          type = !type;
          if(type){
            document.getElementById("typeBtt").textContent = "View Menu";
          }
          else{
            document.getElementById("typeBtt").textContent = "View Order";
          }
          document.getElementById("MenuListed").innerHTML = "";
          load(user, type);
      setTimeout(() => {
          typeBut.disabled = false;
      }, 600);
  });
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
            price: parseInt(item.price),
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
              menuTop.style.visibility = "hidden";
              totalText.textContent = "Total: $0";
              return;
          }
          else{
            menuTop.style.visibility = "visible";
          }

          const items = snap.data().items || [];
          let total = 0;
          items.forEach(item => {
              const itemTotal = item.price * item.qty;
              total += itemTotal;
          });
          total = total.toFixed(2);
          totalText.textContent = "Your Total: $" + total;
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

    let subtotal = 0;
    items.forEach(item => {
        subtotal += item.price * item.qty;
    });

    const tax = subtotal * 0.06625;
    const total = parseInt(subtotal + tax);

    try {
        await addDoc(collection(db, "orders"), {
            userId: user.uid,
            user: user.displayName,
            items: items,
            total: total.toFixed(2),
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

// Return Main Area
    async function load(user, type){
      const list = document.getElementById("MenuListed");
      if (type == false){
        //document.getElementById("areaSelect").style.visibility = "visible";
        list.innerHTML = "";

        const startT = document.createElement("h2");
        startT.textContent = "Appetizers";
        startT.id = "sa";
        startT.className = "sectionTitle";
        list.appendChild(startT);
        const stDiv = document.createElement("div");
        stDiv.class = "menuRow";
        stDiv.id = "Appetizers";
        stDiv.className="sectionArea";
        list.append(stDiv);
        await displayFood("Appetizer", user, stDiv);

        const mainT = document.createElement("h2");
        mainT.textContent = "Main Meals";
        mainT.id = "sm";
        mainT.className = "sectionTitle";
        list.appendChild(mainT); 
        const mDiv = document.createElement("div");
        mDiv.class = "menuRow";
        mDiv.id = "Mains";
        mDiv.className="sectionArea";
        list.append(mDiv);
        await displayFood("Main", user, mDiv);

        /*const sideT = document.createElement("h2");
        sideT.textContent = "Sides";
        sideT.id = "ss";
        sideT.className = "sectionTitle";
        list.appendChild(sideT);
        const sDiv = document.createElement("div");
        sDiv.class = "menuRow";
        sDiv.id = "Sides";
        sDiv.className="sectionArea";
        list.append(sDiv);
        await displayFood("Side", user, sDiv);*/

        const bevT = document.createElement("h2");
        bevT.textContent = "Beverages";
        bevT.id = "sb";
        bevT.className = "sectionTitle";
        list.appendChild(bevT);
        const bDiv = document.createElement("div");
        bDiv.class = "menuRow";
        bDiv.id = "Beverages";
        bDiv.className="sectionArea";
        list.append(bDiv);
        await displayFood("Beverage", user, bDiv);

        const dessT = document.createElement("h2");
        dessT.textContent = "Desserts";
        dessT.id = "sd";
        dessT.className = "sectionTitle";
        list.appendChild(dessT);
        const dDiv = document.createElement("div");
        dDiv.class = "menuRow";
        dDiv.id = "Dessert";
        dDiv.className="sectionArea";
        list.append(dDiv);
        await displayFood("Dessert", user, dDiv);
      }
      else{
        list.innerHTML = "";
        await displayFood("Cart", user);
        //document.getElementById("areaSelect").style.visibility = "hidden";
      }
    }

  // Load Main Page
    async function displayFood(type, user, div){
      const list = document.getElementById("MenuListed");
      
      // View Pending Order
      if (type == "Cart"){
        /*const menSide = document.querySelectorAll(".publicLinks");
        menSide.forEach(el => {
            el.style.visibility = "hidden";
        });*/

        document.getElementById("homeTitle").style.visibility = "hidden";

        const items = await getCart(user);
        const TAX_RATE = 0.06625;
        let subtotal = 0;
        items.forEach(item => {
            const mainDiv = document.createElement("div");
            mainDiv.className = "cartDiv"

            const name = document.createElement("h2");
            name.textContent = item.title;
            name.style.color = "white";
            name.className = "cartTitle"

            const price = document.createElement("h2");
            const itemTotal = item.price * item.qty;
            price.textContent = "$" + itemTotal;
            price.style.color = "white";
            subtotal += itemTotal;
            price.className = "cartPrice"

            const removeBtn = document.createElement("button");
            removeBtn.textContent = "-";
            removeBtn.className = "cartRemove"
            removeBtn.addEventListener("click", async () => {
                await removeFromCart(user, item.itemID);
            });

            mainDiv.appendChild(name);
            mainDiv.appendChild(price);
            mainDiv.appendChild(removeBtn);
            list.appendChild(mainDiv);
        });
        const tax = subtotal * TAX_RATE;
        const total = subtotal + tax;
        const summary = document.createElement("div");
        summary.id = "cartSummary";

        const subText = document.createElement("p");
        subText.textContent = `Subtotal: $${subtotal.toFixed(2)}`;

        const taxText = document.createElement("p");
        taxText.textContent = `Tax: $${tax.toFixed(2)}`;

        const totalText = document.createElement("p");
        totalText.textContent = `Total: $${total.toFixed(2)}`;

        summary.appendChild(subText);
        summary.appendChild(taxText);
        summary.appendChild(totalText);

        list.appendChild(summary);
        
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
      document.getElementById("homeTitle").style.visibility = "visible";
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
          div.appendChild(mainDiv);

          const title = document.createElement("h4");
          title.textContent = item.title;
          mainDiv.appendChild(title);

          const picture = document.createElement("img");
          picture.src = item.picture;
          picture.className = "menuPic";
          //picture.width = "100";
          //picture.height = "100";
          mainDiv.appendChild(picture);

          const bottom = document.createElement("div")
          bottom.className = "bttm"
          mainDiv.appendChild(bottom);

          const addItem = document.createElement("button");
          addItem.textContent = "Add Item";
          addItem.className = "addItem"
          bottom.appendChild(addItem);
          
          const price = document.createElement("h4");
          price.textContent = "$" + item.price;
          price.className = "menuPrice"
          bottom.appendChild(price);

          addItem.addEventListener("click", async () => {
              await addToCart(user, item);
          });
        }
      };
    };
  };