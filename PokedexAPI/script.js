const pokemonContainer = document.getElementById("pokemonContainer");
const searchBar = document.getElementById("searchBar");
const loading = document.getElementById("loading");
const pagination = document.getElementById("pagination");

let allPokemon = []; // Todos os Pokémon
let currentPage = 1; // Página atual
const pokemonPerPage = 12; // Pokémon por página

// Função para buscar os Pokémon
async function fetchPokemon() {
  for (let i = 1; i <= 151; i++) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
    const data = await response.json();

    allPokemon.push({
      id: data.id,
      name: data.name,
      image: data.sprites.other['official-artwork'].front_default,
      types: data.types.map((type) => type.type.name),
    });
  }
  displayPokemon();
  createPagination();
  loading.style.display = "none"; // Esconde o spinner após o carregamento
}

// Exibir Pokémon da página atual
function displayPokemon() {
  const startIndex = (currentPage - 1) * pokemonPerPage;
  const endIndex = startIndex + pokemonPerPage;

  const pokemonToDisplay = allPokemon.slice(startIndex, endIndex);

  pokemonContainer.innerHTML = pokemonToDisplay
    .map(
      (pokemon) => `
      <div class="pokemon-card">
        <div class="pokemon-number">Nº ${String(pokemon.id).padStart(3, '0')}</div>
        <img src="${pokemon.image}" alt="${pokemon.name}" />
        <h3>${pokemon.name}</h3>
        <div class="pokemon-types">
          ${pokemon.types
            .map((type) => `<span class="pokemon-type type-${type}">${type}</span>`)
            .join("")}
        </div>
      </div>
    `
    )
    .join("");
}

// Criar botões de paginação
function createPagination() {
  const totalPages = Math.ceil(allPokemon.length / pokemonPerPage);

  pagination.innerHTML = `
    <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? "class='disabled'" : ""}>Anterior</button>
    <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? "class='disabled'" : ""}>Próximo</button>
  `;
}

// Alterar página
function changePage(newPage) {
  const totalPages = Math.ceil(allPokemon.length / pokemonPerPage);

  if (newPage < 1 || newPage > totalPages) return;

  currentPage = newPage;
  displayPokemon();
  createPagination();
}

// Filtrar Pokémon pela barra de pesquisa
searchBar.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const filteredPokemon = allPokemon.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(searchTerm)
  );

  if (searchTerm) {
    pokemonContainer.innerHTML = filteredPokemon
      .map(
        (pokemon) => `
        <div class="pokemon-card">
          <div class="pokemon-number">Nº ${String(pokemon.id).padStart(3, '0')}</div>
          <img src="${pokemon.image}" alt="${pokemon.name}" />
          <h3>${pokemon.name}</h3>
          <div class="pokemon-types">
            ${pokemon.types
              .map((type) => `<span class="pokemon-type type-${type}">${type}</span>`)
              .join("")}
          </div>
        </div>
      `
      )
      .join("");
  } else {
    displayPokemon();
  }
});

// Iniciar busca
fetchPokemon();
