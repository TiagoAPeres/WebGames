import {loadAndParseCsv, loadAndParseCsvArray} from './queryCsv.js';
let words = []

/**
 * Method that sets an element to autoComplete based on a csvPath
 * @enum {{csvUrl: string}}
 *
 */
export async function SetUpAutoComplete(csvPath, dataType, InputId, ResultId) {
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

    SetAutoCompleteToElement(InputId,ResultId)
}


function SetAutoCompleteToElement(InputId, ResultId)
{
    const resultsBox = document.getElementById(ResultId);
    const inputBox = document.getElementById(InputId);

    inputBox.onkeyup = function () {
        let result = [];
        let input = inputBox.value;
        if (input.length)
        {
            result = words.filter(word => {
                return word.toLowerCase().includes(input); // Check if the string contains the input
            });
            console.log(result);
        }

        display(result,resultsBox,inputBox);

        if (!result.length)
        {
            resultsBox.innerHTML = '';
        }
    }
}


function display(result,resultsBox,inputBox)
{
    const content = result.map((item) => {
        return `<li onclick="selectInput(this,resultsBox,inputBox)">${item}</li>`;
    });

    resultsBox.innerHTML = `<ul>${content.join('')}</ul>`;
}

function selectInput(list,resultsBox,inputBox)
{
    inputBox.value = list.innerHTML;
    resultsBox.innerHTML = '';
}
