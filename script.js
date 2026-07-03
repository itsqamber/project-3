const header = document.querySelector(".site-header");
const menuBtn = document.querySelector("#menuBtn");
const navLinks = document.querySelector("#navLinks");
const revealItems = document.querySelectorAll(".reveal");
const gamesGrid = document.querySelector("#gamesGrid");
const gameSearch = document.querySelector("#gameSearch");
const genreFilter = document.querySelector("#genreFilter");
const sortGames = document.querySelector("#sortGames");
const catalogCount = document.querySelector("#catalogCount");
const catalogHint = document.querySelector("#catalogHint");
const loadMoreGames = document.querySelector("#loadMoreGames");

const genres = ["All", "FPS", "RPG", "Racing", "Strategy", "Arcade", "Sports", "Battle Royale", "Puzzle", "Adventure", "Simulation"];
const wordsA = ["Neon", "Shadow", "Cyber", "Iron", "Nova", "Rift", "Storm", "Pixel", "Turbo", "Phantom", "Quantum", "Solar", "Apex", "Void", "Hyper", "Omega", "Crystal", "Rocket", "Vortex", "Titan"];
const wordsB = ["Arena", "Quest", "Circuit", "Legends", "Strike", "Odyssey", "Rush", "Tactics", "Clash", "Drift", "Realms", "Protocol", "Skies", "Forge", "Frontier", "Rivals", "Siege", "Runner", "Galaxy", "Drop"];
const icons = ["NX", "XP", "VR", "GG", "OP", "LV", "QZ", "RX", "KO", "AI"];
const palettes = [
  ["rgba(48,231,255,.34)", "rgba(255,95,127,.28)"],
  ["rgba(182,255,82,.28)", "rgba(48,231,255,.24)"],
  ["rgba(255,209,102,.30)", "rgba(255,95,127,.24)"],
  ["rgba(138,116,255,.26)", "rgba(48,231,255,.24)"],
  ["rgba(255,95,127,.28)", "rgba(182,255,82,.18)"]
];

const state = {
  query: "",
  genre: "All",
  sort: "featured",
  visible: 24
};

const games = Array.from({ length: 1000 }, (_, index) => {
  const number = index + 1;
  const genre = genres[(index % (genres.length - 1)) + 1];
  const name = `${wordsA[index % wordsA.length]} ${wordsB[Math.floor(index / wordsA.length) % wordsB.length]} ${String(number).padStart(3, "0")}`;
  const rating = (4 + ((index * 37) % 10) / 10).toFixed(1);
  const players = 1200 + ((index * 7919) % 980000);
  const year = 2020 + (index % 7);
  const palette = palettes[index % palettes.length];

  return {
    id: number,
    name,
    genre,
    rating: Number(rating),
    players,
    year,
    icon: icons[index % icons.length],
    colors: palette,
    description: `${genre} action with ranked matchmaking, smooth controls, and quick-play sessions for squads or solo players.`
  };
});

function formatPlayers(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return String(value);
}

function setHeader() {
  header.classList.toggle("scrolled", window.scrollY > 24);
}

function setupReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  revealItems.forEach((item) => observer.observe(item));
}

function populateGenres() {
  genreFilter.innerHTML = genres.map((genre) => `<option value="${genre}">${genre}</option>`).join("");
}

function getFilteredGames() {
  const query = state.query.trim().toLowerCase();
  let results = games.filter((game) => {
    const matchesQuery = !query || game.name.toLowerCase().includes(query) || game.genre.toLowerCase().includes(query);
    const matchesGenre = state.genre === "All" || game.genre === state.genre;
    return matchesQuery && matchesGenre;
  });

  results = [...results].sort((a, b) => {
    if (state.sort === "rating") return b.rating - a.rating || a.name.localeCompare(b.name);
    if (state.sort === "players") return b.players - a.players;
    if (state.sort === "newest") return b.year - a.year || b.id - a.id;
    if (state.sort === "name") return a.name.localeCompare(b.name);
    return a.id - b.id;
  });

  return results;
}

function renderGames() {
  const results = getFilteredGames();
  const visibleGames = results.slice(0, state.visible);

  gamesGrid.innerHTML = visibleGames.map((game) => `
    <article class="game-card" style="--card-a:${game.colors[0]};--card-b:${game.colors[1]}">
      <div class="game-top">
        <div class="game-icon">${game.icon}</div>
        <div class="rating">★ ${game.rating}</div>
      </div>
      <span class="game-genre">${game.genre}</span>
      <h3>${game.name}</h3>
      <p>${game.description}</p>
      <div class="game-meta">
        <span>${formatPlayers(game.players)} players</span>
        <span>${game.year}</span>
      </div>
    </article>
  `).join("");

  catalogCount.textContent = `${results.length.toLocaleString()} games found`;
  catalogHint.textContent = `Showing ${visibleGames.length.toLocaleString()} of ${results.length.toLocaleString()}`;
  loadMoreGames.hidden = visibleGames.length >= results.length;
}

function updateAndRender() {
  state.visible = 24;
  renderGames();
}

function bindEvents() {
  window.addEventListener("scroll", setHeader, { passive: true });

  menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    menuBtn.setAttribute("aria-label", navLinks.classList.contains("open") ? "Close menu" : "Open menu");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => navLinks.classList.remove("open"));
  });

  document.querySelectorAll("[data-focus-search]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector("#games").scrollIntoView({ behavior: "smooth" });
      setTimeout(() => gameSearch.focus(), 450);
    });
  });

  gameSearch.addEventListener("input", (event) => {
    state.query = event.target.value;
    updateAndRender();
  });

  genreFilter.addEventListener("change", (event) => {
    state.genre = event.target.value;
    updateAndRender();
  });

  sortGames.addEventListener("change", (event) => {
    state.sort = event.target.value;
    updateAndRender();
  });

  loadMoreGames.addEventListener("click", () => {
    state.visible += 24;
    renderGames();
  });
}

populateGenres();
setupReveal();
bindEvents();
setHeader();
renderGames();
