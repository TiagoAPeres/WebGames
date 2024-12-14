import { SetUpAutoComplete } from '/Utilities/autocomplete.js';
import {loadAndParseCsv} from '/Utilities/queryCsv.js';

/**
 * Enum for types of Paths for the csv logos.
 * @readonly
 * @enum {{path: string}}
 */
const LogoLeaguePaths = Object.freeze({
    PremierLeague: {path: "/csv/Logo/PremierLeague_Logos.csv"},
});


let images = ['/LogoImages/PremierLeague/crystal-palace-2022-logo.png'
    , '/LogoImages/PremierLeague/brentford-fc-2017-logo.png'
    , '/LogoImages/PremierLeague/manchester-city-2016-logo.png'];
let currentIndex = 0;


let LogoElement = null;
let selectedLogo = null;
let selectedLeaguePath  = null;
let SelectedClubData = null;
let maxlives = 5;
let currentLives = 5;

let maxBlur = 10;
let currentBlur = null;
let minBlur = 0;
let blurSectionAmount;


function UpdateToSelectedLogo()
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

async function ShowTheLogoGame()
{
    await StartGame()

    let logoSection = document.getElementById('logoGame');
    logoSection.classList.toggle('hidden', false);
    logoSection.classList.toggle('visible', true);

    let leagueSection = document.getElementById('SelectLeague');
    leagueSection.classList.toggle('hidden', true);
    leagueSection.classList.toggle('visible', false);
}

function HideTheLogoGame()
{
    let logoSection = document.getElementById('logoGame');
    logoSection.classList.toggle('hidden',true);
    logoSection.classList.toggle('visible',false);

    let leagueSection = document.getElementById('SelectLeague');
    leagueSection.classList.toggle('hidden',false);
    leagueSection.classList.toggle('visible',true);
}

async function StartGame()
{
    LogoElement = document.getElementById("logo");

    await SetUpAutoComplete([selectedLeaguePath], "team", "input-box", "result-box")

    UpdateToSelectedLogo()

    CreateHealthBar()

    currentLives = maxlives;
    blurSectionAmount = Math.abs(maxBlur - minBlur) / maxlives;
}

async function ButtonClick(LeagueCSVPath)
{
    let tries = 5;

    selectedLeaguePath = LeagueCSVPath;
    let csvData = await loadAndParseCsv(selectedLeaguePath);

    if (!Array.isArray(csvData) || csvData.length <= 0)
    {
        console.error("error retrieving data from path:" + LeagueCSVPath);
        return
    }


    while (!(await DoesPathReturnImg(selectedLogo)) && tries >= 0)
    {
        tries--;

        const randomIndex = Math.floor(Math.random() * csvData.length);
        SelectedClubData = csvData[randomIndex];
        selectedLogo = SelectedClubData.path_to_folder + '/' + SelectedClubData.logo_path;

    }

    if (selectedLogo == null)
    {
        console.error("No Selected Logo");
        return
    }

    console.debug(SelectedClubData.team);

    if (selectedLeaguePath == null)
    {
        console.error("No Selected League Path");
        return
    }

    ShowTheLogoGame();
}

async function DoesPathReturnImg(path)
{
    try
    {
        const response = await fetch(path, { method: 'HEAD' });
        return response.ok;
    }
    catch (error) {return false;}
}

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

function CorrectGuess()
{
    UnblurLogo();
    alert("you won bitch")
}

function WrongGuess()
{
    currentLives--;

    if (currentLives <= 0)
    {
        alert("No more tries today, Better luck tomorrow")
    }
    else
    {
        alert("you lost sadge")
    }

    RemoveAHeart()
    ReduceBlurFromLogo();

}


function RemoveAHeart()
{
    const firstIcon = document.querySelector(' .fa-solid.fa-heart');

// Remove it if it exists
    if (firstIcon) {
        firstIcon.remove();
    }
}

function CreateHealthBar()
{
    const HealthBar = document.querySelector('.health-bar');

    if (!HealthBar)  return

    for (let i = 0; i < currentLives; i++)
    {
        HealthBar.innerHTML += '<i class="fa-solid fa-heart heart"></i>';
    }

}


$(document).ready(function ()
{
    HideTheLogoGame()

    const buttons = document.getElementsByClassName('league-button');
    Array.from(buttons).forEach(element =>
    {
        element.onclick = () => {
            ButtonClick(element.getAttribute('data-path'))
        };
    })

    let submitButton = document.getElementById("submit-btn")
    submitButton.onclick = MakeGuess;

})

