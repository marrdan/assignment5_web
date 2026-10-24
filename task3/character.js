// ----- Constants -----
const TOTAL_POINTS = 20;
const HIGH_SKILL = 8; // a skill above this value is "high"
const MAX_HIGH_SKILLS = 1;
const takenNames = ["gandalf", "aragorn", "legolas"];
const classRules = {
  mage: { skill: "magic", min: 5 },
  warrior: { skill: "strength", min: 5 },
  rogue: { skill: "agility", min: 5 }
};
const skillIds = ["strength", "magic", "agility", "luck"];
const groups = ["name", "class", "color", "skills"];

// A group is checked only after the user left it (blur) or tried to submit
const touched = { name: false, class: false, color: false, skills: false };

// ----- Page elements -----
const form = document.getElementById("charForm");
const nameInput = document.getElementById("name");
const classSelect = document.getElementById("charClass");
const colorSelect = document.getElementById("color");
const summaryBox = document.getElementById("summary");
const pointsLeftBox = document.getElementById("pointsLeft");
const preview = document.getElementById("preview");
const result = document.getElementById("result");
const emptyResult = document.getElementById("emptyResult");

form.noValidate = true; // turn off browser messages, HTML attributes stay

function getSkill(id) {
  return Number(document.getElementById(id).value);
}

function getPointsUsed() {
  let sum = 0;
  for (const id of skillIds) {
    sum = sum + getSkill(id);
  }
  return sum;
}

function getFields(group) {
  return document.querySelectorAll('[data-group="' + group + '"]');
}

// ----- Rules: returns an error text, or "" if the group is correct -----
function getError(group) {
  if (group === "name") {
    const name = nameInput.value.trim();
    if (nameInput.validity.valueMissing || name === "") {
      return "Enter a name.";
    }
    if (name.length < 3) {
      return "The name must have at least 3 characters.";
    }
    if (takenNames.includes(name.toLowerCase())) {
      return "This name is already taken.";
    }
    return "";
  }

  if (group === "class") {
    if (!classSelect.checkValidity()) {
      return "Choose a class.";
    }
    const rule = classRules[classSelect.value];
    if (getSkill(rule.skill) < rule.min) {
      return "A " + classSelect.value + " needs " + rule.skill + " " + rule.min + " or more.";
    }
    return "";
  }

  if (group === "color") {
    if (!colorSelect.checkValidity()) {
      return "Choose a color.";
    }
    return "";
  }

  // group === "skills"
  for (const id of skillIds) {
    if (!document.getElementById(id).checkValidity()) {
      return "Each skill must be a whole number from 1 to 10.";
    }
  }
  const used = getPointsUsed();
  if (used !== TOTAL_POINTS) {
    return "Use exactly " + TOTAL_POINTS + " points (you used " + used + ").";
  }
  let highCount = 0;
  for (const id of skillIds) {
    if (getSkill(id) > HIGH_SKILL) {
      highCount = highCount + 1;
    }
  }
  if (highCount > MAX_HIGH_SKILLS) {
    return "Only one skill can be above " + HIGH_SKILL + ".";
  }
  return "";
}

// Shows the error under the field and sets aria-invalid
function showError(group) {
  const error = getError(group);
  document.getElementById("err-" + group).textContent = error;
  for (const field of getFields(group)) {
    if (error === "") {
      field.setAttribute("aria-invalid", "false");
    } else {
      field.setAttribute("aria-invalid", "true");
    }
  }
  return error;
}

function clearErrors() {
  for (const group of groups) {
    touched[group] = false;
    document.getElementById("err-" + group).textContent = "";
    for (const field of getFields(group)) {
      field.removeAttribute("aria-invalid");
    }
  }
}

// ----- Card (used for the preview and for the final result) -----
function addText(parent, tag, text) {
  const element = document.createElement(tag);
  element.textContent = text;
  parent.appendChild(element);
  return element;
}

function fillCard(card, name, charClass, color) {
  card.textContent = "";
  card.className = "card";
  if (color !== "") {
    card.classList.add("card-" + color);
  }
  addText(card, "h3", name === "" ? "(no name)" : name);
  addText(card, "p", "Class: " + (charClass === "" ? "-" : charClass));
  const list = document.createElement("ul");
  for (const id of skillIds) {
    addText(list, "li", id + ": " + getSkill(id));
  }
  card.appendChild(list);
}

function updatePreview() {
  const left = TOTAL_POINTS - getPointsUsed();
  pointsLeftBox.textContent = left;
  pointsLeftBox.className = left === 0 ? "ok" : "over";
  fillCard(preview, nameInput.value.trim(), classSelect.value, colorSelect.value);
}

// ----- Events -----
function onChange() {
  updatePreview();
  for (const group of groups) {
    if (touched[group] === true) {
      showError(group); // re-check the groups that were already touched
    }
  }
}

for (const group of groups) {
  for (const field of getFields(group)) {
    field.addEventListener("blur", function () {
      touched[group] = true;
      showError(group);
    });
    field.addEventListener("input", onChange);
    field.addEventListener("change", onChange);
  }
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  let errorCount = 0;
  let firstBad = null;
  for (const group of groups) {
    touched[group] = true;
    if (showError(group) !== "") {
      errorCount = errorCount + 1;
      if (firstBad === null) {
        firstBad = getFields(group)[0];
      }
    }
  }

  if (errorCount > 0) {
    summaryBox.textContent = "The form has " + errorCount + " error(s). Please fix them.";
    summaryBox.className = "message error";
    firstBad.focus();
    return;
  }

  // Success: build the final card with the DOM
  const card = document.createElement("div");
  fillCard(card, nameInput.value.trim(), classSelect.value, colorSelect.value);
  result.appendChild(card);
  emptyResult.classList.add("hidden");
  takenNames.push(nameInput.value.trim().toLowerCase());

  summaryBox.textContent = "Character created!";
  summaryBox.className = "message success";
  form.reset();
  clearErrors();
  updatePreview();
});

updatePreview();
