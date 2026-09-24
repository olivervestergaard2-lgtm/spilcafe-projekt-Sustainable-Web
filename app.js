"use strict";

// ===== APP INITIALISERING =====
// Start app når DOM er loaded (hele HTML siden er færdig med at indlæse)
document.addEventListener("DOMContentLoaded", initApp);

// Global variabel til alle film - tilgængelig for alle funktioner
let allGames = [];

// #1: Initialize the app - sæt event listeners og hent data
function initApp() {
  getGames(); // Hent film data fra JSON fil

  // Event listeners for alle filtre - kører filterMovies når brugeren ændrer noget
  document.querySelector("#search-input").addEventListener("input", filterGames);
  document.querySelector("#genre-select").addEventListener("change", filterGames);
  document.querySelector("#sort-select").addEventListener("change", filterGames);

  // Event listener for clear-knappen - rydder alle filtre
  document.querySelector("#clear-filters").addEventListener("click", clearAllFilters);
}

// #2: Fetch games from JSON file - asynkron funktion der henter data
async function getGames() {
  // Hent data fra URL - await venter på svar før vi går videre
  const response = await fetch("https://raw.githubusercontent.com/cederdorff/race/refs/heads/master/data/games.json");

  // Pars JSON til JS array og gem i global variabel, der er tilgængelig for alle funktioner
  allGames = await response.json();

  populateGenreDropdown(); // Udfyld dropdown med genrer fra data
  displayGames(allGames); // Vis alle games ved start
}

// ===== VISNING AF SPIL =====
// #3: Display all games - vis en liste af spil på siden
function displayGames(games) {
  const gameList = document.querySelector("#game-list"); // Find container til spil
  gameList.innerHTML = ""; // Ryd gammel liste (fjern alt HTML indhold)

  // Hvis ingen spil matcher filtrene, vis en besked til brugeren
  if (games.length === 0) {
    gameList.innerHTML = '<p class="no-results">Ingen spil matchede dine filtre 😢</p>';
    return; // Stop funktionen her - return betyder "stop her og gå ikke videre"
  }

  // Loop gennem alle spil og vis hver enkelt
  for (const game of games) {
    displayGame(game); // Kald displayGame for hvert spil
  }
}

// #4: Render a single game card and add event listeners - lav et spil kort
function displayGame(game) {
  const gameList = document.querySelector("#game-list"); // Find container til spil

  // Byg HTML struktur dynamisk - template literal med ${} til at indsætte data
  const gameHTML = /*html*/ `
    <article class="game-card" tabindex="0">
      <img src="${game.image}" 
           alt="Poster of ${game.title}" 
           class="game-poster" />
      <div class="game-info">
        <h3>${game.title} <span class="game-year">(${game.year})</span></h3>
        <p class="game-genre">${game.genre}</p>
      </div>
    </article>
  `;

  // Tilføj game card til DOM (HTML) - insertAdjacentHTML sætter HTML ind uden at overskrive
  gameList.insertAdjacentHTML("beforeend", gameHTML);

  // Find det kort vi lige har tilføjet (det sidste element)
  const newCard = gameList.lastElementChild;

  // Tilføj click event til kortet - når brugeren klikker på kortet
  newCard.addEventListener("click", function () {
    showGameModal(game); // Vis modal med spil detaljer
  });

  // Tilføj keyboard support (Enter og mellemrum) for tilgængelighed
  newCard.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault(); // Forhindre scroll ved mellemrum
      showgameModal(Game); // Vis modal med spil detaljer
    }
  });
}

