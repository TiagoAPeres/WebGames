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
const questionArea = document.querySelector(".question");
const submitButton = document.getElementById("submit-btn");

const resultsBox = document.querySelector(".result-box");
const inputBox = document.getElementById("input-box");
const popupResults = document.querySelector(".title");

const popupModal = document.getElementById("modal");
const closeModalButton = document.querySelector(".close-button");
const overlay = document.getElementById("overlay");

const healthContainer = document.getElementById("health");

const retryButton = document.getElementById("retry-button");

function saveGameState() {
    setGameCookie('basic', 'lives', lives); // Save lives until the end of the day
    setGameCookie('basic', 'state', gameState); // Save game state until the end of the day
}

function loadGameState() {
    const savedLives = getGameCookie('basic', 'lives');
    const savedState = getGameCookie('basic', 'state');

    if (savedLives !== null) {
        lives = parseInt(savedLives, 10);
    }

    if (savedState !== null) {
        gameState = parseInt(savedState, 10);
    }
}

function clearGameState() {
    deleteGameCookie('basic', 'lives');
    deleteGameCookie('basic', 'state');
    console.log('Cleared game state');
}

retryButton.onclick = function() {
    clearGameState();
    location.reload(); // Reload the page to start a new game
};

async function loadWordsAndStartGame() {
    try {
        const response = await fetch('FIFA2019');
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
            let todayQuiz = data.days.find(day => day.date === today);

            console.log("Date: " + today);

            if (todayQuiz) {
                questionArea.innerHTML = todayQuiz.question.toUpperCase();
                answer = todayQuiz.answers.toUpperCase();
            } else {
                questionArea.innerHTML = "Tente novamente mais tarde!";
            }
        })
        .catch(error => {
            console.error('Error loading word list:', error);
        });

    loadGameState();
    updateHealth();
}

inputBox.onkeyup = function () {
    let result = [];
    let input = inputBox.value;
    if (input.length) {
        result = players.filter((keyword) => {
            return keyword.name.toUpperCase().includes(input.toUpperCase());
        });
        console.log(result);
    }
    display(result);

    if (!result.length) {
        resultsBox.innerHTML = '';
    }
}

submitButton.onclick = function () {
    console.log(answer);
    if (inputBox.value && gameState === STATE.NO_RESULT) {
        if (inputBox.value == answer) {
            gameState = STATE.WIN;
            popupResults.innerHTML = "CORRETO! <br> BEM FEITO!";
            showModal();
        } else {
            if (lives > 1) {
                lives--;
                updateHealth();
                inputBox.value = null;
            } else {
                lives = 0;
                updateHealth();
                gameState = STATE.LOSE;
                popupResults.innerHTML = "ERRADO! <br> A RESPOSTA É: <br>" + answer;
                showModal();
                inputBox.value = null;
            }
        }
        saveGameState();
    }
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
        return "<li onclick=selectInput(this)>" + list.name + "</li>";
    });
    resultsBox.innerHTML = "<ul>" + content.join('') + "</ul>";
}

function selectInput(list) {
    inputBox.value = list.innerHTML;
    resultsBox.innerHTML = '';
}

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