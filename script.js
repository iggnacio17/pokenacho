const collectionKey = "pokemonCollection";
const teamsKey = "pokemonTeams";
let currentPokemon = null;

// 🌙 Theme
function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
}

document.addEventListener("DOMContentLoaded", () => {
  // Aplica tema guardado
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }

  // Actualiza coleccion si estamos en esa página
  if (location.pathname.includes("collection")) {
    updateCollectionView();
  }
  // Actualiza equipos si estamos en esa página
  if (location.pathname.includes("teams")) {
    updateTeamsView();
  }
});

// 📦 Storage
function loadCollection() {
  const saved = localStorage.getItem(collectionKey);
  return saved ? JSON.parse(saved) : [];
}

function saveCollection(collection) {
  localStorage.setItem(collectionKey, JSON.stringify(collection));
}

function loadTeams() {
  const saved = localStorage.getItem(teamsKey);
  return saved ? JSON.parse(saved) : [];
}

function saveTeams(teams) {
  localStorage.setItem(teamsKey, JSON.stringify(teams));
}

function saveToCollection(pokemon) {
  const collection = loadCollection();
  const exists = collection.some(p => p.id === pokemon.id);
  if (!exists) {
    collection.push({
      id: pokemon.id,
      name: pokemon.name,
      image: pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default,
      types: pokemon.types.map(t => t.type.name),
      stats: pokemon.stats.map(s => ({ name: s.stat.name, base_stat: s.base_stat })),
      favorite: false,
    });
    saveCollection(collection);
  }
}

// 🎴 Pokémon aleatorio sin repetir
async function getRandomPokemon() {
  const collection = loadCollection();
  const seenIds = collection.map(p => p.id);
  const maxPokemon = 1010; // Ajusta si hay más
  let tries = 0;

  while (tries < 50) {
    const randomId = Math.floor(Math.random() * maxPokemon) + 1;
    if (seenIds.includes(randomId)) {
      tries++;
      continue;
    }

    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
      if (!res.ok) throw new Error("No encontrado");
      const pokemon = await res.json();

      currentPokemon = pokemon;

      // Muestra en pantalla
      document.getElementById("pokemon-image").src = pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default;
      document.getElementById("pokemon-name").textContent = capitalize(pokemon.name);
      renderTypes(pokemon.types);
      renderStats(pokemon.stats);

      updateFavoriteButton();

      saveToCollection(pokemon);

      // Habilitar boton añadir a equipo
      const addBtn = document.getElementById("add-team-btn");
      if (addBtn) addBtn.disabled = false;

      return;

    } catch (e) {
      tries++;
    }
  }

  alert("No se pudo encontrar un Pokémon nuevo. Intenta de nuevo.");
}

function renderTypes(types) {
  const container = document.getElementById("pokemon-types");
  container.innerHTML = "";
  types.forEach(t => {
    const span = document.createElement("span");
    span.textContent = capitalize(t.type.name);
    span.className = `type type-${t.type.name}`;
    container.appendChild(span);
  });
}

function renderStats(stats) {
  const container = document.getElementById("pokemon-stats");
  container.innerHTML = "";
  stats.forEach(s => {
    const statName = statDisplayName(s.stat.name);
    const statDiv = document.createElement("div");
    statDiv.className = "stat";
    statDiv.textContent = `${statName}: ${s.base_stat}`;
    container.appendChild(statDiv);
  });
}

function statDisplayName(name) {
  switch(name) {
    case 'hp': return 'HP';
    case 'attack': return 'Ataque';
    case 'defense': return 'Defensa';
    case 'special-attack': return 'At. Esp.';
    case 'special-defense': return 'Def. Esp.';
    case 'speed': return 'Velocidad';
    default: return name;
  }
}

// 💖 Favoritos
function updateFavoriteButton() {
  const collection = loadCollection();
  const found = collection.find(p => p.id === currentPokemon.id);
  const btn = document.getElementById("favorite-btn");
  btn.textContent = found?.favorite ? "💖 Quitar de Favoritos" : "🤍 Marcar como Favorito";
}

function toggleFavorite() {
  const collection = loadCollection();
  const index = collection.findIndex(p => p.id === currentPokemon.id);
  if (index !== -1) {
    collection[index].favorite = !collection[index].favorite;
    saveCollection(collection);
    updateFavoriteButton();
  }
}