// ===== DROPDOWN OG MODAL FUNKTIONER =====
// #5: Udfyld genre-dropdown med alle unikke genrer fra data
function populateGenreDropdown() {
  const genreSelect = document.querySelector("#genre-select"); // Find genre dropdown
  const genres = new Set(); // Set fjerner automatisk dubletter

  // Samle alle unikke genrer fra alle spil
  // Hvert spil kan have flere genrer (array), så vi løber gennem dem alle
  for (const game of allGames) {
    for (const genre of game.genre) {
      genres.add(genre); // Set sikrer kun unikke værdier
    }
  }

  // Fjern gamle options undtagen 'Alle genrer' (reset dropdown)
  genreSelect.innerHTML = /*html*/ `<option value="all">Alle genrer</option>`;

  // Sortér genres alfabetisk og tilføj dem som options
  const sortedGenres = [...genres].sort(); // Konvertér Set til Array og sortér genrer
  for (const genre of sortedGenres) {
    genreSelect.insertAdjacentHTML("beforeend", /*html*/ `<option value="${genre}">${genre}</option>`);
  }
}

// #6: Vis spil i modal dialog - popup vindue med spil detaljer
function showGameModal(game) {
  // Find modal indhold container og byg HTML struktur dynamisk
  //tilføj indhold fra JSON 
  document.querySelector("#dialog-content").innerHTML = /*html*/ `
    <img src="${game.image}" alt="Poster af ${game.title}" class="game-poster">
    <div class="dialog-details">
      <p class="game-genre">${game.genre}</p>
      <p class="game-description">${game.description}</p>
      <p class="game-playtime">${game.playtime}</p>
      <p class="game-players">${game.players}</p>
      <p class="game-language">${game.language}</p>
      <p class="game-age">${game.age}</p>
      <p class="game-difficulty">${game.difficulty}</p>
      <p class="game-location">${game.location}</p>
      <p class="game-shelf">${game.shelf}</p>
      <p class="game-available">${game.available}</p>
      <p class="rules">${game.rules}</p>
    </div>
  `;

  // Åbn modalen - showModal() er en built-in browser funktion
  document.querySelector("#game-dialog").showModal();
}

// ===== FILTER FUNKTIONER =====
// #7: Ryd alle filtre - reset alle filter felter til tomme værdier
function clearAllFilters() {
  // Ryd alle input felter - sæt value til tom string eller standard værdi
  document.querySelector("#search-input").value = "";
  document.querySelector("#genre-select").value = "all";
  document.querySelector("#sort-select").value = "none";

  // Kør filtrering igen (vil vise alle film da alle filtre er ryddet)
  filterGames();
}

// #8: Komplet filtrering med alle funktioner - den vigtigste funktion!
function filterGames() {
  // Hent alle filter værdier fra input felterne
  const searchValue = document.querySelector("#search-input").value.toLowerCase(); // Konvertér til lowercase for case-insensitive søgning
  const genreValue = document.querySelector("#genre-select").value;
  const sortValue = document.querySelector("#sort-select").value;

  // Start med alle spil - kopiér til ny variabel så vi ikke ændrer originalen
  let filteredGames = allGames;

  // FILTER 1: Søgetekst - filtrer på spil titel
  if (searchValue) {
    // Kun filtrer hvis der er indtastet noget
    filteredGames = filteredGames.filter(game => {
      // includes() checker om søgeteksten findes i titlen
      return game.title.toLowerCase().includes(searchValue);
    });
  }

  // FILTER 2: Genre - filtrer på valgt genre
  if (genreValue !== "all") {
    // Kun filtrer hvis ikke "all" er valgt
    filteredGames = filteredGames.filter(game => {
      // includes() checker om genren findes i spillets genre array
      return game.genre.includes(genreValue);
    });
  }

  // SORTERING (altid til sidst efter alle filtre er anvendt)
  if (sortValue === "title") {
    // Alfabetisk sortering - localeCompare() håndterer danske bogstaver korrekt
    filteredGames.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortValue === "year") {
    // Sortér på år (nyeste først) - b - a giver descending order
    filteredGames.sort((a, b) => b.year - a.year);
  }
  
  // Vis de filtrerede spil på siden
  displayGames(filteredGames);
}
