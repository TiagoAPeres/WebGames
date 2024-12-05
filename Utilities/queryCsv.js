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
}



class QueryCsv
{
    static getSpecificElements(CsvPaths,Conditions)
{
    //use the csv paths to get in the end 1 array with the objects from all the arrays
    //use all the conditions to filter out the objects that respect all the conditions
    //in the end you will have an array with only object that respect the conditions

}

}