// 📚 Colección (igual que antes)
function updateCollectionView() {
  const grid = document.getElementById("collection-grid");
  if (!grid) return;
  grid.innerHTML = "";
  const collection = loadCollection();

  collection.forEach(pokemon => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${pokemon.image}" alt="${pokemon.name}">
      <div class="card-name">${capitalize(pokemon.name)}</div>
      <div class="card-types">${pokemon.types.map(t => `<span class="type type-${t}">${capitalize(t)}</span>`).join('')}</div>
      <button class="favorite-btn" onclick="toggleFavoriteInCollection(${pokemon.id})">
        ${pokemon.favorite ? "💖" : "🤍"}
      </button>
    `;
    grid.appendChild(card);
  });
}

function toggleFavoriteInCollection(id) {
  const collection = loadCollection();
  const index = collection.findIndex(p => p.id === id);
  if (index !== -1) {
    collection[index].favorite = !collection[index].favorite;
    saveCollection(collection);
    updateCollectionView();
  }
}

function clearCollection() {
  if (confirm("¿Borrar toda tu colección?")) {
    localStorage.removeItem(collectionKey);
    updateCollectionView();
  }
}

// 🛡️ Equipos Pokémon

function loadTeams() {
  const saved = localStorage.getItem(teamsKey);
  return saved ? JSON.parse(saved) : [];
}

function saveTeams(teams) {
  localStorage.setItem(teamsKey, JSON.stringify(teams));
}

function createTeam() {
  const input = document.getElementById("team-name-input");
  if (!input) return;
  const name = input.value.trim();
  if (!name) {
    alert("Escribe un nombre para el equipo.");
    return;
  }
  let teams = loadTeams();

  // No permitir nombres repetidos
  if (teams.some(t => t.name.toLowerCase() === name.toLowerCase())) {
    alert("Ya tienes un equipo con ese nombre.");
    return;
  }

  const newTeam = { id: Date.now(), name, pokemons: [] };
  teams.push(newTeam);
  saveTeams(teams);
  input.value = "";
  updateTeamsView();
}

function updateTeamsView() {
  const container = document.getElementById("teams-list");
  if (!container) return;
  container.innerHTML = "";
  const teams = loadTeams();

  if (teams.length === 0) {
    container.innerHTML = "<p>No tienes equipos creados.</p>";
    return;
  }

  teams.forEach(team => {
    const teamDiv = document.createElement("div");
    teamDiv.className = "team-container";

    teamDiv.innerHTML = `
      <div class="team-header">
        <div class="team-name">${capitalize(team.name)}</div>
        <button onclick="deleteTeam(${team.id})" class="danger">🗑️</button>
      </div>
      <div class="team-pokemons"></div>
      <button onclick="removeLastFromTeam(${team.id})">Eliminar último Pokémon</button>
    `;

    const pokemonsDiv = teamDiv.querySelector(".team-pokemons");
    team.pokemons.forEach(p => {
      const pokeCard = document.createElement("div");
      pokeCard.className = "team-pokemon-card";
      pokeCard.innerHTML = `
        <img src="${p.image}" alt="${p.name}" title="${capitalize(p.name)}" />
      `;
      pokemonsDiv.appendChild(pokeCard);
    });

    container.appendChild(teamDiv);
  });
}

function deleteTeam(id) {
  if (!confirm("¿Seguro quieres eliminar este equipo?")) return;
  let teams = loadTeams();
  teams = teams.filter(t => t.id !== id);
  saveTeams(teams);
  updateTeamsView();
}

function addToTeam() {
  if (!currentPokemon) {
    alert("Primero obtén un Pokémon.");
    return;
  }
  let teams = loadTeams();
  if (teams.length === 0) {
    alert("Crea un equipo primero en la página Equipos.");
    return;
  }
  // Para simplificar, añadimos al primer equipo disponible
  let team = teams[0];

  if (team.pokemons.length >= 6) {
    alert("El equipo ya tiene 6 Pokémon.");
    return;
  }

  // Verificar si ya está en el equipo
  if (team.pokemons.some(p => p.id === currentPokemon.id)) {
    alert("Este Pokémon ya está en el equipo.");
    return;
  }

  const pokeToAdd = {
    id: currentPokemon.id,
    name: currentPokemon.name,
    image: currentPokemon.sprites.other["official-artwork"].front_default || currentPokemon.sprites.front_default,
  };

  team.pokemons.push(pokeToAdd);
  saveTeams(teams);
  alert(`Pokémon agregado al equipo "${team.name}"!`);
}

// Utilidad para capitalizar
function capitalize(str) {
  if (!str) return "";
  return str[0].toUpperCase() + str.slice(1);
}
