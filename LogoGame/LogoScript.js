import { SetUpAutoComplete } from '../Utilities/autocomplete.js';
import {loadAndParseCsv, loadAndParseCsvArray} from '../Utilities/queryCsv.js';
import { DoesPathReturnImg } from '../Utilities/FilesUtil.js'
import { CanPlayDailyToday, SetPlayerData } from "./DailyCookie.js";
import {HideElementByID, ShowElementByID, HideElement, ShowElement} from "../Utilities/Elements.js";
import {
    DailyGameResult,
    LeagueSelect,
    PopulatePopUp,
    popUp,
    PopUpTypes,
    ReplayableGameResult
} from "./PopUpController.js";

//Element
let LogoElement = null;
let PlayAgainElement = null;

//
let selectedLeaguePath  = null;
export let selectedLeaguePathArray  = [];
export let selectedLogo = null;
export let SelectedClubData = null
export let leaguePopUpIndex = null;

let AllLeaguePathArray  =
    [   "../csv/Logo/PremierLeague_Logos.csv",
        "../csv/Logo/PrimeiraLiga_Logos.csv",
        "../csv/Logo/International_Logos.csv"];


export let IsGameDaily = false;
export let GameWon = false

//Health
export let maxlives = 5;
let currentLives = 5;

//Blur
let maxBlur = 10;
let currentBlur = null;
let minBlur = 0;
let blurSectionAmount;


//Game State
const GameState = Object.freeze({
    SelectLeague: {id: 1},
    ReplayableGame: {id: 2},
    DailyGame: {id: 3}
});

let gameState = null;



let PopUpInformation =
{
    daily: {
        "title": "Jogo do Logotipo - Diário",
        "description":
            "<p class='pop-up-description-highlighted-text'>Tens 5 tentativas para adivinhar a que clube pertence o logotipo.</p>" +
            "<p>O logotipo começará desfocado e ficará mais nítido à medida que o jogo avança.</p>" +
            "<p>Neste modo, qualquer clube pode aparecer.</p>" +
            "<p>Boa sorte! 🍀</p>"
    },

    PrimeiraLiga: {
        "title": "Jogo do Logotipo - Primeira Liga",
        "description":
            "<p class='pop-up-description-highlighted-text'>Tens 5 tentativas para adivinhar a que clube pertence o logotipo.</p>" +
            "<p>O logotipo começará desfocado e ficará mais nítido à medida que o jogo avança.</p>" +
            "<p>Neste modo, apenas clubes da Primeira Liga aparecerão.</p>" +
            "<p>Boa sorte! ⚽</p>"
    },

    International: {
        "title": "Jogo do Logotipo - Internacional",
        "description":
            "<p class='pop-up-description-highlighted-text'>Tens 5 tentativas para adivinhar a que clube pertence o logotipo.</p>" +
            "<p>O logotipo começará desfocado e ficará mais nítido à medida que o jogo avança.</p>" +
            "<p>Neste modo, apenas clubes da liga internacional aparecerão.</p>" +
            "<p>Boa sorte! 🌍</p>"
    },

    PremierLeague: {
        "title": "Jogo do Logotipo - Premier League",
        "description":
            "<p class='pop-up-description-highlighted-text'>Tens 5 tentativas para adivinhar a que clube pertence o logotipo.</p>" +
            "<p>O logotipo começará desfocado e ficará mais nítido à medida que o jogo avança.</p>" +
            "<p>Neste modo, apenas clubes da Premier League aparecerão.</p>" +
            "<p>Boa sorte! 🏆</p>"
    }


};


function ChangeGameState(newGameState)
{
    gameState = newGameState;

    if (gameState === GameState.DailyGame)
    {
        popUp.ChangeType(DailyGameResult);
    }
    else if (gameState === GameState.ReplayableGame)
    {
        popUp.ChangeType(ReplayableGameResult);
    }
    else if (gameState === GameState.SelectLeague)
    {
        popUp.ChangeType(LeagueSelect);
    }

}

