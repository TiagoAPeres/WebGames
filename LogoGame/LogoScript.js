import { SetUpAutoComplete } from '/Utilities/autocomplete.js';
import {loadAndParseCsv} from '/Utilities/queryCsv.js';


//Element
let LogoElement = null;
let PlayAgainElement = null;

//
let selectedLeaguePath  = null;
let selectedLogo = null;
let SelectedClubData = null;

//Health
let maxlives = 5;
let currentLives = 5;

//Blur
let maxBlur = 10;
let currentBlur = null;
let minBlur = 0;
let blurSectionAmount;


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

async function WrongGuess() {
    if (currentLives > 0)
    {
        currentLives--;
        RemoveAHeart()
        ReduceBlurFromLogo();
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
    await ShowElement(PlayAgainElement);
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

async function SelectLeagueAndStartGame(LeagueCSVPath)
{
    //league is selected
    selectedLeaguePath = LeagueCSVPath;

    await InitializeGame();

    await ShowTheLogoGame();
}

//#endregion

//#region Util

async function DoesPathReturnImg(path)
{
    try
    {
        const response = await fetch(path, { method: 'HEAD' });
        return response.ok;
    }
    catch (error) {return false;}
}

async function HideElementByID(id)
{
    let element = document.getElementById(id);
    element.classList.toggle('hidden',true);
    element.classList.toggle('visible',false);
}

async function ShowElementByID(id)
{
    let element = document.getElementById(id);
    element.classList.toggle('hidden',false);
    element.classList.toggle('visible',true);
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

    PlayAgainElement.onclick = InitializeGame;

    HideTheLogoGame()

    const buttons = document.getElementsByClassName('league-button');
    Array.from(buttons).forEach(element =>
    {
        element.onclick = () => {
            SelectLeagueAndStartGame(element.getAttribute('data-path'))
        };
    })

    let submitButton = document.getElementById("submit-btn")
    submitButton.onclick = MakeGuess;



})

