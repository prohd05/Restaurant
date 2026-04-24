import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { onSnapshot, deleteDoc, updateDoc, collection, doc, addDoc, setDoc, getDoc ,getDocs, serverTimestamp} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Listen for auth state changes
onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        //const pfp = document.getElementById("hPFP"); // Get the element to display the profile picture
        //const name = document.getElementById("hName"); // Get the element to display the username
        //const role = document.getElementById("hRole"); // Get the element to display the username
        //name.textContent = user.displayName; // Set the username in the navbar
        //pfp.src = user.photoURL; // Set the profile picture in the navbar
        
        const userRef = await getDoc(doc(db, "roles", user.uid));
  
        if(userRef.data().owner){
          
        }
        else if(userRef.data().management){
          
        }
        else if(userRef.data().chef){
          document.getElementById("addIngTotal").remove();
          document.getElementById("addMenuTotal").remove();
        }
        else if(userRef.data().waiter){
          window.location.href = "home.html";
        }
        else{
            window.location.href = "home.html";

        }
  
      } catch (error) {
        console.error("Error fetching user:", error); 
      }
    } else {
      setTimeout(() => {
        window.location.href = "signin.html";
      }, 1000);
    }

    viewInventory();
    viewMenu();

    const addIngForm = document.getElementById("addIng");
    addIngForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      addInventory();
    });

    const addMenuForm = document.getElementById("addMeal");
    addMenuForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      addMenuItem();
    });
  });

  async function addInventory() {
    const itemName = document.getElementById("ogName").value;
    const itemAmount = parseInt(document.getElementById("ogAmount").value);
    const itemType = document.getElementById("ogType").value;
    const itemPrice = parseInt(document.getElementById("ogPrice").value);
    const itemLow = parseInt(document.getElementById("ogLow").value);
    const addButton = document.getElementById("ogAdd");
      try {
        await setDoc(doc(db, "inventory", itemName), {
            name: itemName,
            amount: itemAmount,
            lowAmount: itemLow,
            measurement: itemType,
            pricePer: itemPrice,
            createdAt: serverTimestamp(),
            menuItems: []
        });
        document.getElementById("ogName").value = "";
        document.getElementById("ogAmount").value = "";
        document.getElementById("ogType").value = "";
        document.getElementById("ogLow").value = "";
        document.getElementById("ogPrice").value = "";
        viewInventory();
    } catch (err) {
        console.error(err);
    }
  }

  async function addMenuItem(){
    const title = document.getElementById("mealTitle").value;
    const type = document.getElementById("mealType").value;
    const img = document.getElementById("mealImg").value;
    const price = parseFloat(document.getElementById("mealPrice").value);
    try {
        const newDoc = await addDoc(collection(db, "menu"), {
            title: title,
            type: type,
            picture: "assets/menu/" + img + ".png",
            price: price,
            createdAt: serverTimestamp()
        });
        document.getElementById("mealTitle").value = "";
        document.getElementById("mealImg").value = "";
        document.getElementById("mealPrice").value = "";
        viewMenu();
        viewInventory();
        } catch (err) {
            console.error(err);
        }
  };

  async function viewInventory(){
    const list = document.getElementById("viewInventory");
        list.innerHTML = ""; 
        const ordersInv = [];
        const InvSnapshot = await getDocs(collection(db, "inventory"));
        InvSnapshot.forEach((staffdoc) => {
          ordersInv.push({ id: staffdoc.id, ...staffdoc.data() });
        });
        ordersInv.sort((a, b) => a.name.localeCompare(b.name));
        for (const item of ordersInv) {
          const mainDiv = document.createElement("div");
          mainDiv.className = "invDiv"
          list.appendChild(mainDiv);

          const leftDiv = document.createElement("div");
          leftDiv.className = "leftInv"
          mainDiv.appendChild(leftDiv);

          const name = document.createElement("h4");
          name.textContent = "Item: " + item.name;
          leftDiv.appendChild(name);

          const price = document.createElement("h4");
          price.textContent = "Price: $" + item.pricePer + " per " + item.measurement;
          leftDiv.appendChild(price);

          const low = document.createElement("h4");
          low.textContent = "LOW STOCK";
          low.style.color = "red";
          leftDiv.appendChild(low);
          function lowUpdate(){
            if(item.amount > item.lowAmount){
              low.style.visibility = "hidden";
            }
            else{
              low.style.visibility = "visible";
            }
          }

          lowUpdate();

          const amountRef = doc(db, "inventory", item.id);
          const amount = document.createElement("h4");
          amount.textContent = "Amount: " + item.amount + " " + item.measurement;
          leftDiv.appendChild(amount);

          onSnapshot(amountRef, (uItem) => {
          if (uItem.exists()) {
              const data = uItem.data();
              item.amount = data.amount;
              amount.textContent = "Amount: " + data.amount + " " + data.measurement;
              low.style.display = data.amount > data.lowAmount ? "none" : "block";
          }
          lowUpdate();
      });

          const addAmount = document.createElement("button");
          addAmount.textContent = "+";
          leftDiv.appendChild(addAmount);

          const amountV = document.createElement("input");
          amountV.type = "number";
          amountV.placeholder = "Amount";
          amountV.min = "1";
          leftDiv.appendChild(amountV);

          addAmount.addEventListener("click", async () => {
              let change = parseInt(amountV.value) || 1;
              let newAmount = parseInt(item.amount) + change;

              try {
                  await updateDoc(amountRef, {
                      amount: newAmount
                  });
              } catch (error) {
                  console.error(error);
              }
          });

          const minusAmount = document.createElement("button");
          minusAmount.textContent = "-";
          leftDiv.appendChild(minusAmount);

          minusAmount.addEventListener("click", async () => {
              let change = parseInt(amountV.value) || 1;
              let newAmount = parseInt(item.amount) - change;

              if (newAmount < 0) {
                  newAmount = 0;
              }

              try {
                  await updateDoc(amountRef, {
                      amount: newAmount
                  });
                  } catch (error) {
                  console.error(error);
              }
          });

          const rightDiv = document.createElement("div");
          rightDiv.className = "rightInv"
          mainDiv.appendChild(rightDiv); 

          const menuDrop = document.createElement("select");
          menuDrop.className = "menuDrop";
          rightDiv.appendChild(menuDrop); 

          const menuAmount = document.createElement("input");
          menuAmount.className = "menuInput";
          menuAmount.type = "number";
          menuAmount.placeholder = "Amount"
          rightDiv.appendChild(menuAmount); 

          const addMenu = document.createElement("button");
          addMenu.textContent = "+";
          rightDiv.appendChild(addMenu); 
          
          const itemList = document.createElement("div");
          itemList.className = "itemList";

          const menuSnapshot = await getDocs(collection(db, "menu"));
          const menuItems = [];
          menuSnapshot.forEach((docSnap) => {
            menuItems.push({ id: docSnap.id, ...docSnap.data() });
          });
          menuItems.sort((a, b) => a.title.localeCompare(b.title));

          async function inventoryMenu(id) {
            itemList.innerHTML = "";
            menuDrop.innerHTML = "";

            const invRef = doc(db, "inventory", id);
            const invSnap = await getDoc(invRef);

            const ordersItem = invSnap.data().menuItems || [];
            ordersItem.sort((a, b) => a.title.localeCompare(b.title));

            const existingIds = ordersItem.map(item => item.id);
            menuItems
                .filter(menuItem => !existingIds.includes(menuItem.id))
                .forEach((menuItem) => {
                    const option = document.createElement("option");
                    option.value = menuItem.id;
                    option.textContent = menuItem.title;
                    menuDrop.appendChild(option);
                });

            ordersItem.forEach((item, index) => {
                const mainDiv = document.createElement("div");
                mainDiv.className = "iNVtemDiv";
                itemList.appendChild(mainDiv);

                const title = document.createElement("h4");
                title.textContent = item.title + " (" + item.amount + ")";
                mainDiv.appendChild(title);

                const remove = document.createElement("button");
                remove.textContent = "-";
                mainDiv.appendChild(remove);

                remove.addEventListener("click", async () => {
                    let items = invSnap.data().menuItems || [];
                    items.splice(index, 1);

                    await updateDoc(invRef, {
                        menuItems: items
                    });

                    inventoryMenu(id);
                });
            });
        }

          addMenu.addEventListener("click", async () => {
          const selectedId = menuDrop.value;
          const selectedTitle = menuDrop.options[menuDrop.selectedIndex].textContent;
          const selectedAmount = parseInt(menuAmount.value) || 1;

          try {
              const invSnap = await getDoc(amountRef);

              let menuItems = [];
              if (invSnap.exists()) {
                  menuItems = invSnap.data().menuItems || [];
              }

              menuItems.push({
                  id: selectedId,
                  title: selectedTitle,
                  amount: selectedAmount
              });

              await updateDoc(amountRef, {
                  menuItems: menuItems
              });
              inventoryMenu(item.id);
              
              } catch (error) {
                  console.error(error);
              }
            menuAmount.value = "";
          });
          rightDiv.appendChild(itemList);
          inventoryMenu(item.id);
    }
  };

  async function viewMenu(){
    const list = document.getElementById("viewMenu");
        list.innerHTML = ""; 
        const ordersInv = [];
        const InvSnapshot = await getDocs(collection(db, "menu"));
        InvSnapshot.forEach((staffdoc) => {
          ordersInv.push({ id: staffdoc.id, ...staffdoc.data() });
        });
        ordersInv.sort((a, b) => a.title.localeCompare(b.title));
        for (const item of ordersInv) {
          const mainDiv = document.createElement("div");
          mainDiv.className = "menInvDiv"
          list.appendChild(mainDiv);

          const title = document.createElement("h4");
          title.textContent = item.title;
          mainDiv.appendChild(title);

          const type = document.createElement("h4");
          type.textContent = item.type;
          mainDiv.appendChild(type);

          const price = document.createElement("h4");
          price.textContent = "$" + item.price;
          mainDiv.appendChild(price);

          const removeButton = document.createElement("button");
          removeButton.textContent = "-";
          mainDiv.appendChild(removeButton);

          removeButton.addEventListener("click", async () => {
            if (confirm("Delete " + item.title + "?")) {
                try {
                    await deleteDoc(doc(db, "menu", item.id));
                    viewMenu();
                } catch (error) {
                    console.error("Error deleting item:", error);
                };
            };
          });
      };
  };