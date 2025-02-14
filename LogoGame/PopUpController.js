
import {HideElementByID, ShowElementByID} from "../Utilities/Elements.js";
import {
    GameWon,
    HideTheLogoGame,
    InitializeGame,
    IsGameDaily,
    leaguePopUpIndex,
    SelectedClubData,
    StartGame
} from "./LogoScript.js";
import {isInstanceOf, isSubclassOf} from "../Utilities/FilesUtil.js";
import {CanPlayDailyToday} from "./DailyCookie.js";




/**
 * Enum for types of Pop-ups.
 * @readonly
 * @enum {{id: number}}
 */
export const PopUpTypes = Object.freeze({
    LeagueSelect: {id: 1},
    ReplayableGameResult: {id: 2},
    DailyGameResult: {id: 3}
});


/**
 * Enum for types of Pop-ups.
 * @readonly
 * @enum {{id: number}}
 */
const ComponentIDs = Object.freeze({
    Background:  1,
    ReturnButton: 2,
    Title: 3,
    Description: 4,
    PlayButton: 5,
    PlayAgainButton:6,
    ExitToMenuButton: 7
});

class PopUp
{
    constructor()
    {
        this.components = []
        this.type = null;
    }

//region Components
    AddComponent(component)
    {
        if(!(component instanceof PopUpElement)) return;
        this.components.push(component);
    }

    AddComponents(components)
    {
        if (!Array.isArray(components) || components.length === 0) return;
        components.forEach(component => {this.AddComponent(component)});
    }

    ShowComponentWithId(ComponentID)
    {
        this.components.forEach(
            component =>
            {
                if(!(component.componentID === ComponentID)) return;
                ShowElementByID(component.id);
            });
    }

    HideComponentWithId(ComponentID)
    {
        this.components.forEach(
            component =>
            {
                if(!(component.componentID === ComponentID)) return;
                HideElementByID(component.id);
            });
    }

    HideAllComponents()
    {
        this.components.forEach(
            component =>
            {
                if(!(component instanceof PopUpElement)) return;
                component.Hide()
            });
    }

    GetComponent(Identifier)
    {
        if((typeof Identifier === "string"))
        {
            return  this.GetComponentWithName(Identifier);
        }
        if((typeof Identifier === "number"))
        {
            return this.GetComponentWithId(Identifier);
        }
        console.error("identifier was neither a number nor a string")
        console.error("the type was" + typeof Identifier)
        return null;
    }

    GetComponentWithId(id)
    {
        let correctComponent;
        this.components.forEach(component =>
            {
                if(!(component.componentID === id)) return;
                correctComponent = component;
            });

        return correctComponent;
    }

    GetComponentWithName(Name)
    {
        this.components.forEach(component =>
            {
                if(!(component.name === nameOfComponent)) return;
                return component;
            });
    }

//endregion


    async Show()
    {
        let component =  await  this.GetComponent(ComponentIDs.Background);
        if (component === undefined || component === null)
        {
            console.error("component not found");
            return
        }
        await component.Show();
    }

    async Hide() {
        let component =  await  this.GetComponent(ComponentIDs.Background);
        if (component === undefined || component === null)
        {
            console.error("component not found");
            return
        }
        await component.Hide();
    }

    async UpdateElements()
    {
        if (this.type === null)
        {
            console.error("Pop ups type is null")
            return
        }
        await popUp.type.UpdateInfo();
    }

    ChangeType(Type)
    {
        if (!(isSubclassOf(Type, PopUpTypesMethods))) return;
        this.type = Type;
        this.ChangeLayout()
    }

    ChangeLayout()
    {
        if (!(isSubclassOf(this.type, PopUpTypesMethods))) return;

        this.type.ChangeLayout();
    }


}

export let popUp = new PopUp()

