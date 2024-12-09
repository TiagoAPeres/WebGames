import { SetUpAutoComplete } from '/Utilities/autocomplete.js';

let images = ['/LogoImages/PremierLeague/crystal-palace-2022-logo.png'
    , '/LogoImages/PremierLeague/brentford-fc-2017-logo.png'
    , '/LogoImages/PremierLeague/manchester-city-2016-logo.png'];
let currentIndex = 0;

function changeImage() {
    const img = document.getElementById('logo');
    img.src = images[Math.floor(Math.random() * images.length)];
}

$(document).ready(SetUpAutoComplete(["/csv/PremierLeague_2022_2023_Teams.csv"],"squad","input-box","result-box"));

$(document).ready(changeImage);