/**
 * Enum for types of comparisons.
 * @readonly
 * @enum {{id: number}}
 */
const Comparisons = Object.freeze({
    ABOVE: { id: 1 },
    BELOW: { id: 2 },
    EQUAL: { id: 3 }
});


/**
 * Class that creates conditions used to sanitize data.
 * @enum {{datatype: string, comparison: Enumerator, data: object }}
 *
 */
class Condition {
    constructor(datatype, comparison, data) {
        this.datatype = datatype;
        this.comparison = comparison;
        this.data = data;
    }

    checkData(ObjectData)
    {
        if (!(typeof ObjectData === typeof this.data)) {return false;}

        if (this.comparison === Comparisons.ABOVE)
        {
            return  this.Above(ObjectData);
        }
        else if (this.comparison === Comparisons.BELOW)
        {
            return this.Below(ObjectData);
        }
        else if (this.comparison === Comparisons.EQUAL)
        {
            return this.Equal(ObjectData);
        }
    }

    Above(Data)
    {
        return Data > this.data;
    }

    Below(Data)
    {
        return Data < this.data;
    }

    Equal(Data)
    {
        return Data === this.data;
    }
}
function loadAndParseCsv(csvUrl) {
    return new Promise((resolve, reject) => {
        Papa.parse(csvUrl,
            {
            download: true,
            header: true,
            complete: function (results)
            {
                resolve(results.data);
            },
            error: function (error) {
                console.error('Error loading remote CSV:', error);
                reject(error);
            }
        });
    });
}


$(document).ready(function ()
{
    let CsvPaths = ['../csv/FIFA_World_Cups.csv','../csv/FIFA_World_Cups.csv', '../csv/PremierLeague_2022_2023_Players.csv'];
    let Conditions = [new Condition("1st", Comparisons.EQUAL, "Brazil") ];
    QueryCsv.getSpecificElements(CsvPaths,Conditions);
});


class QueryCsv
{
    static async getSpecificElements(CsvPaths, Conditions)
    {
        //use the csv paths to get in the end 1 array with the objects from all the arrays
        //use all the conditions to filter out the objects that respect all the conditions
        //in the end you will have an array with only object that respect the conditions

        let allCsvObjects = [];

        try
        {
            for (let path of CsvPaths)
            {
                const result = await loadAndParseCsv(path);
                if (result) {allCsvObjects = allCsvObjects.concat(result); }
            }

            console.log('Unsanatized CSV Data:', allCsvObjects);

            let result = await this.SanitizeData(allCsvObjects,Conditions);

            console.log('sanatized CSV Data:', result);

            return result;

        }
        catch (error)
        {
            console.error('Error during CSV processing:', error);
            return [];
        }


    }

    static async SanitizeData(Data, Conditions)
    {
        /*if (!(Conditions instanceof Condition))
        {
            console.error("No conditions were sent");
            return [];
        }*/

        for (let condition of Conditions) {
            for (let i = Data.length - 1; i >= 0; i--) {
                let data = Data[i];
                let retrievedData = data[condition.datatype];

                if (retrievedData == null || typeof retrievedData != "string") {
                    Data.splice(i, 1);
                    continue;
                }

                if (!condition.checkData(QueryCsv.CastToCorrectType(retrievedData))) {
                    Data.splice(i, 1);
                }


            }
        }

        if (Data.length <= 0) {console.error("there is no data that means the conditions");}

        return Data;
    }

    static CastToCorrectType(Data)
    {
        let str = Data;
        str = Data.trim();
        if (/^[0-9]+$/.test(str.replace(/\s+/g, "")))
        {
            return parseFloat(str);
        }

        return Data;

    }



}

