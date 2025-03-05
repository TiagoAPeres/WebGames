/**
 * Enum for types of comparisons.
 * @readonly
 * @enum {{id: number}}
 */
const Comparisons = Object.freeze({
    ABOVE: {id: 1},
    BELOW: {id: 2},
    EQUAL: {id: 3}
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

    checkData(ObjectData) {
        if (!(typeof ObjectData === typeof this.data)) {
            return false;
        }

        if (this.comparison === Comparisons.ABOVE) {
            return this.Above(ObjectData);
        } else if (this.comparison === Comparisons.BELOW) {
            return this.Below(ObjectData);
        } else if (this.comparison === Comparisons.EQUAL) {
            return this.Equal(ObjectData);
        }
    }

    Above(Data) {
        return Data > this.data;
    }

    Below(Data) {
        return Data < this.data;
    }

    Equal(Data) {
        return Data === this.data;
    }

    static isArrayOfThisClass(parameter) {
        if (!Array.isArray(parameter)) {
            return false;
        }
        return parameter.every(item => item instanceof this);
    }
}


export function ReturnRow(ArrayData, DataName, Data) {
    if (!ArrayData || ArrayData.length === 0) {
        console.error('ArrayData is empty or undefined');
        return null;
    }
    return ArrayData.find(row => row[DataName] === Data);
}

export function ReturnRandomRow(ArrayData) {
    if (!ArrayData || ArrayData.length === 0) {
        console.error('ArrayData is empty or undefined');
        return null;
    }
    const randomIndex = Math.floor(Math.random() * ArrayData.length);
    return ArrayData[randomIndex];
}


/**
 * Method that returns an Array made of each row
 * @param {string} csvPath - URL or path to the CSV file
 * @returns {Promise<Array>} - Parsed CSV data as an array of objects
 */
export function loadAndParseCsv(csvPath) {
    return new Promise((resolve, reject) => {
        Papa.parse(csvPath,
            {
                download: true,
                header: true,
                complete: function (results) {
                    if (results.data.length <= 0) {
                        console.error("no data was found in the csvPath: " + csvPath)
                    }
                    resolve(results.data);
                },
                error: function (error) {
                    console.error('Error loading remote CSV:', error);
                    reject(error);
                }
            });
    });
}

export async function loadAndParseCsvArray(CsvPaths)
{
    let allCsvObjects = [];
    for (let path of CsvPaths) {
        const result = await loadAndParseCsv(path);

        if (result) {
            allCsvObjects = allCsvObjects.concat(result);
        } else {
            console.error('Wrong path: ' + path);
        }

    }


    if (allCsvObjects.length === 0) {
        console.error('No data was able to be retrieved from the CsvPaths')
        return []
    }
    return allCsvObjects
}


class QueryCsv {
    /**
     * Method retrieves data from the csv paths and using the conditions it
     * sanitizes the data to fit the conditions
     * @enum {{CsvPaths: string[], Conditions: Condition[]}}
     *
     */
    static async getSpecificElements(CsvPaths, Conditions) {
        //use the csv paths to get in the end 1 array with the objects from all the arrays
        //use all the conditions to filter out the objects that respect all the conditions
        //in the end you will have an array with only object that respect the conditions

        let allCsvObjects = [];

        if (CsvPaths == null || Array.isArray(CsvPaths) || CsvPaths.length === 0) {
            console.error('No Array of CsvPathsProvided')
            return []
        }


        try {
            for (let path of CsvPaths) {
                const result = await loadAndParseCsv(path);

                if (result) {
                    allCsvObjects = allCsvObjects.concat(result);
                } else {
                    console.error('Wrong path: ' + path);
                }
            }

            if (allCsvObjects.length === 0) {
                console.error('No data was able to be retrieved from the CsvPaths')
                return []
            }

            console.log('Unsanatized CSV Data:', allCsvObjects);

            let result = await this.SanitizeData(allCsvObjects, Conditions);

            console.log('sanatized CSV Data:', result);

            return result;

        } catch (error) {
            console.error('Error during CSV processing:', error);
            return [];
        }
    }

    static async SanitizeData(Data, Conditions) {
        if (!(Condition.isArrayOfThisClass(Conditions))) {
            console.error("Conditions weren't a Array of Condition");
            return [];
        }

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

        if (Data.length <= 0) {
            console.error("there is no data that means the conditions");
        }

        return Data;
    }

    static CastToCorrectType(Data) {
        let str = Data;
        str = Data.trim();
        if (/^[0-9]+$/.test(str.replace(/\s+/g, ""))) {
            return parseFloat(str);
        }
        return Data;
    }


}