//#region Logo
function UpdateLogoElement()
{
    if (!LogoElement) return

    LogoElement.src = selectedLogo;
    RemoveAnimationFromLogo();
    BlurLogo();
}

function UnblurLogo()
{
    if (!LogoElement) return
    currentBlur = 0;
    //LogoElement.style.filter = `blur(${currentBlur}px)`

    let currentFilter = LogoElement.style.filter;
    let shadowPart = currentFilter.match(/drop-shadow\((.*?)\)/);
    let dropShadow = shadowPart ? shadowPart[0] : "drop-shadow(0px 0px 0px transparent)"; // Default if not found

    // Update the filter property with new blur value
    LogoElement.style.filter = `blur(${currentBlur}px) ${dropShadow}`;
}

function BlurLogo()
{
    if (!LogoElement) return
    currentBlur = maxBlur;
    //LogoElement.style.filter = `blur(${currentBlur}px)`

    let currentFilter = LogoElement.style.filter;
    let shadowPart = currentFilter.match(/drop-shadow\((.*?)\)/);
    let dropShadow = shadowPart ? shadowPart[0] : "drop-shadow(0px 0px 0px transparent)"; // Default if not found

    // Update the filter property with new blur value
    LogoElement.style.filter = `blur(${currentBlur}px) ${dropShadow}`;
}

function ReduceBlurFromLogo() {
    if (!LogoElement) return

    /* LogoElement.style.filter = `blur(${currentBlur}px)` */

    LogoElement.style.animation = "none"; // Reset animation
    void LogoElement.offsetWidth; // Force reflow to restart animation

    setShadowBlur(currentBlur, currentBlur - blurSectionAmount);

    currentBlur -= blurSectionAmount;

    LogoElement.style.animation = "shadowFade 1.5s ease-in-out forwards"; // Restart animation

    HideElementByID("submit-btn")
    setTimeout(() => ShowElementByID("submit-btn"), 1500);

}

function setShadowBlur(startBlur, endBlur) {
    const midBlur = (startBlur + endBlur) /2;

    LogoElement.style.setProperty('--start-blur', `${startBlur}px`);
    LogoElement.style.setProperty('--mid-blur', `${midBlur}px`);
    LogoElement.style.setProperty('--end-blur', `${endBlur}px`);
}

function RemoveAnimationFromLogo()
{
    LogoElement.style.animation = "none";
}

/*
function ReduceBlurFromLogo() {
    if (!LogoElement) return;

    // Decrease the blur
    currentBlur -= blurSectionAmount;
    if (currentBlur < 0) currentBlur = 0; // Prevent negative blur

    // Apply the new blur + trigger the shadow animation
    LogoElement.style.filter = `blur(${currentBlur}px)`;

    // Restart shadow animation
    LogoElement.style.animation = "none"; // Reset animation
    void LogoElement.offsetWidth; // Force reflow to restart animation
    LogoElement.style.animation = "shadowFade 1s ease-in-out"; // Restart animation
}
*/

async function SelectNewLogo()
{
    if (selectedLeaguePathArray.length === 0 ) //selectedLeaguePath
    {
        console.error("No Selected League Path");
        return
    }


    let csvData = await loadAndParseCsvArray(selectedLeaguePathArray);
    //let csvData = await loadAndParseCsv(selectedLeaguePath);

    if (!Array.isArray(csvData) || csvData.length <= 0)
    {
        console.error("error retrieving data from path:" + LeagueCSVPath);
        return
    }

    let tries = 5;
    do
    {
        tries--;

        const randomIndex = Math.floor(Math.random() * csvData.length);
        SelectedClubData = csvData[randomIndex];
        selectedLogo =  ".." + SelectedClubData.path_to_folder + '/' + SelectedClubData.logo_path;

    }while (!(await DoesPathReturnImg(selectedLogo)) && tries >= 0)

    console.debug(SelectedClubData.team);
}

//#endregion

