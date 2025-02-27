import { getGameCookie, deleteGameCookie } from "./Utilities/CookieUtil.js";
import { PopulatePopUp, popUp, PopUpTypes } from "./PopUpController.js";

const STATE = {
    NO_RESULT: 1,
    WIN: 2,
    LOSE: 3
};

const retryButton = document.getElementById("retry-button");

const gameInfo = {
    basic: {
        title: "Pergunta Diária!",
        description: "Responda à pergunta diária para ganhar pontos.",
        playUrl: "./Basic Questions/index.html"
    },
    mcq: {
        title: "Futebol Milionário!",
        description: "Responda às perguntas de múltipla escolha para ganhar prêmios.",
        playUrl: "./MCQ/index.html"
    },
    top10: {
        title: "Futebol Top10!",
        description: "Adivinhe os 10 melhores jogadores para ganhar pontos.",
        playUrl: "./Top10/index.html"
    },
    soon1: {
        title: "Não perca o milhão!",
        description: "Em breve: Começa com um milhão e aposta dinheiro nas resposta certas.",
        playUrl: "soon.html"
    },
    soon2: {
        title: "Advinha o jogador!",
        description: "Em breve: adivinhe o jogador com base nas pistas.",
        playUrl: "soon.html"
    }
};

document.querySelectorAll('.game-link').forEach(link => {
    link.addEventListener('click', async function(event) {
        event.preventDefault();
        const game = this.dataset.game;
        const info = gameInfo[game];

        console.log(`Clicked on game: ${game}`);
        const canPlay = checkCanPlay(game);
        info.canPlay = canPlay;

        console.log(`Can play ${game}: ${canPlay}`);
        popUp.SetInfo(info);
        await popUp.UpdateElements();
        await popUp.Show();
    });
});



document.getElementById('popup-exit-button').addEventListener('click', function() {
    popUp.Hide();
});

function checkCanPlay(game) {
    const state = getGameCookie(game, 'state');
    console.log(`Checking canPlay for ${game}, state:`, state);
    return state === null || state == STATE.NO_RESULT;
}

document.addEventListener('DOMContentLoaded', async () => {
    await PopulatePopUp();
    popUp.Hide();
});

function clearGameState() {
    const games = ['basic', 'mcq', 'top10'];
    games.forEach(game => {
        deleteGameCookie(game, 'lives');
        deleteGameCookie(game, 'guessedAnswers');
        deleteGameCookie(game, 'state');
        deleteGameCookie(game, 'question');
    });
    console.log('Cleared game state');
}

retryButton.onclick = function() {
    clearGameState();
    location.reload(); // Reload the page to start a new game
};