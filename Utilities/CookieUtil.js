export function setGameCookie(game, name, value) {
    const date = new Date();
    date.setHours(23, 59, 59, 999); // Set expiration to the end of the day
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${game}_${name}=${value};${expires};path=/`;
}

export function getGameCookie(game, name) {
    const nameEQ = `${game}_${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

export function deleteGameCookie(game, name) {
    document.cookie = `${game}_${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    console.log(`Deleted cookie ${game}_${name}`);
}

export function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

export function deleteCookie(name) {
    document.cookie = name + "=; Max-Age=-99999999;";
}