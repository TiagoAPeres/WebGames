import {loadAndParseCsv} from '/Utilities/queryCsv.js'
import {fetchFileList, getDailyRandomIndex} from '/Utilities/FilesUtil.js'
import {maxlives} from "./LogoScript.js";

/**
 * Class is used to store the daily logo selected
 * @enum {{selectedLogoPath: string, SelectedClubData: string}}
 *
 */
class LogoInfo
{
    constructor(selectedLogoPath, SelectedClubData) {
        this.selectedLogoPath = selectedLogoPath;
        this.SelectedClubData = SelectedClubData;
    }
}


export function setCookie(name, value, days, sameSite = 'Lax', secure = false)
{
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();

    let cookieString = `${name}=${encodeURIComponent(value)}; ${expires}; path=/; SameSite=${sameSite}`;

    if (secure) {
        cookieString += "; Secure"; // Add Secure attribute if needed
    }

    document.cookie = cookieString;

    //document.cookie = `${name}=${value}; ${expires}; path=/`;
}

function getCookie(name) {
    const cookieArray = document.cookie.split(';'); // Split all cookies
    for (let cookie of cookieArray) {
        const [key, value] = cookie.trim().split('='); // Split key and value
        if (key === name) return decodeURIComponent(value); // Return the decoded value
    }
    return null; // Return null if the cookie doesn't exist
}


async function GetDailyLogo() {
    const today = new Date().toISOString().slice(0, 10);
    const storedDate = getCookie("LogoDate");
    const DailyLogo = getCookie("DailyLogoInfo");

    let allData = [];
    let allLogoFiles = await fetchFileList('/csv/Logo/filePaths.json')

    console.log('Files later:',allLogoFiles)

    for(let path in allLogoFiles)
    {
        let newData = loadAndParseCsv(path);

        if (!Array.isArray(newData)) continue;

        allData.concat(loadAndParseCsv(path))
    }

    if (storedDate === today && DailyLogo)
    {
        return DailyLogo;
    }
    else
    {
        const randomIndex = getDailyRandomIndex(allData);
        const SelectedClubData = allData[randomIndex];
        let selectedLogoPath = SelectedClubData.path_to_folder + '/' + SelectedClubData.logo_path;
        let NewDailyLogo = new LogoInfo(selectedLogoPath,SelectedClubData)
        setCookie("LogoDate", today, 1); // Expires in 1 day
        setCookie("DailyLogoInfo", NewDailyLogo, 1);
        return NewDailyLogo;
    }
}

export function SetPlayerData(AmountHearts)
{
    const today = new Date().toISOString().split('T')[0];
    const updatedData =
    {
        date: today,
        hearts: AmountHearts,
    };
    setCookie('playerData', JSON.stringify(updatedData), 1);
}

export function CanPlayToday()
{
    const today = new Date().toISOString().split('T')[0];
    const playerDataCookie = getCookie('playerData');
    const playerData = JSON.parse(playerDataCookie);

    if (playerDataCookie === null || !(playerData.date === today))
    {
        SetPlayerData(maxlives);
        return true;
    }

    if (playerData.date === today && playerData.hearts > 0)
    {
        return true;
    }

    if(playerData.date === today && playerData.hearts <= 0)
    {
        return false;
    }
}
