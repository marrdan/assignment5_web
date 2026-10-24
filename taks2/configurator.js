// ----- Data: 12 items, each has id, name, category, price, mount, inStock -----
const items = [
  { id: 1, name: "Wall sink Classic", category: "sink", price: 80, mount: "wall", inStock: true },
  { id: 2, name: "Counter sink Oval", category: "sink", price: 120, mount: "counter", inStock: true },
  { id: 3, name: "Wall sink Large", category: "sink", price: 150, mount: "wall", inStock: true },
  { id: 4, name: "Counter sink Round", category: "sink", price: 140, mount: "counter", inStock: false },
  { id: 5, name: "Wall faucet Chrome", category: "faucet", price: 45, mount: "wall", inStock: true },
  { id: 6, name: "Deck faucet Chrome", category: "faucet", price: 40, mount: "counter", inStock: true },
  { id: 7, name: "Wall faucet Black", category: "faucet", price: 70, mount: "wall", inStock: true },
  { id: 8, name: "Deck faucet Gold", category: "faucet", price: 95, mount: "counter", inStock: true },
  { id: 9, name: "PVC pipe set", category: "pipe", price: 20, mount: "any", inStock: true },
  { id: 10, name: "Copper pipe set", category: "pipe", price: 60, mount: "any", inStock: true },
  { id: 11, name: "Flexible hose set", category: "pipe", price: 15, mount: "any", inStock: true },
  { id: 12, name: "Steel pipe set", category: "pipe", price: 45, mount: "any", inStock: true }
];

const CATEGORIES = ["sink", "faucet", "pipe"];
const MAX_SAVED = 3;

// ----- State -----
let selected = { sink: null, faucet: null, pipe: null }; // chosen item ids
let budget = 300;
let searchText = "";
let message = "";
let savedBuilds = []; // each item: { names, total }

// ----- Page elements -----
const itemsBox = document.getElementById("items");
const totalBox = document.getElementById("total");
const messageBox = document.getElementById("message");
const savedList = document.getElementById("saved");
const budgetInput = document.getElementById("budget");
const searchInput = document.getElementById("search");
const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");

function findItem(id) {
  for (const item of items) {
    if (item.id === id) {
      return item;
    }
  }
  return null;
}

// Total price, calculated with my own loop
function calcTotal() {
  let total = 0;
  for (const category of CATEGORIES) {
    const id = selected[category];
    if (id !== null) {
      total = total + findItem(id).price;
    }
  }
  return total;
}

// Returns the reason why the item cannot be added, or "" if it can
function getBlockReason(item) {
  if (selected[item.category] === item.id) {
    return ""; // already chosen, can be removed
  }
  if (item.inStock === false) {
    return "Out of stock";
  }
  for (const category of CATEGORIES) {
    const otherId = selected[category];
    if (otherId !== null && category !== item.category) {
      const other = findItem(otherId);
      if (item.mount !== "any" && other.mount !== "any" && item.mount !== other.mount) {
        return "Does not fit with " + other.name + " (" + item.mount + " mount, but you chose " + other.mount + ")";
      }
    }
  }
  let newTotal = calcTotal();
  if (selected[item.category] !== null) {
    newTotal = newTotal - findItem(selected[item.category]).price;
  }
  newTotal = newTotal + item.price;
  if (newTotal > budget) {
    return "Over budget by $" + (newTotal - budget);
  }
  return "";
}

function addText(parent, tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) {
    element.className = className;
  }
  parent.appendChild(element);
  return element;
}

// One render function: draws the whole page from the data
function render() {
  // 1. Items
  itemsBox.textContent = "";
  let shown = 0;
  for (const item of items) {
    if (searchText !== "" && !item.name.toLowerCase().includes(searchText)) {
      continue;
    }
    shown = shown + 1;
    const isSelected = selected[item.category] === item.id;
    const reason = getBlockReason(item);

    const card = document.createElement("div");
    card.className = "card";
    card.classList.toggle("selected", isSelected);
    card.classList.toggle("blocked", reason !== "");
    addText(card, "h3", item.name);
    addText(card, "p", item.category + ", $" + item.price + ", mount: " + item.mount);
    if (reason !== "") {
      addText(card, "p", reason, "reason");
    }
    const button = addText(card, "button", isSelected ? "Remove" : "Add");
    button.dataset.id = item.id;
    button.disabled = reason !== "";
    itemsBox.appendChild(card);
  }
  if (shown === 0) {
    addText(itemsBox, "p", "Nothing found. Try another name.", "empty");
  }

  // 2. Total and message
  const total = calcTotal();
  totalBox.textContent = "Total: $" + total + " of $" + budget;
  totalBox.className = total > budget ? "over" : "ok";
  messageBox.textContent = message;
  messageBox.className = "message";

  // 3. Saved builds (the cheapest one is marked)
  savedList.textContent = "";
  let cheapest = null;
  for (const build of savedBuilds) {
    if (cheapest === null || build.total < cheapest) {
      cheapest = build.total;
    }
  }
  if (savedBuilds.length === 0) {
    addText(savedList, "li", "No saved builds yet.", "empty");
  }
  for (const build of savedBuilds) {
    const li = addText(savedList, "li", build.names.join(" + ") + " = $" + build.total);
    li.classList.toggle("cheapest", build.total === cheapest);
  }
}

// One listener on the container for all item buttons (event delegation)
itemsBox.addEventListener("click", function (event) {
  const id = event.target.dataset.id;
  if (id === undefined) {
    return; // click was not on a button
  }
  const item = findItem(Number(id));
  if (selected[item.category] === item.id) {
    selected[item.category] = null;
  } else {
    selected[item.category] = item.id;
  }
  message = "";
  render();
});

budgetInput.addEventListener("input", function () {
  const value = Number(budgetInput.value);
  if (budgetInput.value === "" || value < 0) {
    message = "Enter a budget of 0 or more.";
  } else {
    budget = value;
    message = "";
  }
  render();
});

searchInput.addEventListener("input", function () {
  searchText = searchInput.value.trim().toLowerCase();
  render();
});

saveBtn.addEventListener("click", function () {
  const names = [];
  for (const category of CATEGORIES) {
    if (selected[category] === null) {
      message = "Choose a sink, a faucet and a pipe set first.";
      render();
      return;
    }
    names.push(findItem(selected[category]).name);
  }
  if (savedBuilds.length === MAX_SAVED) {
    message = "You can save only " + MAX_SAVED + " builds. Press Clear saved.";
  } else {
    savedBuilds.push({ names: names, total: calcTotal() });
    message = "Build saved.";
  }
  render();
});

clearBtn.addEventListener("click", function () {
  savedBuilds = [];
  message = "";
  render();
});

render();
