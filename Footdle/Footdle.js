import {GetARemovedWordsIndex, RemovedWords, SetUpAutoComplete} from "../Utilities/autocomplete.js";
import {loadAndParseCsv, ReturnRandomRow, ReturnRow} from "../Utilities/queryCsv.js";
import {ClearInputBox, HideElementByID, ShowAndFocusElement} from "../Utilities/Elements.js";
import {GetRandomElement, timeUntilNextDay} from "../Utilities/Util.js";
import { TipManager , Tip } from "../Footdle/FootdleClasses.js";

export let mysteryPlayer = null
let ArrayOfPlayers = null
let RemovedWordsIndex = null
let inputPlayers = []
let answerRowIndex = null

let guessNum = -1;
let correctGuessNum = null

export let dayTimerStarted = new Date();

const victoryMessages = [
    "GOOOLOOO! Acertaste em cheio no craque!",
    "Finta perfeita! Passaste por todos e marcaste o golo da vitória!",
    "Confirmado pelo VAR: És um verdadeiro mestre do futebol!",
    "Tens olho de águia! Acertaste no jogador sem falhar!",
    "Que jogada de génio! Mandaste a bola mesmo à gaveta!",
    "Bola de Ouro para ti! És o rei dos palpites!",
    "Acertaste com classe! Verdadeiro futebol de encantar!",
    "Passaste todos e fuzilaste a baliza com este palpite!",
    "Nem o Mourinho faria melhor! Mestre da tática!"
];

export let tipManager = null;



/* Enum for types of overlap between information.
* @readonly
* @enum {{id: number}}
*/
export const RelationTypes  = Object.freeze({
    // String Overlap
    Full: 1,
    Some: 2,
    None: 3,

    // Number Comparisons
    Bigger: 4,
    Smaller: 5,
    Equal: 6
});

class ComparisonResults
{
    constructor(inputPlayer)
    {
        if (mysteryPlayer === null || mysteryPlayer === undefined)
        {
            console.error("No Mystery Player found");
            return null;
        }

        this.name =       this.CompareStrings(mysteryPlayer.name, inputPlayer.name);
        this.nation =     this.CompareStrings(mysteryPlayer.nation, inputPlayer.nation);
        this.positions =  this.CompareArrayOfStrings(mysteryPlayer.positions, inputPlayer.positions);
        this.squad =      this.CompareStrings(mysteryPlayer.squad, inputPlayer.squad);
        this.age =        this.CompareNumbers(mysteryPlayer.age, inputPlayer.age);
        this.goals =      this.CompareNumbers(mysteryPlayer.goals, inputPlayer.goals);

        this.ClassName = ""
        this.ClassNation =    this.AddClassNames(this.nation);
        this.ClassPositions = this.AddClassNames(this.positions);
        this.ClassSquads =    this.AddClassNames(this.squad);
        this.ClassAge =       this.AddClassNames(this.age);
        this.ClassGoals =     this.AddClassNames(this.goals);

        this.characteristics =
        [
            {key :"position", RelationTypes:this.positions },
            {key :"squad"   , RelationTypes:this.squad    },
            {key :"nation"  , RelationTypes:this.nation   },
            {key :"age"     , RelationTypes: this.age      },
            {key :"goals"   , RelationTypes:this.goals     },
        ]
    }


    AddClassNames(dataVariable)
    {
        let returnString = ""
        if (dataVariable === RelationTypes.Equal || dataVariable === RelationTypes.Full)
        {
            returnString += "green-background "
        }
        if (dataVariable === RelationTypes.Some)
        {
            returnString += "orange-background "
        }
        if (dataVariable === RelationTypes.Bigger || dataVariable === RelationTypes.Smaller || dataVariable === RelationTypes.None)
        {
            returnString += "red-background "

            if(dataVariable === RelationTypes.Bigger)
            {
                returnString += "arrow-up-background "
            }

            if(dataVariable === RelationTypes.Smaller)
            {
                returnString += "arrow-down-background "
            }
        }
        return returnString;
    }

    CompareNumbers(thisNumber, theirNumber)
    {
        /* the player to figure out is the this*/
        if ( thisNumber === theirNumber ) return RelationTypes.Equal;

        if (thisNumber > theirNumber) return RelationTypes.Bigger;

        if (thisNumber < theirNumber) return RelationTypes.Smaller;
        /*if ( thisNumber === theirNumber ) return "equal";

        if (thisNumber > theirNumber) return "bigger";

        if (thisNumber < theirNumber) return "smaller";*/
    }

