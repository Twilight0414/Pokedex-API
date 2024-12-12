const pokemonContainer = document.getElementById("pokemonContainer");
const searchBar = document.getElementById("searchBar");
const loading = document.getElementById("loading");
const pagination = document.getElementById("pagination");
const paginationBottom = document.getElementById("paginationBottom");
const scrollTopButton = document.getElementById("scrollTop");

let allPokemon = []; // Todos os Pokémon
let currentPage = 1; // Página atual
const pokemonPerPage = 12; // Pokémon por página
let filteredPokemon = []; // Array para Pokémon filtrados

// Função para buscar os Pokémon
async function fetchPokemon() {
  try {
    // Iniciar o timer do loading
    const loadingStartTime = Date.now();
    const minLoadingTime = 2000; // 2 segundos de loading mínimo

    // Verificar se há dados em cache
    const cachedData = localStorage.getItem('pokemonData');
    if (cachedData) {
      allPokemon = JSON.parse(cachedData);
      
      // Calcular tempo restante para completar o tempo mínimo de loading
      const elapsedTime = Date.now() - loadingStartTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      // Aguardar o tempo mínimo antes de esconder o loading
      await new Promise(resolve => setTimeout(resolve, remainingTime));
      
      displayPokemon();
      createPagination();
      loading.style.display = "none";
      return;
    }

    // Buscar dados em lotes de 20 Pokémon
    const batchSize = 20;
    const totalPokemon = 400;
    const batches = Math.ceil(totalPokemon / batchSize);
    
    for (let batch = 0; batch < batches; batch++) {
      const start = batch * batchSize + 1;
      const end = Math.min(start + batchSize - 1, totalPokemon);
      
      const promises = [];
      for (let i = start; i <= end; i++) {
        promises.push(
          fetch(`https://pokeapi.co/api/v2/pokemon/${i}`)
            .then(response => {
              if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
              return response.json();
            })
        );
      }

      const results = await Promise.all(promises);
      
      results.forEach(data => {
        allPokemon.push({
          id: data.id,
          name: data.name,
          image: data.sprites.other['official-artwork'].front_default,
          types: data.types.map((type) => type.type.name),
        });
      });

      // Atualizar a exibição progressivamente
      displayPokemon();
      createPagination();
    }

    // Salvar no cache
    localStorage.setItem('pokemonData', JSON.stringify(allPokemon));
    
    // Garantir o tempo mínimo de loading mesmo para dados da API
    const elapsedTime = Date.now() - loadingStartTime;
    const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
    await new Promise(resolve => setTimeout(resolve, remainingTime));
    
  } catch (error) {
    console.error('Erro ao carregar os Pokémon:', error);
    pokemonContainer.innerHTML = '<p class="error-message">Erro ao carregar os Pokémon. Por favor, tente novamente mais tarde.</p>';
  } finally {
    loading.style.display = "none";
  }
}

// Função para formatar o nome do Pokémon
function formatPokemonName(name) {
  // Lista de casos especiais
  const specialCases = {
    'nidoran-f': 'Nidoran♀',
    'nidoran-m': 'Nidoran♂',
    'mr-mime': 'Mr. Mime',
    'ho-oh': 'Ho-Oh',
    'porygon-z': 'Porygon-Z',
    'mime-jr': 'Mime Jr.',
    'type-null': 'Type: Null',
    'jangmo-o': 'Jangmo-o',
    'hakamo-o': 'Hakamo-o',
    'kommo-o': 'Kommo-o',
    'tapu-koko': 'Tapu Koko',
    'tapu-lele': 'Tapu Lele',
    'tapu-bulu': 'Tapu Bulu',
    'tapu-fini': 'Tapu Fini'
  };

  // Verifica se é um caso especial
  if (specialCases[name]) {
    return specialCases[name];
  }

  // Trata nomes com hífen
  if (name.includes('-')) {
    return name.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('-');
  }

  // Formatação padrão: primeira letra maiúscula
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// Exibir Pokémon da página atual
function displayPokemon() {
  const pokemonToDisplay = filteredPokemon.length > 0 ? filteredPokemon : allPokemon;
  const startIndex = (currentPage - 1) * pokemonPerPage;
  const endIndex = startIndex + pokemonPerPage;
  const paginatedPokemon = pokemonToDisplay.slice(startIndex, endIndex);

  pokemonContainer.innerHTML = paginatedPokemon
    .map(
      (pokemon) => `
      <div class="pokemon-card" onclick="openPokemonDetails(${pokemon.id})">
        <div class="pokemon-number">Nº ${String(pokemon.id).padStart(3, '0')}</div>
        <img src="${pokemon.image}" alt="${formatPokemonName(pokemon.name)}" />
        <h3>${formatPokemonName(pokemon.name)}</h3>
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

function openPokemonDetails(id) {
  window.location.href = `details.html?id=${id}`;
}

// Criar botões de paginação
function createPagination() {
  const pokemonToDisplay = filteredPokemon.length > 0 ? filteredPokemon : allPokemon;
  const totalPages = Math.ceil(pokemonToDisplay.length / pokemonPerPage);
  
  const paginationHTML = `
    <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? "class='disabled'" : ""}>
      <i class="fas fa-angle-left"></i>
    </button>
    <span>${currentPage}</span>
    <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? "class='disabled'" : ""}>
      <i class="fas fa-angle-right"></i>
    </button>
  `;

  pagination.innerHTML = paginationHTML;
  paginationBottom.innerHTML = paginationHTML;
}

// Alterar página
function changePage(newPage) {
  const pokemonToDisplay = filteredPokemon.length > 0 ? filteredPokemon : allPokemon;
  const totalPages = Math.ceil(pokemonToDisplay.length / pokemonPerPage);

  if (newPage < 1 || newPage > totalPages) return;

  currentPage = newPage;
  displayPokemon();
  createPagination();
}

// Função para rolar para o topo
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Mostrar/ocultar botão de scroll
window.addEventListener('scroll', () => {
  if (window.pageYOffset > 300) {
    scrollTopButton.classList.add('visible');
  } else {
    scrollTopButton.classList.remove('visible');
  }
});

// Filtrar Pokémon pela barra de pesquisa
searchBar.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  
  if (searchTerm) {
    filteredPokemon = allPokemon.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(searchTerm) ||
      pokemon.id.toString().includes(searchTerm) ||
      pokemon.types.some(type => type.toLowerCase().includes(searchTerm))
    );
  } else {
    filteredPokemon = [];
  }

  currentPage = 1; // Reset to first page when searching
  displayPokemon();
  createPagination();
});

// Iniciar busca
fetchPokemon();
