const pokemonList = document.getElementById("pokemonList");
const search = document.getElementById("search");
const typeFilter = document.getElementById("typeFilter");
const modal = document.getElementById("pokemonModal");
const modalContent = document.getElementById("modalContent");
const toggleDark = document.getElementById("toggleDark");

let allPokemon = [];
let types = new Set();
let offset = 0;
const limit = 20;

async function fetchPokemon(offset = 0, limit = 20) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
  const data = await res.json();
  const promises = data.results.map(p => fetch(p.url).then(res => res.json()));
  const detailed = await Promise.all(promises);
  detailed.forEach(p => types.add(...p.types.map(t => t.type.name)));
  allPokemon.push(...detailed);
  renderPokemon(detailed);
  renderTypeFilter();
}

function renderPokemon(list) {
  list.forEach(p => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <img src="${p.sprites.front_default}" alt="${p.name}" />
      <h3>${p.name}</h3>
      <p>#${p.id}</p>
    `;
    div.addEventListener("click", () => openModal(p));
    pokemonList.appendChild(div);
  });
}

function renderTypeFilter() {
  typeFilter.innerHTML = '<option value="">Todos los tipos</option>';
  Array.from(types).sort().forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t.charAt(0).toUpperCase() + t.slice(1);
    typeFilter.appendChild(opt);
  });
}

function openModal(pokemon) {
  modal.classList.remove("hidden");
  modalContent.innerHTML = `
    <h2>${pokemon.name} (#${pokemon.id})</h2>
    <img src="${pokemon.sprites.front_default}" />
    <p>Altura: ${pokemon.height / 10} m</p>
    <p>Peso: ${pokemon.weight / 10} kg</p>
    <p>Tipos: ${pokemon.types.map(t => t.type.name).join(", ")}</p>
    <p>Stats:</p>
    <ul>${pokemon.stats.map(s => `<li>${s.stat.name}: ${s.base_stat}</li>`).join("")}</ul>
    <button onclick="modal.classList.add('hidden')">Cerrar</button>
  `;
}

search.addEventListener("input", () => {
  const term = search.value.toLowerCase();
  pokemonList.innerHTML = "";
  renderPokemon(allPokemon.filter(p => p.name.includes(term) || p.id == term));
});

typeFilter.addEventListener("change", () => {
  const type = typeFilter.value;
  pokemonList.innerHTML = "";
  if (!type) {
    renderPokemon(allPokemon);
  } else {
    renderPokemon(allPokemon.filter(p => p.types.some(t => t.type.name === type)));
  }
});

toggleDark.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    offset += limit;
    fetchPokemon(offset, limit);
  }
});

fetchPokemon();
