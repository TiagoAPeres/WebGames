
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

let questions = [];
let currentQuestionNumber = 0; 

let currentPrize;

async function loadQuestionsAndStartGame() {

    
    fetch('index.json')
        .then(response => response.json())
        .then(data => {
            let now = new Date();
            now.setHours(now.getHours());
            let today = now.toISOString().split('T')[0];
            let todayQuiz = data.days.find(day => day.date === today);

            console.log("Date: " + today)

            if(todayQuiz){
                questions = todayQuiz.questions;
                displayQuestions();
                //questionArea.innerHTML = todayQuiz.question.toUpperCase();
                //answer = todayQuiz.answers.toUpperCase();
            }
            else{
                questionArea.innerHTML = "Try again later";
                console.log(data.days.find(day => day.date === today));
            }
        })
        .catch(error => {
            // handle errors
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
        option.onclick = () => checkAnswer(option, currentQuestion.options[index], currentQuestion.answer);
    });
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
                    popupResults.innerHTML = "Right answer! </br> You've won " + currentPrize.textContent;
                    popupTextResults.innerHTML = "Next question!";
                    showModal();
                    displayQuestions();
                } else {
                    popupResults.innerHTML = "Congratulations! </br> You won $1 million!";
                    popupTextResults.innerHTML = "Play again tomorrow!";
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
                popupResults.innerHTML = "Sorry, you lost!";
                popupTextResults.innerHTML = "Play again tomorrow!";
                showModal();
            }, 1000);
        }, 2000);
    }
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

/*submitButton.onclick = function () {
    console.log(answer);
    if (inputBox.value && gameState === STATE.NO_RESULT)
    {
        if (inputBox.value == answer) {
            gameState = STATE.WIN;
            popupResults.innerHTML = "CORRECT! <br> WELL DONE!";
            showModal();
        } else {
            if (lives>1) {
                lives--;
                updateHealth();
                inputBox.value = null;
            }
            else {
                lives = 0;
                updateHealth();
                gameState = STATE.LOSE;
                popupResults.innerHTML = "INCORRECT! <br> YOU LOST!";
                showModal();
                inputBox.value = null;
            }
        }
    }
}*/

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