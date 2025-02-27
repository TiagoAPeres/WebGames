import { setGameCookie, getGameCookie, deleteGameCookie } from "/Utilities/CookieUtil.js";

const STATE = {
    NO_RESULT: 1,
    WIN: 2,
    LOSE: 3
};
let gameState = STATE.NO_RESULT;

const questionArea = document.querySelector(".question");
const popupResults = document.querySelector(".title");
const popupTextResults = document.querySelector(".modal-body");
const options = document.querySelectorAll(".option");
const prizeAmounts = document.querySelectorAll(".prize");

const popupModal = document.getElementById("modal");
const closeModalButton = document.querySelector(".close-button");
const overlay = document.getElementById("overlay");

const retryButton = document.getElementById("retry-button");

let questions = [];
let currentQuestionNumber = 0; 

let currentPrize;

function saveGameState() {
    console.log('Saving game state:', { currentQuestionNumber, gameState });
    setGameCookie('mcq', 'question', currentQuestionNumber); // Save current question number until the end of the day
    setGameCookie('mcq', 'state', gameState); // Save game state until the end of the day
}

function loadGameState() {
    const savedQuestionNumber = getGameCookie('mcq', 'question');
    const savedState = getGameCookie('mcq', 'state');

    if (savedQuestionNumber !== null) {
        currentQuestionNumber = parseInt(savedQuestionNumber, 10);
    }

    if (savedState !== null) {
        gameState = parseInt(savedState, 10);
    }

    console.log('Loaded game state:', { currentQuestionNumber, gameState });
} 

function clearGameState() {
    deleteGameCookie('mcq', 'question');
    deleteGameCookie('mcq', 'state');
    console.log('Cleared game state');
}

retryButton.onclick = function() {
    clearGameState();
    location.reload(); // Reload the page to start a new game
};

async function loadQuestionsAndStartGame() {
    fetch('index.json')
        .then(response => response.json())
        .then(data => {
            let now = new Date();
            now.setHours(now.getHours());
            let today = now.toISOString().split('T')[0];
            let todayQuiz = data.days.find(day => day.date === today);

            console.log("Date: " + today);

            if (todayQuiz) {
                loadGameState();
                questions = todayQuiz.questions;
                displayQuestions();
            } else {
                questionArea.innerHTML = "Tente novamente mais tarde!";
                console.log(data.days.find(day => day.date === today));
            }
        })
        .catch(error => {
            console.error('Error loading questions:', error);
        });
}

function displayQuestions() {
    const currentQuestion = questions[currentQuestionNumber];
    questionArea.innerHTML = currentQuestion.question;

    currentPrize = prizeAmounts[currentQuestionNumber + 1];
    console.log(currentPrize);

    options.forEach((option, index) => {
        option.textContent = `${String.fromCharCode(65 + index)}) ${currentQuestion.options[index]}`;
        option.classList.remove("correct", "wrong", "disabled"); // Reset styles
        if (gameState === STATE.NO_RESULT) {
            option.onclick = () => checkAnswer(option, currentQuestion.options[index], currentQuestion.answer);
        }
    });

    updateScoreboard();
}

function checkAnswer(selectedButton, choice, solution) {
    options.forEach(option => option.classList.add("disabled"));
    flashOptions(0);

    if (choice == solution) {
        setTimeout(() => {
            selectedButton.classList.add("correct");
            selectedButton.classList.remove("disabled");
            currentQuestionNumber++;
            updateScoreboard();

            setTimeout(() => {
                if (currentQuestionNumber < questions.length) {
                    popupResults.innerHTML = "Resposta certa! </br> Ganhou " + currentPrize.textContent;
                    popupTextResults.innerHTML = "Next question!";
                    saveGameState();
                    showModal();
                    displayQuestions();
                } else {
                    gameState = STATE.WIN;
                    console.log("Updated gameState to WIN");
                    saveGameState();
                    popupResults.innerHTML = "Parabéns! </br> Ganhou $ 1 milhão!";
                    popupTextResults.innerHTML = "Jogue novamente amanhã!";
                    showModal();
                }
            }, 1000);
        }, 2000);
    } else {
        setTimeout(() => {
            selectedButton.classList.add("wrong");
            selectedButton.classList.remove("disabled");
            const correctOption = Array.from(options).find(option => option.textContent.includes(solution));
            correctOption.classList.add("correct");
            setTimeout(() => {
                gameState = STATE.LOSE;
                saveGameState();
                console.log("Updated gameState to LOSE");
                popupResults.innerHTML = "Desculpe, perdeu!";
                popupTextResults.innerHTML = "Jogue novamente amanhã!";
                showModal();
            }, 1000);
        }, 2000);
    }
    saveGameState();
    console.log(currentQuestionNumber);
}

function flashOptions(index) {
    if (index < options.length) {
        options[index].classList.add("flash-once");
        setTimeout(() => {
            flashOptions(index + 1);
            options[index].classList.remove("flash-once");
        }, 500);
    }
}

function updateScoreboard() {
    prizeAmounts.forEach((prize, index) => {
        prize.classList.remove('highlight', 'grey-out');
        if (index == currentQuestionNumber) {
            prize.classList.add('highlight');
        } else if (index < currentQuestionNumber) {
            prize.classList.add('grey-out');
        }
    });
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

loadQuestionsAndStartGame();
updateScoreboard();