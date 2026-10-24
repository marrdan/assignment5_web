// ----- Constants (all game numbers are here) -----
const CODE_LENGTH = 4;
const MAX_ATTEMPTS = 8;
const MIN_DIGIT = 0;
const MAX_DIGIT = 9;

// ----- Game state -----
let secret = [];
let attemptsLeft = MAX_ATTEMPTS;
let gameOver = false;
let history = []; // each item: { text, right, wrong }

// ----- Page elements -----
const form = document.getElementById("guessForm");
const guessInput = document.getElementById("guess");
const guessBtn = document.getElementById("guessBtn");
const restartBtn = document.getElementById("restartBtn");
const attemptsBox = document.getElementById("attempts");
const messageBox = document.getElementById("message");
const historyList = document.getElementById("history");

// Random whole number from min to max (both included)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Secret code without repeated digits
function makeSecret() {
  const code = [];
  while (code.length < CODE_LENGTH) {
    const digit = randomInt(MIN_DIGIT, MAX_DIGIT);
    if (!code.includes(digit)) {
      code.push(digit);
    }
  }
  return code;
}

// Returns an error text, or "" if the input is correct
function getInputError(text) {
  if (text.length !== CODE_LENGTH) {
    return "Enter exactly " + CODE_LENGTH + " digits.";
  }
  for (let i = 0; i < text.length; i++) {
    if (text[i] < "0" || text[i] > "9") {
      return "Use digits only (0-9).";
    }
  }
  for (let i = 0; i < text.length; i++) {
    for (let j = i + 1; j < text.length; j++) {
      if (text[i] === text[j]) {
        return "Digits must not repeat.";
      }
    }
  }
  return "";
}

// Counts digits in the right place and in the wrong place
function countDigits(text) {
  let right = 0;
  let wrong = 0;
  for (let i = 0; i < CODE_LENGTH; i++) {
    const digit = Number(text[i]);
    if (digit === secret[i]) {
      right = right + 1;
    } else if (secret.includes(digit)) {
      wrong = wrong + 1;
    }
  }
  return { right: right, wrong: wrong };
}

function setMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = "message " + type;
}

// Shows the current state on the page
function showState() {
  attemptsBox.textContent = "Attempts left: " + attemptsLeft + " of " + MAX_ATTEMPTS;
  historyList.textContent = "";
  if (history.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "No guesses yet.";
    empty.className = "empty";
    historyList.appendChild(empty);
  }
  for (const item of history) {
    const li = document.createElement("li");
    li.textContent = item.text + ": " + item.right + " in the right place, " + item.wrong + " in the wrong place";
    historyList.appendChild(li);
  }
  guessInput.disabled = gameOver;
  guessBtn.disabled = gameOver;
}

function startGame() {
  secret = makeSecret();
  attemptsLeft = MAX_ATTEMPTS;
  gameOver = false;
  history = [];
  guessInput.value = "";
  setMessage("", "");
  showState();
  guessInput.focus();
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  if (gameOver === true) {
    return;
  }
  const text = guessInput.value.trim();
  const error = getInputError(text);
  if (error !== "") {
    setMessage(error, "error"); // invalid input: the game state does not change
    return;
  }

  const result = countDigits(text);
  attemptsLeft = attemptsLeft - 1;
  history.push({ text: text, right: result.right, wrong: result.wrong });
  guessInput.value = "";

  if (result.right === CODE_LENGTH) {
    gameOver = true;
    setMessage("You win! The code was " + secret.join("") + ".", "win");
  } else if (attemptsLeft === 0 && result.right !== CODE_LENGTH) {
    gameOver = true;
    setMessage("You lose. The code was " + secret.join("") + ".", "lose");
  } else {
    setMessage(result.right + " in the right place, " + result.wrong + " in the wrong place.", "");
  }
  showState();
});

restartBtn.addEventListener("click", startGame);

startGame();
