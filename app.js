"use strict";

// ===== APP INITIALISERING =====
// Start app når DOM er loaded (hele HTML siden er færdig med at indlæse)
document.addEventListener("DOMContentLoaded", initApp);

// Global variabel til alle spil - tilgængelig for alle funktioner
let allGames = [];

// #1: Initialiser app og tilføj event listeners
function initApp() {
  getGames();

// Åbn og luk booking-dialog
document
  .querySelector("#open-booking")
  .addEventListener("click", openBookingDialog);

document
  .querySelector("#close-booking")
  .addEventListener("click", closeBookingDialog);

    // Åbn booking-dialog fra footeren
  document
    .querySelector("#footer-booking")
    .addEventListener("click", openBookingDialog);
    
  // Søg efter spil mens brugeren skriver
  document
    .querySelector("#search-input")
    .addEventListener("input", filterGames);

  // Filtrer når brugeren vælger en genre
  document
    .querySelector("#genre-select")
    .addEventListener("change", filterGames);

  // Sorter når brugeren vælger sortering
  document
    .querySelector("#sort-select")
    .addEventListener("change", filterGames);
}

// #2: Hent spil fra JSON-fil
async function getGames() {
  // Hent data fra URL - await venter på svar før vi går videre
  const response = await fetch(
    "https://raw.githubusercontent.com/cederdorff/race/refs/heads/master/data/games.json"
  );

  // Pars JSON til JS array og gem i global variabel, der er tilgængelig for alle funktioner
  allGames = await response.json();

  populateGenreDropdown(); // Udfyld dropdown med genrer
  displayGames(allGames); // Vis alle games ved start
}

// ===== VISNING AF SPIL =====
// #3: Vis alle spil på siden
function displayGames(games) {
  const gameList = document.querySelector("#game-list"); // Find container til spil
  gameList.innerHTML = ""; // Ryd gammel liste (fjern alt HTML indhold)

  // Hvis ingen spil matcher filtrene, vis en besked til brugeren
  if (games.length === 0) {
    gameList.innerHTML =
      '<p class="no-results">Ingen spil matchede dine filtre</p>';
    return; // Stop funktionen her - return betyder "stop her og gå ikke videre"
  }

  // Loop gennem alle spil og vis hver enkelt
  for (const game of games) {
    displayGame(game); // Kald displayGame for hvert spil
  }
}

// #4: Opret et spilkort og tilføj event listener
function displayGame(game) {
  const gameList = document.querySelector("#game-list");

  const gameHTML = /*html*/ `
    <article class="game-card">
      <img
        src="${game.image}"
        alt="Spilæske til ${game.title}"
        class="game-poster"
        loading="lazy"
      />

      <div class="game-info">
        <h3>${game.title}</h3>
        <p class="game-genre">${game.genre}</p>

        <button
          class="game-button"
          type="button"
          aria-label="Se ${game.title}"
        >
          Se spil
        </button>
      </div>
    </article>
  `;

  gameList.insertAdjacentHTML("beforeend", gameHTML);

  const newCard = gameList.lastElementChild;
  const gameButton = newCard.querySelector(".game-button");

  // Hele kortet kan klikkes
  newCard.addEventListener("click", function () {
    showGameModal(game);
  });

  // CTA-knappen kan også klikkes
  gameButton.addEventListener("click", function (event) {
    event.stopPropagation();
    showGameModal(game);
  });
}

// ===== DROPDOWN OG MODAL FUNKTIONER =====

// #5: Udfyld genre-dropdown med relevante genrer
function populateGenreDropdown() {
  const genreSelect = document.querySelector("#genre-select");

  const genres = [
    "Familie",
    "Strategi",
    "Party",
    "Kortspil",
    "Ordspil",
    "Mysterie",
    "Kooperativt",
    "Fliselægning",
    "Terning",
    "Brætspil",
    "Abstract"
  ];

  genreSelect.innerHTML = `<option value="all">Alle genrer</option>`;

  // Tilføj hver genre til dropdown-menuen
  for (const genre of genres) {
    genreSelect.insertAdjacentHTML(
      "beforeend",
      `<option value="${genre}">${genre}</option>`
    );
  }
}

// #6: Vis spil i modal dialog - popup vindue med spildetaljer
function showGameModal(game) {
  // Find modal indhold container og byg HTML struktur dynamisk
  // Tilføj indhold fra JSON
  document.querySelector("#dialog-content").innerHTML = /*html*/ `
    <img
      src="${game.image}"
      alt="Spilæske til ${game.title}"
      class="game-poster"
    />

    <div class="dialog-details">
      <h2>${game.title}</h2>

      <p><strong>Kategori:</strong> ${game.genre}</p>

      <p><strong>Spilletid:</strong> ${game.playtime} min.</p>

      <p>
        <strong>Antal spillere:</strong>
        ${game.players.min}-${game.players.max}
      </p>

      <p><strong>Alder:</strong> Fra ${game.age} år</p>

      <p><strong>Sværhedsgrad:</strong> ${game.difficulty}</p>

      <p><strong>Lokation:</strong> ${game.location}</p>

      <p><strong>Reol:</strong> ${game.shelf}</p>

      <div class="game-description">
        <strong>Om spillet</strong>
        <p>${game.description}</p>
      </div>

      <div class="game-rules">
        <strong>Spilleregler</strong>
        <p>${game.rules}</p>
      </div>
    </div>
  `;

  // Åbn modalen - showModal() er en built-in browser funktion
  document.querySelector("#game-dialog").showModal();
}
// ===== BOOKING =====

// Åbn booking-dialog
function openBookingDialog() {
  document.querySelector("#booking-dialog").showModal();
}

// Luk booking-dialog
function closeBookingDialog() {
  document.querySelector("#booking-dialog").close();
}

// ===== FILTER FUNKTIONER =====

// #7: Komplet filtrering med søgning, genre og sortering
function filterGames() {
  // Hent alle filter værdier fra input felterne
  const searchValue = document
    .querySelector("#search-input")
    .value.toLowerCase();

  const genreValue = document.querySelector("#genre-select").value;
  const sortValue = document.querySelector("#sort-select").value;

  // Start med en kopi af alle spil så original rækkefølge ikke ændres
  let filteredGames = [...allGames];

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

  // SORTERING: Titel fra A-Å
  if (sortValue === "title-asc") {
    filteredGames.sort((a, b) =>
      a.title.localeCompare(b.title, "da", { sensitivity: "base" })
    );
  }

  // SORTERING: Titel fra Å-A
  if (sortValue === "title-desc") {
    filteredGames.sort((a, b) =>
      b.title.localeCompare(a.title, "da", { sensitivity: "base" })
    );
  }

  // Vis de filtrerede spil på siden
  displayGames(filteredGames);
}