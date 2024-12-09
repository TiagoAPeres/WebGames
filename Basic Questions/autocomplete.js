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

async function loadWordsAndStartGame() {
    try {
        const response = await fetch('FIFA2019');
        const text = await response.text();

        const lines = text.split('\n').map(word => word.trim().toLowerCase()); // Ensure all words are lowercased and trimmed

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
            now.setHours(now.getHours() - 1);
            let today = now.toISOString().split('T')[0];
            let todayQuiz = data.days.find(day => day.date === today);

            console.log("Date: " + lives)

            if(todayQuiz){
                questionArea.innerHTML = todayQuiz.question;
                answer = todayQuiz.answers;
            }
            else{
                questionArea.innerHTML = "question";
            }
        })
        .catch(error => {
            // handle errors
        });


}



const resultsBox = document.querySelector(".result-box");
const inputBox = document.getElementById("input-box");

inputBox.onkeyup = function () {
    let result = [];
    let input = inputBox.value;
    if (input.length) {
        result = players.filter((keyword) => {
            return keyword.name.toLowerCase().includes(input.toLowerCase());
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
    if (inputBox.value && gameState === STATE.NO_RESULT)
    {
        if (inputBox.value == answer) {
            gameState = STATE.WIN;
            questionArea.innerHTML = "YOU WIN! COME BACK TOMORROW FOR A NEW GAME!";
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
                questionArea.innerHTML = "YOU LOST! COME BACK TOMORROW FOR A NEW GAME!";
                inputBox.value = null;
            }
        }
    }
}

const healthContainer = document.getElementById("health");

function updateHealth () {
    healthContainer.innerHTML = '';
    for (let i = 0; i < lives; i++) {
        const heart = document.createElement('i');
        heart.className = 'fa-solid fa-heart';
        heart.style.color = '#ff0000';
        heart.style.margin = '0 5px';
        healthContainer.appendChild(heart);
    }
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

loadWordsAndStartGame();
updateHealth();