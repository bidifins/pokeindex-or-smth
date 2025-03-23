let allPokemon = [];

async function loadPokemonList() {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1010');
    const data = await response.json();
    allPokemon = await Promise.all(
        data.results.map(async (pokemon, index) => {
            const pokemonDetails = await fetch(`https://pokeapi.co/api/v2/pokemon/${index + 1}`);
            const details = await pokemonDetails.json();

            return {
                id: index + 1,
                name: pokemon.name,
                sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index + 1}.png`,
                types: details.types.map(typeInfo => typeInfo.type.name) // Extracts type(s)
            };
        })
    );

    displayPokemon(allPokemon);
}

const typeColors = {
    normal: "#A8A77A", fire: "#EE8130", water: "#6390F0", electric: "#F7D02C",
    grass: "#7AC74C", ice: "#96D9D6", fighting: "#C22E28", poison: "#A33EA1",
    ground: "#E2BF65", flying: "#A98FF3", psychic: "#F95587", bug: "#A6B91A",
    rock: "#B6A136", ghost: "#735797", dragon: "#6F35FC", dark: "#705746",
    steel: "#B7B7CE", fairy: "#D685AD"
};

function displayPokemon(pokemonArray) {
    const pokemonList = document.getElementById("pokemon-list");
    pokemonList.innerHTML = '';

    pokemonArray.forEach(pokemon => {
        const primaryType = pokemon.types[0]; // First typing
        const backgroundColor = typeColors[primaryType] || "#CCC"; // Default if type missing
        const typeBadges = pokemon.types.map(type => 
            `<span class="badge text-white bg-dark opacity-50 me-1">${type.charAt(0).toUpperCase() + type.slice(1)}</span>`
        ).join('');

        const pokemonBox = document.createElement("div");
        pokemonBox.classList.add("col");
        pokemonBox.innerHTML = `
            <div class="pokemon-box p-2" data-name="${pokemon.name}" data-id="${pokemon.id}" onclick="selectPokemon('${pokemon.name}')"
                style="background-color: ${backgroundColor}; border-color: ${backgroundColor};">
                <img src="${pokemon.sprite}" alt="${pokemon.name}">
                <p class="mb-1 fw-bold text-white">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} #${pokemon.id}</p>
                <div>${typeBadges}</div>
            </div>
        `;
        pokemonList.appendChild(pokemonBox);
    });
}

function selectPokemon(name) {
    window.location.href = `info.html?name=${name}`;
}

function filterPokemon() {
    const searchValue = document.getElementById("search").value.toLowerCase();
    const selectedRegion = document.getElementById("region-filter").value;

    let filteredPokemon = allPokemon.filter(pokemon => 
        pokemon.name.includes(searchValue) || pokemon.id.toString() === searchValue
    );

    const regionRanges = {
        "kanto": [1, 151], "johto": [152, 251], "hoenn": [252, 386], "sinnoh": [387, 493],
        "unova": [494, 649], "kalos": [650, 721], "alola": [722, 809], "galar": [810, 905],
        "paldea": [906, 1010]
    };

    if (selectedRegion !== "all") {
        const [min, max] = regionRanges[selectedRegion];
        filteredPokemon = filteredPokemon.filter(pokemon => pokemon.id >= min && pokemon.id <= max);
    }

    displayPokemon(filteredPokemon);
}

loadPokemonList();