export async function PopulatePopUp()
{
    let components =
        [
            popUpBackground,
            popUpReturnButton,
            popUpTitle,
            popUpDescription,
            popUpPlayButton,
            popUpExitToMenuButton,
            popUpPlayAgainButton
        ]
    popUp.AddComponents(components)
}

class PopUpTypesMethods
{
    static ChangeLayout()
    {
        throw new Error("Method 'ChangeLayout()' must be implemented.");
    }

    static UpdateInfo()
    {
        throw new Error("Method 'UpdateInfo()' must be implemented.");
    }
}

export class DailyGameResult extends PopUpTypesMethods
{
    static ChangeLayout()
    {
        if (!(isInstanceOf(popUp, PopUp))) return;

        popUp.HideAllComponents();

        popUp.ShowComponentWithId(ComponentIDs.Title)
        popUp.ShowComponentWithId(ComponentIDs.Description)
        popUp.ShowComponentWithId(ComponentIDs.ExitToMenuButton)
    }

    static async UpdateInfo()
    {
        if (!(isInstanceOf(popUp, PopUp)))  return

        if (GameWon)
        {
            popUp.GetComponent(ComponentIDs.Title).Update("🎉 JOGO VENCIDO! 🎉")
            popUp.GetComponent(ComponentIDs.Description).Update("<p>Parabéns! Hoje conseguiste adivinhar corretamente. Excelente trabalho! 👏⚽</p>")
        }
        else
        {
            popUp.GetComponent(ComponentIDs.Title).Update("JOGO PERDIDO")
            popUp.GetComponent(ComponentIDs.Description).Update(
                "O clube correto era " + SelectedClubData.team + "."
                +"<p>Infelizmente, hoje não conseguiste adivinhar corretamente.</p>"
                +"<p>Mas não desanimes! Tenta outra vez amanhã. 💪⚽</p>")
        }

        popUp.GetComponent(ComponentIDs.ExitToMenuButton).Update(() =>
        {
            HideTheLogoGame();
            popUp.Hide();
        })

    }
}

export class ReplayableGameResult extends PopUpTypesMethods
{
    static ChangeLayout()
    {
        if (!(isInstanceOf(popUp, PopUp)))  return

        popUp.HideAllComponents();

        popUp.ShowComponentWithId(ComponentIDs.Title)
        popUp.ShowComponentWithId(ComponentIDs.Description)
        popUp.ShowComponentWithId(ComponentIDs.PlayAgainButton)
        popUp.ShowComponentWithId(ComponentIDs.ExitToMenuButton)
    }

    static async UpdateInfo()
    {
        if (!(isInstanceOf(popUp, PopUp))) return

        if (GameWon)
        {
            popUp.GetComponent(ComponentIDs.Title).Update("🎉 JOGO VENCIDO! 🎉")
            popUp.GetComponent(ComponentIDs.Description).Update("<p>Parabéns! Fizeste um ótimo trabalho. 👏😃</p>")
        }
        else
        {
            popUp.GetComponent(ComponentIDs.Title).Update("❌ JOGO PERDIDO ❌")
            popUp.GetComponent(ComponentIDs.Description).Update("<p>O clube correto era <strong>" + SelectedClubData.team + "</strong>.</p>" +
                "<p>Não desistas! Tenta novamente 💪⚽</p>")

        }

        popUp.GetComponent(ComponentIDs.PlayAgainButton).Update(() =>
        {
            InitializeGame()
            popUp.Hide();
        })

        popUp.GetComponent(ComponentIDs.ExitToMenuButton).Update(() =>
        {
            HideTheLogoGame();
            popUp.Hide();
        })

        await popUp.Show()
    }

