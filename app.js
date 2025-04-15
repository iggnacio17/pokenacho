const TOTAL_POKEMON = 151;
let captured = JSON.parse(localStorage.getItem("captured")) || [];
let wildId = null;
let successZoneStart = 30;
let successZoneEnd = 70;
let animationId;

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
    img.src = captured.includes(i)
      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i}.png`
      : "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";

    const name = document.createElement("p");
    name.textContent = captured.includes(i) ? `#${i}` : "???";

    card.appendChild(img);
    card.appendChild(name);
    container.appendChild(card);
  }
}

function loadWildPokemon() {
  wildId = Math.floor(Math.random() * TOTAL_POKEMON) + 1;
  document.getElementById("wildImage").src =
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${wildId}.png`;
  document.getElementById("wildName").textContent = "???";
  document.getElementById("captureResult").textContent = "";
  startMinigame();
}

// Mini-juego: barra de precisión
function startMinigame() {
  const canvas = document.createElement("canvas");
  canvas.width = 200;
  canvas.height = 30;
  canvas.id = "captureCanvas";
  document.getElementById("captureResult").innerHTML = "";
  document.getElementById("captureResult").appendChild(canvas);

  const ctx = canvas.getContext("2d");
  let pos = 0;
  let dir = 1;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Zona verde
    ctx.fillStyle = "green";
    ctx.fillRect(successZoneStart, 0, successZoneEnd - successZoneStart, 30);

    // Indicador
    ctx.fillStyle = "red";
    ctx.fillRect(pos, 0, 5, 30);

    if (pos >= 195 || pos <= 0) dir *= -1;
    pos += dir * 2;
    animationId = requestAnimationFrame(draw);
  }

  draw();

  canvas.onclick = () => {
    cancelAnimationFrame(animationId);
    if (pos >= successZoneStart && pos <= successZoneEnd) {
      // Captura exitosa
      if (!captured.includes(wildId)) {
        captured.push(wildId);
        localStorage.setItem("captured", JSON.stringify(captured));
      }
      document.getElementById("wildName").textContent = `¡Capturado! #${wildId}`;
      document.getElementById("captureResult").innerHTML = "<p>¡Éxito! Capturaste al Pokémon 🎉</p>";
    } else {
      document.getElementById("captureResult").innerHTML = "<p>¡Fallaste! El Pokémon escapó 😢</p>";
    }

    // Pasar al siguiente Pokémon después de 1.5 segundos
    setTimeout(loadWildPokemon, 1500);
  };
}
