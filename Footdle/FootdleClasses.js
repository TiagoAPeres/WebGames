import {GetElementById} from "../Utilities/Elements.js";

let baseIdString = "tip-";
let baseImgIdString = "img-";
let baseTextIdString = "text-";
let baseTooltipIdString = "tooltip-";

export class Tip
{
    constructor(amountOfTries, tipNum)
    {
        this.img = GetElementById(baseIdString + baseImgIdString + tipNum);
        this.text = GetElementById(baseIdString + baseTextIdString + tipNum);
        this.tooltip = GetElementById(baseIdString + baseTooltipIdString + tipNum);
        this.totalAmountOfTries = amountOfTries ;
        this.currentAmountOfTries = amountOfTries;

        this.UpdateText()
    }

    UpdateAmountOfTries()
    {
        this.currentAmountOfTries--;
        this.UpdateText()
        if (this.currentAmountOfTries <= 0) {this.ShowTooltip()}
    }

    UpdateText()
    {
        this.text.innerText =  `${this.currentAmountOfTries} tentativas ate a próxima dica`
    }

    ShowTooltip()
    {
        //todo alter img

        this.text.innerText = "Dica"

        this.tooltip.classList.add("tooltip");
        this.tooltip.classList.remove("tooltip-hidden");
    }

}



export class TipManager
{
    constructor()
    {
        this.tips = [];

        this.charcteristics = [
            {key :"position" , value:false},
            {key :"team" , value:false},
            {key :"nation" , value:false},
            {key :"age" , value:false},
            {key :"goals" , value:false},
        ]
    }

    CreateTip(amountOfTries)
    {
        this.tips.push(new Tip(amountOfTries, this.tips.length ));
    }

    //check if any new characteristc got got
    CheckResults(results)
    {
        this.tips.forEach(tip => {tip.UpdateAmountOfTries()})
    }

}