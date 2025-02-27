export function setCookie(name, value, sameSite = 'Lax', secure = false) {
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    const expires = "expires=" + endOfDay.toUTCString();

    let cookieString = `${name}=${encodeURIComponent(value)}; ${expires}; path=/; SameSite=${sameSite}`;

    if (secure) {
        cookieString += "; Secure"; // Add Secure attribute if needed
    }

    document.cookie = cookieString;
}

export function getCookie(name) {
    const cookieArray = document.cookie.split(';'); // Split all cookies
    for (let cookie of cookieArray) {
        const [key, value] = cookie.trim().split('='); // Split key and value
        if (key === name) return decodeURIComponent(value); // Return the decoded value
    }
    return null; // Return null if the cookie doesn't exist
}