    static async #UpdateDaily()
    {
        if (GameWon)
        {
            popUp.GetComponent(ComponentIDs.Title).Update("🎉 JOGO VENCIDO! 🎉")
            popUp.GetComponent(ComponentIDs.Description).Update("<p>Parabéns! Hoje conseguiste adivinhar corretamente. Excelente trabalho! 👏⚽</p>")
            document.getElementById("game-result-popup-title").textContent = "🎉 JOGO VENCIDO! 🎉";;
            document.getElementById("game-result-popup-description").innerHTML = "<p>Parabéns! Hoje conseguiste adivinhar corretamente. Excelente trabalho! 👏⚽</p>";
        }
        else
        {
            document.getElementById("game-result-popup-title").textContent = "JOGO PERDIDO";
            document.getElementById("game-result-popup-description").innerHTML =
                "O clube correto era " + SelectedClubData.team + "."
                +"<p>Infelizmente, hoje não conseguiste adivinhar corretamente.</p>"
                +"<p>Mas não desanimes! Tenta outra vez amanhã. 💪⚽</p>"
        }

        document.getElementById("game-result-popup-button").innerHTML = "SAIR"
        document.getElementById("game-result-popup-button").onclick = () =>
        {

            HideTheLogoGame();
            popUp.Hide();

        }
    }

    static async #UpdateNonDaily()
    {
        if (GameWon)
        {
            popUp.GetComponent(ComponentIDs.Title).Update("🎉 JOGO VENCIDO! 🎉")
            popUp.GetComponent(ComponentIDs.Description).Update("<p>Parabéns! Fizeste um ótimo trabalho. 👏😃</p>")
        }
        else
        {
            popUp.GetComponent(ComponentIDs.Title).Update("❌ JOGO PERDIDO ❌")
            popUp.GetComponent(ComponentIDs.Description).Update("<p>O clube correto era <strong>" + SelectedClubData.team + "</strong>.</p>" +
                "<p>Não desistas! Tenta novamente 💪⚽</p>")

        }

        popUp.GetComponent(ComponentIDs.PlayAgainButton).Update(() =>
        {
            InitializeGame()

            popUp.Hide();
        } , "JOGAR OUTRA VEZ")

    }
}

export class LeagueSelect extends PopUpTypesMethods
{
    static ChangeLayout()
    {
        if (!(isInstanceOf(popUp, PopUp)))  return

        popUp.HideAllComponents();

        popUp.ShowComponentWithId(ComponentIDs.ReturnButton)
        popUp.ShowComponentWithId(ComponentIDs.Title)
        popUp.ShowComponentWithId(ComponentIDs.Description)
        popUp.ShowComponentWithId(ComponentIDs.PlayButton)
    }

    static UpdateInfo()
    {
        if (!(isInstanceOf(popUp, PopUp)))  return

        if (leaguePopUpIndex === null) return;


        popUp.GetComponent(ComponentIDs.Title).Update(PopUpInformation[leaguePopUpIndex].title);
        popUp.GetComponent(ComponentIDs.Description).Update(PopUpInformation[leaguePopUpIndex].description);

        popUp.GetComponent(ComponentIDs.PlayButton).Update(() =>
        {
            StartGame();
            popUp.Hide();
        })

        if (IsGameDaily) this.AddDailyGameStatusPrefix();

        popUp.Show();
    }

    static AddDailyGameStatusPrefix()
    {
        let descriptionElement =  document.getElementById(popUp.GetComponent(ComponentIDs.Description).id);

        let description = descriptionElement.innerHTML;

        let PrefixString;

        if (CanPlayDailyToday())
        {
            PrefixString = "<p class='green-text'>" +"Ainda podes jogar hoje</p>"
        }
        else
        {
            PrefixString = "<p class='red-text'>" +"Já não podes jogar hoje</p>"
        }

        descriptionElement.innerHTML = PrefixString + description;
    }
}


class PopUpElement
{
    constructor(name, id ,componentID) {
        this.name = name;
        this.element = null;
        this.id = id;
        this.componentID = componentID;
    }

    Show()
    {
        ShowElementByID(this.id);
    };

    Hide()
    {
        HideElementByID(this.id);
    };