//#region Visibility Logo Game

export async function ShowTheLogoGame()
{
    if  (IsGameDaily)
    {
        ChangeGameState(GameState.DailyGame);
    }
    else
    {
        ChangeGameState(GameState.ReplayableGame);
    }

    await ShowElementByID('logoGame');
    await HideElementByID('SelectLeague');
}

export async function HideTheLogoGame()
{
    ChangeGameState(GameState.SelectLeague);
    await HideElementByID('logoGame');
    await ShowElementByID('SelectLeague');
}

//#endregion

//#region Manage Game

function MakeGuess()
{
    if (currentLives <= 0 ) return

    let inputBox = document.getElementById("input-box")
    if (inputBox == null) return;

    if (inputBox.value === SelectedClubData.team)
    {
        CorrectGuess();
    }
    else
    {
        if (inputBox.value.length > 0) WrongGuess()
    }
}

async function CorrectGuess()
{
    await GameEnded();
}

async function WrongGuess()
{
    if (currentLives > 0)
    {
        currentLives--;
        RemoveAHeart()
        ReduceBlurFromLogo();
        if (IsGameDaily) SetPlayerData(currentLives);
    }

    if (currentLives <= 0)
    {
        await GameEnded();
    }
}

async function GameEnded()
{
    GameWon = currentLives > 0;

    if (IsGameDaily)
    {
        SetPlayerData(currentLives,false);
    }

    ClearSearchBar();
    UnblurLogo();

    await popUp.UpdateElements();
    await popUp.Show();

    //await UpdateAndShowGameResultPopUp();


}

export async function InitializeGame()
{
    /*await HideElement(PlayAgainElement);*/

    InitializeHealth();

    //Logo
    await InitializeLogo()

    //Autocomplete
    await SetUpAutoComplete(selectedLeaguePathArray, "team", "input-box", "result-box") //[selectedLeaguePath]

    //BLUR
    blurSectionAmount = Math.abs(maxBlur - minBlur) / maxlives;
}

async function InitializeLogo()
{
    LogoElement = document.getElementById("logo");
    await HideElement(LogoElement);
    await SelectNewLogo();
    UpdateLogoElement();
    await ShowElement(LogoElement);
}


function InitializeHealth()
{
    currentLives = maxlives;

    const HealthBar = document.querySelector('.health-bar');

    if (!HealthBar)  return

    HealthBar.innerHTML = '';

    for (let i = 0; i < currentLives; i++)
    {
        HealthBar.innerHTML += '<i class="fa-solid fa-heart heart"></i>';
    }
}


//#endregion

//#region UI

function ClearSearchBar()
{
    let searchBar = document.getElementById("input-box")
    let ResultsBox = document.getElementById("result-box")

    searchBar.value = '';
    ResultsBox.innerHTML = '';
}

function RemoveAHeart()
{
    const firstIcon = document.querySelector(' .fa-solid.fa-heart');

    if (firstIcon) firstIcon.remove();
}

async function SelectLeagueAndShowPopUp(leagueElement)
{
    //league is selected
    //selectedLeaguePath = LeagueCSVPath;
    //IsGameDaily = IsDailyGame;

    if (leagueElement == null) return;

    selectedLeaguePathArray = [];

    let dataPathAttribute = leagueElement.getAttribute('data-path');
    //selectedLeaguePathArray = leagueElement.getAttribute('data-path');

    if (dataPathAttribute == null)
    {
        return;
    }
    else if (dataPathAttribute === "all")
    {
        selectedLeaguePathArray = AllLeaguePathArray;
    }
    else
    {
        selectedLeaguePathArray.push(dataPathAttribute);
    }

    IsGameDaily = leagueElement.getAttribute('data-type') === "daily";
    leaguePopUpIndex = leagueElement.id;

    await popUp.UpdateElements();
    await popUp.Show();

    //await UpdateAndShowLeaguePopUp()

    //StartGame();
}

