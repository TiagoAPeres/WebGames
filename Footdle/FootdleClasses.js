import {GetElementById} from "../Utilities/Elements.js";
import {RelationTypes, tipManager} from "../Footdle/Footdle.js";

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

        this.selectedCharacteristic = null;

        this.UpdateText()

        this.IsShowing = false;
    }

    UpdateAmountOfTries()
    {
        if (this.IsShowing) return
        if (this.currentAmountOfTries > 0)
        {
            this.currentAmountOfTries--;
            this.UpdateText()
        }
        if (this.currentAmountOfTries <= 0) {this.ShowTooltip()}
    }

    UpdateText()
    {
        this.text.innerText =  `${this.currentAmountOfTries} tentativas até a próxima dica`
    }

    ShowTooltip()
    {
        this.IsShowing = true;

        //todo alter img
        let characteristic = tipManager.GetUnusedCharacteristic();

        if (characteristic == null)
        {
            console.log('Characteristic is null')
            return;
        }



        //this.text.innerText = characteristic.key;
        this.text.innerText = characteristic.tip;

        this.img.src = "../Footdle/tip-revealed.png";

        //this.tooltip.classList.add("tooltip");
        //this.tooltip.classList.remove("tooltip-hidden");
        if (Array.isArray(characteristic.tip))
        {
            this.tooltip.innerText = characteristic.tip[0];
            for (let i = 1; i < characteristic.tip.length; i++) {
                this.tooltip.innerText += characteristic.tip[i];
            }
        }
        else
        {
            this.tooltip.innerText = characteristic.tip;
        }
    }

}



export class TipManager
{
    constructor(mysteryPlayer)
    {
        this.tipsElements = [];

        this.characteristics = []

        this.baseTips = []

        this.SetUpTips(mysteryPlayer);
    }

    SetUpTips(mysteryPlayer)
    {
        if(!mysteryPlayer)
        {
            console.error("No mystery player");
            return;
        }

        this.characteristics = [
            {key :"position", playerWasFoundIt:false, usedInTip:false, tip: "A(s) posição(ões) do jogador é(são) " +mysteryPlayer.positions },
            {key :"squad"   , playerWasFoundIt:false, usedInTip:false, tip: "A equipa do jogador é " + mysteryPlayer.squad },
            {key :"nation"  , playerWasFoundIt:false, usedInTip:false, tip: "A nação do jogador é " + mysteryPlayer.nation },
            {key :"age"     , playerWasFoundIt:false, usedInTip:false, tip: "A idade do jogador era " + mysteryPlayer.age },
            {key :"goals"   , playerWasFoundIt:false, usedInTip:false, tip: "Os golos marcados pelo jogador foram " + mysteryPlayer.goals },
        ]

        const nameParts = mysteryPlayer.name.trim().split(" ");

        if (nameParts.length >= 1)
        {
            this.baseTips = [{key :"firstNameLetter", tip:"A primeira letra do primeiro nome do jogador é " + nameParts[0].charAt(0), usedInTip:false }]
        }

        if (nameParts.length === 2)
        {
            this.baseTips.push({key :"lastNameLetter", tip:"A primeira letra do ultimo nome do jogador é " + nameParts[1].charAt(0), usedInTip:false })
        }
    }

    CreateTip(amountOfTries)
    {
        this.tipsElements.push(new Tip(amountOfTries, this.tipsElements.length ));
    }

    GetUnusedCharacteristic()
    {
        let unusedCharacteristic = this.characteristics.find(characteristic =>
            characteristic.playerWasFoundIt === false && characteristic.usedInTip === false
        );

        // If found, mark it as used and return it.
        if (unusedCharacteristic) {
            unusedCharacteristic.usedInTip = true;
            return unusedCharacteristic;
        }

        // If none in characteristics, try to find one in baseTips.
        unusedCharacteristic = this.baseTips.find(characteristic =>
            characteristic.usedInTip === false
        );

        if (unusedCharacteristic) {
            unusedCharacteristic.usedInTip = true;
            return unusedCharacteristic;
        }

        // If no unused characteristic is found, return null (or any other fallback).
        return null;
    }


    CheckResults(results)
    {
        this.characteristics.forEach(characteristic =>
        {
            let selectedCharacteristic = results.characteristics.find(resultCharc => resultCharc.key === characteristic.key);
            if (selectedCharacteristic === null ) return;

            if (selectedCharacteristic.RelationTypes === RelationTypes.Full || selectedCharacteristic.RelationTypes === RelationTypes.Equal )
            {
                characteristic.playerWasFoundIt = true;
            }
        })


        this.tipsElements.forEach(tip => {tip.UpdateAmountOfTries()})
    }

}