    Update()
    {
        throw new Error("Method 'Update()' must be implemented in derived class.");
    };


}

class PopUpText extends PopUpElement
{
    Update(string)
    {
        document.getElementById(this.id).innerHTML = string;
    };

}

class PopUpButton extends PopUpElement
{
    Update(callback,string = null)
    {
        if  (string != null)
        {
            document.getElementById(this.id).textContent = string;
        }
        document.getElementById(this.id).onclick = callback;
    };

}

let popUpBackground = new PopUpElement("Background","popup-background",ComponentIDs.Background);
let popUpReturnButton = new PopUpElement("ReturnButton","popup-button-return-button",ComponentIDs.ReturnButton);
let popUpTitle = new PopUpText("Title","popup-title",ComponentIDs.Title);
let popUpDescription = new PopUpText("Description","popup-description",ComponentIDs.Description);
let popUpPlayButton = new PopUpButton("PlayButton","popup-button",ComponentIDs.PlayButton);
let popUpPlayAgainButton = new PopUpButton("PlayAgainButton","popup-play-button",ComponentIDs.PlayAgainButton);
let popUpExitToMenuButton = new PopUpButton("ExitToMenuButton","popup-exit-button",ComponentIDs.ExitToMenuButton);


function isPopUpType(value)
{
    return Object.values(PopUpTypes).includes(value);
}

let PopUpElements =
{
    Background:
    {
        id:"popup-background",
        element:null
    },

    ReturnButton:
    {
        id:"popup-button-return-button",
        element:null
    },

    Title:
    {
        id:"popup-title",
        element:null,
    },

    Description:
    {
        id:"popup-description",
        element:null
    },

    PlayButton:
    {
        id:"popup-button",
        element:null
    },

    PlayAgainButton:
    {
        id:"popup-play-button",
        element:null
    },

    ExitToMenuButton:
    {
        id:"popup-exit-button",
        element:null
    }
}

let PopUpInformation =
{
    daily: {
        "title": "Jogo do Logotipo - Diário",
        "description":
            "<p class='pop-up-description-highlighted-text'>Tens 5 tentativas para adivinhar a que clube pertence o logotipo.</p>" +
            "<p>O logotipo começará desfocado e ficará mais nítido à medida que o jogo avança.</p>" +
            "<p>Neste modo, qualquer clube pode aparecer.</p>" +
            "<p>Boa sorte! 🍀</p>"
    },

    PrimeiraLiga: {
        "title": "Jogo do Logotipo - Primeira Liga",
        "description":
            "<p class='pop-up-description-highlighted-text'>Tens 5 tentativas para adivinhar a que clube pertence o logotipo.</p>" +
            "<p>O logotipo começará desfocado e ficará mais nítido à medida que o jogo avança.</p>" +
            "<p>Neste modo, apenas clubes da Primeira Liga aparecerão.</p>" +
            "<p>Boa sorte! ⚽</p>"
    },

    International: {
        "title": "Jogo do Logotipo - Internacional",
        "description":
            "<p class='pop-up-description-highlighted-text'>Tens 5 tentativas para adivinhar a que clube pertence o logotipo.</p>" +
            "<p>O logotipo começará desfocado e ficará mais nítido à medida que o jogo avança.</p>" +
            "<p>Neste modo, apenas clubes da liga internacional aparecerão.</p>" +
            "<p>Boa sorte! 🌍</p>"
    },

    PremierLeague: {
        "title": "Jogo do Logotipo - Premier League",
        "description":
            "<p class='pop-up-description-highlighted-text'>Tens 5 tentativas para adivinhar a que clube pertence o logotipo.</p>" +
            "<p>O logotipo começará desfocado e ficará mais nítido à medida que o jogo avança.</p>" +
            "<p>Neste modo, apenas clubes da Premier League aparecerão.</p>" +
            "<p>Boa sorte! 🏆</p>"
    }
};
