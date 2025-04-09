export async function HideElementByID(id)
{
    let element = document.getElementById(id);
    await HideElement(element);
}

export async function ShowElementByID(id)
{
    let element = document.getElementById(id);
    await ShowElement(element);
}

export async function HideElement(element)
{
    if (element == null) return;
    element.classList.toggle('hidden',true);
    element.classList.toggle('visible',false);
}

export async function ShowElement(element)
{
    if (element == null) return;

    element.classList.toggle('hidden',false);
    element.classList.toggle('visible',true);
}

export function ClearInputBox(id)
{
    document.getElementById(id).value = "";
}

export async function ShowAndFocusElement(element)
{
    if (element == null) return;

    element.classList.toggle('hidden',false);
    element.classList.toggle('visible',true);
    element.scrollIntoView({ behavior: "smooth" , block: "center"});
}

export function GetElementById(id)
{
    let element = document.getElementById(id);
    if (element == null) {
        console.error(`Element with the id ${id} not found`);
    };
    return element;
}
