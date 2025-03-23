import {GetARemovedWordsIndex, RemovedWords, SetUpAutoComplete} from "../Utilities/autocomplete.js";
import {loadAndParseCsv, ReturnRandomRow, ReturnRow} from "../Utilities/queryCsv.js";
import {ClearInputBox} from "../Utilities/Elements.js";

let mysteryPlayer = null
let ArrayOfPlayers = null
//let ListOfChosenPlayers = null
let RemovedWordsIndex = null
let inputPlayers = []
let answerRowIndex = null

let guessNum = -1;
let correctGuessNum = null

/* Enum for types of overlap between information.
* @readonly
* @enum {{id: number}}
*/
const RelationTypes  = Object.freeze({
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

        this.name = this.CompareStrings(mysteryPlayer.name, inputPlayer.name);
        this.nation = this.CompareStrings(mysteryPlayer.name, inputPlayer.name);
        this.positions = this.CompareArrayOfStrings(mysteryPlayer.positions, inputPlayer.positions);
        this.squad = this.CompareStrings(mysteryPlayer.name, inputPlayer.name);
        this.age = this.CompareNumbers(mysteryPlayer.age, inputPlayer.age);
        this.goals = this.CompareNumbers(mysteryPlayer.goals, inputPlayer.goals);



        this.ClassName = ""

        this.ClassNation = this.AddClassNames(this.nation);
        this.ClassPositions = this.AddClassNames(this.positions);
        this.ClassSquads = this.AddClassNames(this.squad);
        this.ClassAge = this.AddClassNames(this.age);
        this.ClassGoals = this.AddClassNames(this.goals);

        /*if (this.nation === true)
            {this.ClassNation = "green-background"}
        else
            {this.ClassNation = "red-background"}

        switch (this.positions)
        {
            case "full":
                this.ClassPositions = "green-background"
                break;
            case "some":
                this.ClassPositions = "orange-background"
                break;
            case "none":
                this.ClassPositions = "red-background"
                break;
        }

        if (this.squad === true)
            {this.ClassSquads = "green-background"}
        else
            {this.ClassSquads = "red-background"}

        switch (this.age)
        {
            case "equal":
                this.ClassAge = "green-background"
                break;
            case "bigger":
                this.ClassAge = "red-background arrow-up-background"
                break;
            case "smaller":
                this.ClassAge = "red-background arrow-down-background"
                break;
        }

        switch (this.goals)
        {
            case "equal":
                this.ClassGoals = "green-background"
                break;
            case "bigger":
                this.ClassGoals = "red-background arrow-up-background"
                break;
            case "smaller":
                this.ClassGoals = "red-background arrow-down-background"
                break;
        }*/

        //return an object with the classes for the divs
        //this.name = //NOTHING
        //this.nation = //green red
        //this.positions = //green yellow red
        //this.squad = //green red
        //this.age = //green red -- arrow
        //this.goals = //green red -- arrow
    }


    AddClassNames(dataVariable)
    {
        let returnString = ""
        if (dataVariable === RelationTypes.Equal || dataVariable === RelationTypes.Full)
        {
            returnString += "green-background"
        }
        if (dataVariable === RelationTypes.Some)
        {
            returnString += "orange-background"
        }
        if (dataVariable === RelationTypes.Bigger || dataVariable === RelationTypes.Smaller || dataVariable === RelationTypes.None)
        {
            returnString += "red-background"

            if(dataVariable === RelationTypes.Bigger)
            {
                returnString += "arrow-up-background"
            }

            if(dataVariable === RelationTypes.Smaller)
            {
                returnString += "arrow-down-background"
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
        //return thisString === theirString;
    }

    CompareArrayOfStrings(thisArray, theirArray)
    {
        let booleanResults = [];
        let currentResult = false;
        let overlap = "none"

        thisArray.forEach((thisElement) =>
        {
            if (thisElement == null) return;

            currentResult = false;

            theirArray.forEach((theirElement) =>
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
            //overlap =  "full";
        }
        else if (allFalse)
        {
            overlap = RelationTypes.None;
            //overlap = "none";
        }
        else
        {
            overlap = RelationTypes.Some;
            //overlap = "some";
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

    let posisitonsString = inputPlayer.positions.map(position => position).join(" , ");

    let i = 1;
    let answers = document.getElementById("answers");

    let allClasses = "answer-rectangle opacity-0"

    answers.innerHTML += `
        <div id="answerRowIndex${answerRowIndex}" class="answer-row">
            <div id="Row${answerRowIndex}-0" class="${allClasses} ${results.ClassName}">${inputPlayer.name}</div>
            <div id="Row${answerRowIndex}-1" class="${allClasses}  ${results.ClassNation}">${inputPlayer.nation}</div>
            <div id="Row${answerRowIndex}-2" class="${allClasses}  ${results.ClassPositions}">${posisitonsString}</div>
            <div id="Row${answerRowIndex}-3" class="${allClasses}  ${results.ClassSquads}">${inputPlayer.squad}</div>
            <div id="Row${answerRowIndex}-4" class="${allClasses}  ${results.ClassAge}">${inputPlayer.age}</div>
            <div id="Row${answerRowIndex}-5" class="${allClasses}  ${results.ClassGoals}">${inputPlayer.goals}</div>
        </div>
    `;

    AnimateResults()
}

function animateBox(id, delay)
{
    setTimeout(() =>
    {
        let box = document.getElementById(id);
        box.style.opacity = "1";
        box.style.transform = "translateY(0)";
    }, delay)
}

/*async function animateBox(box) {
    console.log("box" + box.innerHTML);
    box.classList.remove("opacity-0");
    box.classList.add("opacity-1");
    box.offsetHeight;
    box.style.opacity = "1";
    box.style.transform = "translateY(0)";
}*/

/*function animateBox(rowIndex, childIndex) {

    let parent = document.getElementById("answerRowIndex" + rowIndex);
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

    boxes[childIndex].classList.remove("opacity-0");
    boxes[childIndex].classList.add("opacity-1");
    /*box.offsetHeight;
    box.style.opacity = "1";*/
    /*box.style.transform = "translateY(0)";
}*/

function AnimateResults() {
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
        animateBox(`Row${answerRowIndex}-${i}`,i*400);
        /*AddAction(animateBox, i*1000,`Row${answerRowIndex}-${i}`);*/
        /*boxes[i].classList.add('animate__bounce', 'animate__delay-'+i+'s');

        boxes[i].addEventListener('animationend', () => {
            boxes[i].classList.remove('animate__bounce');
        });*/

    }


    //add animations
    /*boxes[0].classList.add('animate__bounce');
    boxes[0].addEventListener('animationend', () => {
        boxes[0].classList.remove('animate__bounce');
    });

    for (let i = 1; i < boxes.length; i++)
    {
        boxes[i].classList.add('animate__bounce', 'animate__delay-'+i+'s');

        boxes[i].addEventListener('animationend', () => {
            boxes[i].classList.remove('animate__bounce');
        });

    }*/
    
    /*set timeout
    for (let i = 0; i < boxes.length; i++) {
        let box = boxes[i];
        box.style.opacity = "0"; // Capture the current box reference
        animateBox(box,i*400);
    }*/

    /*console.log("done"  +  answerRowIndex);*/
    /*setTimeout(() => { console.log(answerRowIndex + "1");},1000)
    setTimeout(() => { console.log(answerRowIndex + "2");},2000)
    setTimeout(() => { console.log(answerRowIndex + "3");},3000)
    setTimeout(() => { console.log(answerRowIndex + "4");},4000)
    setTimeout(() => { console.log(answerRowIndex + "5");},5000)
    setTimeout(() => { console.log(answerRowIndex + "6");},6000)
    setTimeout(() => { console.log(answerRowIndex + "7");},7000)*/

    }




$(document).ready(async function () {

    ArrayOfPlayers = await loadAndParseCsv("../csv/PremierLeague_2022_2023_Players.csv")

    await SettingUpPage();

    await SelectNewChosenPlayer()

    console.log(mysteryPlayer);

    let submitButton = document.getElementById("submit-btn")
    if (submitButton != null ) submitButton.onclick = MakeGuess;

    //wait for a response from the user

    //compare the two hidden player vs the selected player
    //create a new row with the selected player
    //each information will be compared to chosen player
})