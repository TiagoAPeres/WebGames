export function GetRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

export function timeUntilNextDay() {
    let now = new Date(); // Get the current date and time
    let nextDay = new Date(now);
    nextDay.setHours(24, 0, 0, 0); // Set the next day to midnight (00:00)

    let timeDifference = nextDay - now; // Difference in milliseconds

    // Calculate hours and minutes
    let hours = Math.floor(timeDifference / (1000 * 60 * 60));
    let minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes };
}