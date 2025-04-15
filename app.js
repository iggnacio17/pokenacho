const TOTAL_POKEMON = 151; // puedes cambiar a 1025 para todas las generaciones
let captured = JSON.parse(localStorage.getItem("captured")) || [];

function showPokedex() {
  document.getElementById("pokedexView").classList.add("active");
  document.getElementById("exploreView").classList.remove("active");
  renderPokedex();
}

function showExplore() {
  document.getElementById("exploreView").classList.add("active");
  document.getElementById("pokedexView").classList.remove("active");
  loadWildPokemon();
}

function renderPokedex() {
  const container = document.getElementById("pokedex");
  container.innerHTML = "";

  for (let i = 1; i <= TOTAL_POKEMON; i++) {
    const card = document.createElement("div");
    card.className = "pokemon-card";

    const img = document.createElement("img");

    if (captured.includes(i)) {
      img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i}.png`;
    } else {
      img.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png"; // silueta negra
    }

    const name = document.createElement("p");
    name.textContent = captured.includes(i) ? `#${i}` : "???";

    card.appendChild(img);
    card.appendChild(name);
    container.appendChild(card);
  }
}

let wildId = null;

function loadWildPokemon() {
  wildId = Math.floor(Math.random() * TOTAL_POKEMON) + 1;
  const img = document.getElementById("wildImage");
  const name = document.getElementById("wildName");
  img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${wildId}.png`;
  name.textContent = "???";
  document.getElementById("captureResult").textContent = "";
}

function throwPokeball() {
  const chance = Math.random();
  if (chance <= 0.5) {
    if (!captured.includes(wildId)) {
      captured.push(wildId);
      localStorage.setItem("captured", JSON.stringify(captured));
    }
    document.getElementById("wildName").textContent = `¡Capturado! #${wildId}`;
    document.getElementById("captureResult").textContent = "¡Pokémon atrapado!";
  } else {
    document.getElementById("captureResult").textContent = "¡El Pokémon escapó!";
  }
}