    CompareStrings(thisString, theirString)
    {
        if (thisString === theirString)
        {
            return RelationTypes.Full;
        }
        else
        {
            return RelationTypes.None;
        }
    }

    CompareArrayOfStrings(thisArray, theirArray)
    {
        let booleanResults = [];
        let currentResult = false;
        let overlap = "none"

        let smallerArray = thisArray;
        let biggerArray = theirArray

        if (thisArray.length > theirArray.length)
        {
            smallerArray = theirArray;
            biggerArray = thisArray;
        }


        biggerArray.forEach((thisElement) =>
        {
            if (thisElement == null) return;

            currentResult = false;

            smallerArray.forEach((theirElement) =>
            {
                if (theirElement == null) return;

                if (thisElement === theirElement)
                {
                    currentResult = true;
                }
            })

            booleanResults.push(currentResult);
        })


        let values = Object.values(booleanResults);
        let allTrue = values.every(val => val === true);
        let allFalse = values.every(val => val === false);

        if (allTrue)
        {
            overlap = RelationTypes.Full;
        }
        else if (allFalse)
        {
            overlap = RelationTypes.None;
        }
        else
        {
            overlap = RelationTypes.Some;
        }

        return overlap;
    }
}

class Player
{
    constructor()
    {
        this.name = "name";
        this.nation = "nation";
        this.positions = ["position" , "position"];
        this.squad = "squad";
        this.age = 1;
        this.goals = 1;
    }

    PopulatePlayer(array)
    {
        this.name = array["Player"];
        this.nation = array["nation"].split(' ').slice(1).join(' ');
        this.positions = array["position"].split(',')
        this.squad = array["squad"];
        this.age = array["age"];
        this.goals = array["goals"];
    }

    ComparePlayers(inputPlayer)
    {
        return new ComparisonResults(inputPlayer);
    }

}

export async function SettingUpPage()
{
    //get the csvpath for the players

    RemovedWordsIndex = GetARemovedWordsIndex();

    //get all the players for the autocomplete
    await SetUpAutoComplete(["../csv/PremierLeague_2022_2023_Players.csv"], "Player", "input-box", "result-box",RemovedWordsIndex)
}

export function GetPlayer(name)
{
    //todo make a class for getting the players info ant etc
    let PlayerObject = ReturnRow(ArrayOfPlayers, "Player", name)

    if (PlayerObject === undefined || PlayerObject === null)
    {
        console.error("there isn't a player with the name of " + name)
        return null;
    }

    return GetPlayerFromPlayerObject(PlayerObject);
}

export function GetRandomPlayer()
{
    let PlayerObject = ReturnRandomRow(ArrayOfPlayers);

    if (PlayerObject === undefined || PlayerObject === null)
    {
        console.error("PlayerRow was not found");
        return null;
    }

    return GetPlayerFromPlayerObject(PlayerObject);
}

export function SelectNewChosenPlayer()
{
    mysteryPlayer = GetRandomPlayer();
}

export function GetPlayerFromPlayerObject(PlayerRow)
{
    let player = new Player();
    player.PopulatePlayer(PlayerRow);

    return player;
}

export function MakeGuess()
{
    guessNum++;

    let inputBox = document.getElementById("input-box")
    if (inputBox == null) return;

    let inputPlayer = GetPlayer(inputBox.value.trim())
    if (inputPlayer == null) return;

    RemovedWords[RemovedWordsIndex].push(inputPlayer.name);

    let results = mysteryPlayer.ComparePlayers(inputPlayer);
    if (results == null) return;

    ClearInputBox("input-box")

    CheckResults(results)

    //show the results
    MakeHtmlResults(inputPlayer,results)
}

function CheckResults(results)
{
    tipManager.CheckResults(results);
    if (results.name === RelationTypes.Full)
    {
        correctGuessNum = guessNum;
    }
}

