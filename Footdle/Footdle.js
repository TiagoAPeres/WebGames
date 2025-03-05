import {SetUpAutoComplete} from "../Utilities/autocomplete.js";
import {loadAndParseCsv, ReturnRandomRow, ReturnRow} from "../Utilities/queryCsv.js";

let mysteryPlayer = null
let ArrayOfPlayers = null
let inputPlayers = []

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
    }

    CompareNumbers(thisNumber, theirNumber)
    {
        /* the player to figure out is the this*/
        if ( thisNumber === theirNumber ) return "equal";

        if (thisNumber > theirNumber) return "bigger";

        if (thisNumber < theirNumber) return "smaller";
    }

    CompareStrings(thisString, theirString)
    {
        return thisString === theirString;
    }

    CompareArrayOfStrings(thisArray, theirArray)
    {
        let booleanResults = {};
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
            overlap =  "full";
        }
        else if (allFalse)
        {
            overlap = "none";
        }
        else
        {
            overlap = "some";
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

    //get all the players for the autocomplete
    await SetUpAutoComplete(["../csv/PremierLeague_2022_2023_Players.csv"], "Player", "input-box", "result-box")
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
    let inputBox = document.getElementById("input-box")
    if (inputBox == null) return;

    let inputPlayer = GetPlayer(inputBox.value.trim())
    if (inputPlayer == null) return;

    let results = mysteryPlayer.ComparePlayers(inputPlayer);
    if (results == null) return;

    //show the results

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