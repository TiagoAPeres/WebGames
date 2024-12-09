let words = [];

async function loadWordsAndStartGame() {
  try {
    const response = await fetch('\WORDS');
    const text = await response.text();
    words = text.split('\n').map(word => word.trim().toLowerCase()); // Ensure all words are lowercased and trimmed

    // Start the game after the words have been loaded
    startup();
  } catch (err) {
    console.error('Error loading word list:', err);
  }
}

const state = 
{
    secret: '',
    grid: Array(6)
        .fill()
        .map(() => Array(5).fill('')),
    currentRow: 0,
    currentCol: 0,
};

function updateGrid() {
    for (let i = 0; i < state.grid.length; i++) {
        for (let j = 0; j < state.grid[i].length; j++) {
            const box = document.getElementById(`box${i}${j}`);
            box.textContent = state.grid[i][j];
        }
    }
}

function drawBox(container, row, col, letter = '') {
    const box = document.createElement('div');
    box.className = 'box';
    box.id = `box${row}${col}`;

    container.appendChild(box);
    return box;
}

function drawGrid(container) {
    const grid = document.createElement('div');
    grid.className = 'grid';

    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 5; j++) {
            drawBox(grid, i, j);
        }
    }

    container.appendChild(grid);
}

function registerKeyboardEvents() {
    document.body.onkeydown = (e) => {
        const key = e.key.toLowerCase(); // Lowercase the key to ensure consistency with the words

        if (key === 'enter') {
            if (state.currentCol === 5) {
                const word = getCurrentWord().toLowerCase().trim(); // Convert the guess to lowercase and trim spaces
                if (isWordValid(word)) {
                    revealWord(word);
                    state.currentRow++;
                    state.currentCol = 0;
                } else {
                    alert(`Not a valid word`);
                }
            }
        }
        if (key === 'backspace') {
            removeLetter();
        }
        if (isLetter(key)) {
            addLetter(key);
        }

        updateGrid();
    };
}

function getCurrentWord() {
    return state.grid[state.currentRow].reduce((prev, curr) => prev + curr);
}

function isWordValid(word) {
    return words.includes(word); // Check if the word exists in the words array
}

function revealWord(guess) {
    const row = state.currentRow;
    const animationDuration = 500;

    for (let i = 0; i < 5; i++) {
        const box = document.getElementById(`box${row}${i}`);
        const letter = box.textContent;

        setTimeout(() => {
            if (letter === state.secret[i]) {
                box.classList.add('right');
            } else if (state.secret.includes(letter)) {
                box.classList.add('wrong');
            } else {
                box.classList.add('empty');
            }
        }, ((i + 1) * animationDuration) / 2);

        box.classList.add('animated');
        box.style.animationDelay = `${(i * animationDuration) / 2}ms`;
    }

    const isWinner = state.secret === guess;
    const isGameOver = state.currentRow === 5;

    setTimeout(() => {
        if (isWinner) {
            alert('Well done!');
        } else if (isGameOver) {
            alert(`F in the chat. The word was ${state.secret}`);
        }
    }, 3 * animationDuration);
}

function isLetter(key) {
    return key.length === 1 && key.match(/[a-z]/i);
}

function addLetter(letter) {
    if (state.currentCol === 5) return;
    state.grid[state.currentRow][state.currentCol] = letter;
    state.currentCol++;
}

function removeLetter() {
    if (state.currentCol === 0) return;
    state.grid[state.currentRow][state.currentCol - 1] = '';
    state.currentCol--;
}

function startup() {
    const game = document.getElementById('game');
    drawGrid(game);

    // Ensure a secret word is selected only after the words array is populated
    state.secret = words[Math.floor(Math.random() * words.length)];
    console.log(state.secret);

    registerKeyboardEvents();
}

// Call the async function to load words and start the game
loadWordsAndStartGame();