function MakeHtmlResults(inputPlayer,results)
{
    if (answerRowIndex === null)
    {
        answerRowIndex = 0;
    }
    else
    {
        answerRowIndex++;
    }

    console.log(inputPlayer);

    let posisitonsString = inputPlayer.positions.map(position => position).join(" , ");

    let i = 1;
    let answers = document.getElementById("answers");

    let allClasses = "answer-rectangle-container opacity-0"

    answers.innerHTML += `
        <div id="answerRowIndex${answerRowIndex}" class="answer-row">
            <div id="Row${answerRowIndex}-0" class="${allClasses}  ${results.ClassName}"> <div class="answer-rectangle">${inputPlayer.name}</div></div>
            <div id="Row${answerRowIndex}-1" class="${allClasses}  ${results.ClassNation}"> <div class="answer-rectangle">${inputPlayer.nation}</div></div>
            <div id="Row${answerRowIndex}-2" class="${allClasses}  ${results.ClassPositions}"> <div class="answer-rectangle">${posisitonsString}</div></div>
            <div id="Row${answerRowIndex}-3" class="${allClasses}  ${results.ClassSquads}"><div class="answer-rectangle">${inputPlayer.squad}</div></div>
            <div id="Row${answerRowIndex}-4" class="${allClasses}  ${results.ClassAge}"><div class="answer-rectangle">${inputPlayer.age}</div></div>
            <div id="Row${answerRowIndex}-5" class="${allClasses}  ${results.ClassGoals}"> <div class="answer-rectangle">${inputPlayer.goals}</div></div>
        </div>
    `;

    AnimateResults()
}

function animateBox(id, delay,finalCorrectAnswer = false)
{
    setTimeout(() =>
    {
        let box = document.getElementById(id);
        box.style.opacity = "1";
        box.style.transform = "translateY(0)";
        if (finalCorrectAnswer) FinishGame()
    }, delay)
}


function AnimateResults()
{
    if (answerRowIndex === null) {
        console.error("answer-rowIndex was not updated");
        return;
    }

    let parent = document.getElementById("answerRowIndex" + answerRowIndex);
    if (!parent) {
        console.error("Parent element not found");
        return;
    }

    let boxes = parent.children;
    if (boxes.length <= 0)
    {
        console.error("Parent does not have children");
        return;
    }

    for (let i = 0; i < boxes.length; i++)
    {
        if (correctGuessNum === guessNum && i === boxes.length-1)
        {
            animateBox(`Row${answerRowIndex}-${i}`,i*400, true);
            continue;
        }
        animateBox(`Row${answerRowIndex}-${i}`,i*400);
    }
}


function FinishGame()
{
    //disable making more guesses
    HideElementByID("search-bar-section")
    let Result = document.getElementById("result-section")
    SetUpResultElement().then(() => ShowAndFocusElement(Result))
    //show finish game element
}

async function SetUpResultElement()
{
    document.getElementById("result-section-title").innerHTML = GetRandomElement(victoryMessages);
    document.getElementById("result-section-guess").innerHTML = `adivinhas-te corretamente ${mysteryPlayer.name}`;
    document.getElementById("result-section-n-tries").innerHTML = `Nº tentativas: ${answerRowIndex+1}`;
    StartUpdatingTimer(30000);
}


function StartUpdatingTimer(interval)
{
    dayTimerStarted = new Date();
    UpdateTimer();
    setInterval(UpdateTimer, interval);
}

function UpdateTimer()
{
    let div = document.getElementById("result-section-timer-until-next-player");
    let hours, minutes;

    let tomorrow = new Date(dayTimerStarted);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (tomorrow.toDateString() === new Date().toDateString())
    {
        hours = 0;
        minutes = 0;
    }
    else
    {
        ({ hours, minutes } = timeUntilNextDay());
        hours = Math.max(hours, 0);
        minutes = Math.max(minutes, 0);
    }
    div.innerText = `Faltam ${hours} horas e ${minutes} minutos até ao próximo jogador.`;
}

function AddOnClickForReturnButtons()
{
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
}
$(document).ready(async function () {

    ArrayOfPlayers = await loadAndParseCsv("../csv/PremierLeague_2022_2023_Players.csv")

    await SettingUpPage();

    await SelectNewChosenPlayer()

    console.log(mysteryPlayer);

    tipManager = new TipManager(mysteryPlayer);
    tipManager.CreateTip(2)
    tipManager.CreateTip(4)
    tipManager.CreateTip(6)


    let submitButton = document.getElementById("submit-btn")
    if (submitButton != null ) submitButton.onclick = MakeGuess;

    AddOnClickForReturnButtons()

    document.getElementById('result-section-link-to-other-games').addEventListener('click', function() {
        window.location.href = 'https://tiagoaperes.github.io/WebGames/';
    });

    //wait for a response from the user

    //compare the two hidden player vs the selected player
    //create a new row with the selected player
    //each information will be compared to chosen player
})