let players = [];
const questionArea = document.querySelector(".question");


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

    

    fetch('/index.json')
        .then(response => response.json())
        .then(data => {
            let now = new Date();
            now.setHours(now.getHours() + 1);
            let today = now.toISOString().split('T')[0];
            let todayQuiz = data.days.find(day => day.date === today);

            console.log("Date: " + today)

            if(todayQuiz){
                questionArea.innerHTML = todayQuiz.question;
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