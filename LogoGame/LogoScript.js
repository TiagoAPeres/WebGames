import { SetUpAutoComplete } from '/Utilities/autocomplete.js';
import { loadAndParseCsv} from '/Utilities/queryCsv.js';
import { DoesPathReturnImg } from '/Utilities/FilesUtil.js'
import { CanPlayToday, SetPlayerData } from "./DailyCookie.js";

//Element
let LogoElement = null;
let PlayAgainElement = null;

//
let selectedLeaguePath  = null;
let selectedLogo = null;
let SelectedClubData = null
let leaguePopUpIndex = null;

export let IsGameDaily = false;

//Health
export let maxlives = 5;
//let maxlives = 5;
let currentLives = 5;

//Blur
let maxBlur = 10;
let currentBlur = null;
let minBlur = 0;
let blurSectionAmount;

let PopUpInformation =
{
    daily:
    {
        "title" : "Daily Logo Game",
        "description" : "1"
    },

    PrimeiraLiga:
    {
        "title" : "Primeira Liga Logo Game",
        "description" : "2"
    },

    International:
        {
            "title" : "International Logo Game",
            "description" : "2"
        },

    PremierLeague:
        {
            "title" : "Premier League Logo Game",
            "description" : "3"
        },

};

//#region Logo
function UpdateLogoElement()
{
    if (!LogoElement) return

    LogoElement.src = selectedLogo;
    BlurLogo();
}

function UnblurLogo()
{
    if (!LogoElement) return
    currentBlur = 0;
    LogoElement.style.filter = `blur(${currentBlur}px)`
}

function BlurLogo()
{
    if (!LogoElement) return
    currentBlur = maxBlur;
    LogoElement.style.filter = `blur(${currentBlur}px)`
}

function ReduceBlurFromLogo()
{
    if (!LogoElement) return
    currentBlur -= blurSectionAmount;
    LogoElement.style.filter = `blur(${currentBlur}px)`
}

async function SelectNewLogo()
{
    if (selectedLeaguePath == null)
    {
        console.error("No Selected League Path");
        return
    }

    let csvData = await loadAndParseCsv(selectedLeaguePath);

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
        selectedLogo = SelectedClubData.path_to_folder + '/' + SelectedClubData.logo_path;

    }while (!(await DoesPathReturnImg(selectedLogo)) && tries >= 0)

    console.debug(SelectedClubData.team);
}

//#endregion

//#region Visibility Logo Game

async function ShowTheLogoGame()
{
    await ShowElementByID('logoGame');
    await HideElementByID('SelectLeague');
}

async function HideTheLogoGame()
{
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
    alert("you won bitch")
    await GameEnded();
}

async function WrongGuess()
{
    if (currentLives > 0)
    {
        currentLives--;
        RemoveAHeart()
        ReduceBlurFromLogo();
        SetPlayerData(currentLives);
        alert("you lost sadge")
    }

    if (currentLives <= 0)
    {
        await GameEnded();
        alert("No more hearts, try again")
    }
}

async function GameEnded()
{
    ClearSearchBar();
    UnblurLogo();

    if (!IsGameDaily)
    {
        await ShowElement(PlayAgainElement);
    }
}

async function InitializeGame()
{
    await HideElement(PlayAgainElement);

    InitializeHealth();

    //Logo
    await InitializeLogo()

    //Autocomplete
    await SetUpAutoComplete([selectedLeaguePath], "team", "input-box", "result-box")

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

async function SelectLeagueAndStartGame(leagueElement)
{
    //league is selected
    //selectedLeaguePath = LeagueCSVPath;
    //IsGameDaily = IsDailyGame;

    if (leagueElement == null) return;

    selectedLeaguePath = leagueElement.getAttribute('data-path');
    IsGameDaily = leagueElement.getAttribute('data-type') === "daily";
    leaguePopUpIndex = leagueElement.id;

    await UpdateAndShowPopUp()

    //StartGame();
}

async function StartGame()
{
    if(selectedLeaguePath == null)
    {
        console.error("error retrieving data from path:" + selectedLeaguePath);
        return;
    }

    if (IsGameDaily && !CanPlayToday()) return;

    await InitializeGame();

    await ShowTheLogoGame();
}

async function UpdateAndShowPopUp()
{
    document.getElementById("popup-title").textContent = PopUpInformation[leaguePopUpIndex].title;
    document.getElementById("popup-description").textContent = PopUpInformation[leaguePopUpIndex].description;

    document.getElementById("popup-button").onclick = () =>
    {
        StartGame();
        HideElementByID('popup-background');
    }

    await ShowElementByID('popup-background');
}

//#endregion

//#region Util

/*async function DoesPathReturnImg(path)
{
    try
    {
        const response = await fetch(path, { method: 'HEAD' });
        return response.ok;
    }
    catch (error) {return false;}
}*/

async function HideElementByID(id)
{
    let element = document.getElementById(id);
    await HideElement(element);
}

async function ShowElementByID(id)
{
    let element = document.getElementById(id);
    await ShowElement(element);
}

async function HideElement(element)
{
    if (element == null) return;
    element.classList.toggle('hidden',true);
    element.classList.toggle('visible',false);
}

async function ShowElement(element)
{
    if (element == null) return;

    element.classList.toggle('hidden',false);
    element.classList.toggle('visible',true);
}

//#endregion

$(document).ready(function ()
{
    PlayAgainElement = document.getElementById("play-again-button");
    LogoElement = document.getElementById("logo");

    if(PlayAgainElement !=null) PlayAgainElement.onclick = InitializeGame;

    HideTheLogoGame()

    const buttons = document.getElementsByClassName('league-button');
    Array.from(buttons).forEach(element =>
    {
        /*if (element.getAttribute('data-type') === "daily")
        {
            element.onclick = () => {
                if (CanPlayToday()) SelectLeagueAndStartGame(element.getAttribute('data-path'),true)
            };
        }
        else
        {
            element.onclick = () => {
                SelectLeagueAndStartGame(element.getAttribute('data-path'),false)
            };
        }*/
        element.onclick = () => {
            SelectLeagueAndStartGame(element)
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
})

