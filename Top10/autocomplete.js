import { setGameCookie, getGameCookie, deleteGameCookie } from "../Utilities/CookieUtil.js";

let players = [];
let answer;

const STATE = {
    NO_RESULT: 1,
    WIN: 2,
    LOSE: 3
};
let gameState = STATE.NO_RESULT;

let lives = 3;
let guessedAnswers = new Set();

const questionArea = document.querySelector(".question");
const submitButton = document.getElementById("submit-btn");

const options = document.querySelectorAll(".option");

const resultsBox = document.querySelector(".result-box");
const inputBox = document.getElementById("input-box");
const popupResults = document.querySelector(".title");

const popupModal = document.getElementById("modal");
const closeModalButton = document.querySelector(".close-button");
const overlay = document.getElementById("overlay");

const healthContainer = document.getElementById("health");

const retryButton = document.getElementById("retry-button");

function saveGameState() {
    console.log('Saving game state:', { lives, guessedAnswers: Array.from(guessedAnswers), gameState });
    setGameCookie('top10', 'lives', lives); // Save lives until the end of the day
    setGameCookie('top10', 'guessedAnswers', JSON.stringify(Array.from(guessedAnswers))); // Save guessed answers until the end of the day
    setGameCookie('top10', 'state', gameState); // Save game state until the end of the day
}

function loadGameState() {
    const savedLives = getGameCookie('top10', 'lives');
    const savedGuessedAnswers = getGameCookie('top10', 'guessedAnswers');
    const savedState = getGameCookie('top10', 'state');

    if (savedLives !== null) {
        lives = parseInt(savedLives, 10);
    }

    if (savedGuessedAnswers !== null) {
        guessedAnswers = new Set(JSON.parse(savedGuessedAnswers));
        guessedAnswers.forEach(guessedAnswer => {
            let index = answer.indexOf(guessedAnswer);
            if (index !== -1) {
                correctAnswer(index, guessedAnswer);
            }
        });
    }

    if (savedState !== null) {
        gameState = parseInt(savedState, 10);
    }

    updateHealth();
    console.log('Loaded game state:', { lives, guessedAnswers: Array.from(guessedAnswers), gameState });
}

function clearGameState() {
    deleteGameCookie('top10', 'lives');
    deleteGameCookie('top10', 'guessedAnswers');
    deleteGameCookie('top10', 'state');
    console.log('Cleared game state');
}

retryButton.onclick = function() {
    clearGameState();
    location.reload(); // Reload the page to start a new game
};

async function loadWordsAndStartGame() {
    try {
        const response = await fetch('../Utilities/FIFA2019');
        const text = await response.text();

        const lines = text.split('\n').map(word => word.trim().toUpperCase()); // Ensure all words are uppercase and trimmed

        players = lines.map(line => {
            const [name, country] = line.split(/\s{2,}|\t+/);

            if (!name || !country) {
                return null;  // Ignore invalid lines
            }

            return { name: name.trim(), country: country.trim() };
        }).filter(player => player !== null);

        console.log('Processed words:', players);
    } catch (err) {
        console.error('Error loading word list:', err);
    }

    fetch('index.json')
        .then(response => response.json())
        .then(data => {
            let now = new Date();
            now.setHours(now.getHours());
            let today = now.toISOString().split('T')[0];

            console.log("Date: " + today); // Ensure this runs after 'today' is set

            let todayQuiz = data.days.find(day => day.date === today);

            if (todayQuiz) {
                questionArea.innerHTML = todayQuiz.question.toUpperCase();
                answer = todayQuiz.answers.map(a => normalizeText(a));
                console.log("state: " + gameState);

                loadGameState();
            } else {
                questionArea.innerHTML = "Tente novamente mais tarde!";
            }
        })
        .catch(error => {
            console.error('Error loading word list:', error);
        });

    //loadGameState();
    updateHealth();
}

inputBox.onkeyup = function () {
    let result = [];
    let input = normalizeText(inputBox.value);
    if (input.length) {
        result = players.filter((keyword) => {
            return normalizeText(keyword.name).includes(input);
        });
        console.log(result);
    }
    display(result);

    if (!result.length) {
        resultsBox.innerHTML = '';
    }
}

function normalizeText(text) {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

submitButton.onclick = function () {
    let input = normalizeText(inputBox.value);
    console.log("STATE before:", gameState);

    if (input && gameState === STATE.NO_RESULT) {
        console.log(answer);
        if (answer.includes(input) && !guessedAnswers.has(input)) {
            let index = answer.indexOf(input);
            guessedAnswers.add(input);
            console.log(guessedAnswers);
            correctAnswer(index, input);
            inputBox.value = null;

            if (guessedAnswers.size === answer.length) {
                gameState = STATE.WIN;
                console.log("Updated gameState to WIN");
                popupResults.innerHTML = "ENCONTROU TODAS AS RESPOSTAS! <br> BEM FEITO!";
                showModal();
            }
        } else {
            if (lives > 1) {
                wrongAnswer();
                lives--;
                updateHealth();
                inputBox.value = null;
            } else {
                wrongAnswer();
                revealAnswer();
                lives = 0;
                updateHealth();
                gameState = STATE.LOSE;
                console.log("Updated gameState to LOSE");
                popupResults.innerHTML = "ERRADO! <br> PERDEU!";
                showModal();
                inputBox.value = null;
            }
        }
        saveGameState();
    }
    console.log("STATE after:", gameState);
}

function correctAnswer(index, answer) {
    options[index].innerHTML = answer;
    options[index].classList.add("correct");
}

function revealAnswer() {
    options.forEach((option, index) => {
        option.innerHTML = answer[index];
    });
}

function wrongAnswer() {
    options.forEach(option => {
        option.classList.add("wrong");
    });
    setTimeout(() => {
        options.forEach(option => {
            option.classList.remove('wrong');
        });
    }, 200);
}

function showModal() {
    popupModal.classList.add("active");
    overlay.classList.add("active");
}

closeModalButton.onclick = function () {
    popupModal.classList.remove("active");
    overlay.classList.remove("active");
}

overlay.onclick = function () {
    popupModal.classList.remove("active");
    overlay.classList.remove("active");
}

function updateHealth() {
    healthContainer.innerHTML = '';
    for (let i = 0; i < lives; i++) {
        const heart = document.createElement('i');
        heart.className = 'fa-solid fa-heart';
        heart.style.color = '#ff0000';
        heart.style.margin = '0 5px';
        //heart.style.fontSize = '30px';
        heart.style.textShadow = '0 0 1px black, 0 0 2px black, 0 0 3px black';
        healthContainer.appendChild(heart);
    }
    flashHearts();
}

function display(result) {
    const content = result.map((list) => {
        return "<li onclick='selectInput(this)'>" + list.name + "</li>";
    });
    resultsBox.innerHTML = "<ul>" + content.join('') + "</ul>";
}

function selectInput(list) {
    inputBox.value = list.innerHTML;
    resultsBox.innerHTML = '';
}

// Attach selectInput to the window object to make it globally accessible
window.selectInput = selectInput;

function flashHearts() {
    const hearts = document.querySelectorAll('.health i');
    hearts.forEach(heart => {
        heart.classList.add('flash-once');
    });

    setTimeout(() => {
        hearts.forEach(heart => {
            heart.classList.remove('flash-once');
        });
    }, 500);
}

loadWordsAndStartGame();
updateHealth();