export async function StartGame()
{
    if (IsGameDaily && !CanPlayDailyToday()) {return;}

    if (IsGameDaily)
    {
        ChangeGameState(GameState.DailyGame)
    }
    else
    {
        ChangeGameState(GameState.ReplayableGame)
    }

    await InitializeGame();

    await ShowTheLogoGame();
}

//#endregion


$(document).ready(function ()
{
    PopulatePopUp().then(r => popUp.Hide());
    ChangeGameState(GameState.SelectLeague);

    LogoElement = document.getElementById("logo");


    HideTheLogoGame()

    const buttons = document.getElementsByClassName('league-button');
    Array.from(buttons).forEach(element =>
    {
        element.onclick = () => {
            SelectLeagueAndShowPopUp(element)
        };
    })


    let submitButton = document.getElementById("submit-btn")
    if (submitButton != null ) submitButton.onclick = MakeGuess;

    let returnButton = document.getElementById("return-button");
    if(returnButton != null ) returnButton.onclick = () => {HideTheLogoGame();};

    let inputBox = document.getElementById("input-box");
    if (inputBox != null) inputBox.onclick = ( ) =>
    {
        console.log("focus")
        inputBox.focus()
    }

    let ReturnButtons = document.querySelectorAll(".return-button");

    ReturnButtons.forEach(element =>
    {
        if (element.hasAttribute('data-closeId'))
        {
            element.onclick = () =>
            {
                HideElementByID(element.getAttribute('data-closeId'));
            };
        }
    });

    document.addEventListener("click", function (event)
    {
        document.querySelectorAll(".selectable").forEach(el => el.classList.remove("selected"));
    });

    document.querySelectorAll(".selectable").forEach(item => {
        item.addEventListener("click", function (event) {
            event.stopPropagation();
            document.querySelectorAll(".selectable").forEach(el => el.classList.remove("selected"));
            this.classList.add("selected");
        });
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            let closestEscapeButton = null;
            let closestZ = null
            document.querySelectorAll(".return-button").forEach(item => {
                if (isElementHidden(item)) return;

                if (closestEscapeButton == null )
                {
                    closestEscapeButton = item;
                    closestZ = getZIndex(item);
                    return;
                }
                let currentZ = getZIndex(item);

                if(currentZ > closestZ )
                {
                    closestZ = currentZ;
                    closestEscapeButton = item;
                }
            });

            if (closestEscapeButton != null)
            {
                closestEscapeButton.click();
            }

        }
    });

    //UpdateDailyPopUp();
})


function UpdateDailyPopUp()
{

    let description = "<p class='pop-up-description-highlighted-text'>Tens 5 tentativas para adivinhar a que clube pertence o logotipo.</p>" +
        "<p>O logotipo começará desfocado e ficará mais nítido à medida que o jogo avança.</p>" +
        "<p>Neste modo, qualquer clube pode aparecer.</p>" +
        "<p>Boa sorte! 🍀</p>"

    let PrefixString;

    if (CanPlayDailyToday())
    {
        PrefixString = "<p class='green-text'>" +"Ainda podes jogar hoje</p>"
    }
    else
    {
        PrefixString = "<p class='red-text'>" +"Já não podes jogar hoje</p>"
    }


    PopUpInformation["daily"].description = PrefixString + description;
}

function getZIndex(button) {
    return parseInt(window.getComputedStyle(button).zIndex, 10) || 0; // Default to 0 if no z-index is set
}


function isElementHidden(element) {
    // Check if the element itself is hidden
    let style = window.getComputedStyle(element);

    if (style.visibility === 'hidden' || style.opacity === '0' || style.display === 'none') {
        return true;
    }

    // Check if any parent element is hidden
    let parent = element.parentElement;
    while (parent) {
        let parentStyle = window.getComputedStyle(parent);
        if (parentStyle.visibility === 'hidden' || parentStyle.opacity === '0' || parentStyle.display === 'none') {
            return true;
        }
        parent = parent.parentElement;
    }

    return false;
}