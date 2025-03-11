import {loadAndParseCsv, loadAndParseCsvArray} from './queryCsv.js';
let words = []
export let RemovedWords = []

export function GetARemovedWordsIndex()
{
    if (RemovedWords == null || RemovedWords.length === 0)
    {
        RemovedWords = [];
    }

    RemovedWords[RemovedWords.length ] = [];
    return RemovedWords.length - 1;
}


/**
 * Method that sets an element to autoComplete based on a csvPath
 * @enum {{csvUrl: string}}
 *
 */
export async function SetUpAutoComplete(csvPath, dataType, InputId, ResultId, RemovedWordsIndex = null) {
    try
    {
        let result = await loadAndParseCsvArray(csvPath)

        if (result.length <= 0 || !Array.isArray(result))
        {
            console.error('no data retrieved from the CSV');
            return null
        }

        for (let i = 0; i < result.length ; i++)
        {
            words[i] = result[i][dataType];
        }

        console.log('Processed words:', words);
    }
    catch (err)
    {
        console.error('Error loading word list:', err);
    }

    SetAutoCompleteToElement(InputId,ResultId,RemovedWordsIndex)
}


function SetAutoCompleteToElement(InputId, ResultId, RemovedWordsIndex)
{
    const resultsBox = document.getElementById(ResultId);
    const inputBox = document.getElementById(InputId);
    if (inputBox == null || resultsBox == null)
    {
        console.error("no input box or results box")
        return
    }

    inputBox.onkeyup = function ()
    {
        if (RemovedWordsIndex != null)
        {
            CleanWords(RemovedWordsIndex)
        }

        let result = [];
        let input = inputBox.value;
        if (input.length)
        {
            result = words.filter(word => {
                return word.toLowerCase().includes(input.toLowerCase()); // Check if the string contains the input
            });
            console.log(result);
        }

        display(result,InputId,ResultId);

        if (!result.length)
        {
            resultsBox.innerHTML = '';
        }
    }
}


function display(result,InputId,ResultId)
{
    const resultsBoxHere = document.getElementById(ResultId);
    const inputBoxHere = document.getElementById(InputId);

    // Clear existing content
    resultsBoxHere.innerHTML = '';

    // Create a list element and attach event listeners
    const ul = document.createElement('ul');

    result.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;

        // Attach click event listener
        li.addEventListener('click', () => {
            selectInput(li, resultsBoxHere, inputBoxHere);
        });

        ul.appendChild(li);
    });

    resultsBoxHere.appendChild(ul);
}

function selectInput(list, resultsBox, inputBox) {
    inputBox.value = list.textContent;
    resultsBox.innerHTML = ''; // Clear the results
}

function CleanWords(RemovedWordsIndex)
{
    words = words.filter(word => {
        return !RemovedWords[RemovedWordsIndex].some(excluded => excluded.toLowerCase() === word.toLowerCase());
    });
}