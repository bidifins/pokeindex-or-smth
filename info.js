function goBack() {
    window.location.href = "index.html";
}

async function fetchPokemon(pokemon) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
        if (!response.ok) throw new Error("Pokémon not found");
        const data = await response.json();

        const speciesResponse = await fetch(data.species.url);
        const speciesData = await speciesResponse.json();

        const evoResponse = await fetch(speciesData.evolution_chain.url);
        const evoData = await evoResponse.json();

        document.getElementById("favicon").setAttribute("href", data.sprites.front_default);
        document.title = `${capitalize(data.name)} Index`;

        document.getElementById("pokemon-name").innerHTML = `<strong>${capitalize(data.name)} #${data.id}</strong>`;
        document.getElementById("pokemon-sprite").src = data.sprites.front_default;
        document.getElementById("pokemon-sprite").alt = data.name;

        const typeColors = {
            normal: "#A8A77A", fire: "#EE8130", water: "#6390F0", electric: "#F7D02C",
            grass: "#7AC74C", ice: "#96D9D6", fighting: "#C22E28", poison: "#A33EA1",
            ground: "#E2BF65", flying: "#A98FF3", psychic: "#F95587", bug: "#A6B91A",
            rock: "#B6A136", ghost: "#735797", dragon: "#6F35FC", dark: "#705746",
            steel: "#B7B7CE", fairy: "#D685AD"
        };

        function createTypeBadges(typesArray) {
            return typesArray.map(type => {
                const lowerType = type.toLowerCase();
                const bgColor = typeColors[lowerType] || "#777";
                return `<span style="display:inline-block; padding:5px 10px; margin:5px; border-radius:10px; font-weight:bold; background-color:${bgColor}; color:white;">
                            ${type}
                        </span>`;
            }).join(" ");
        }

        const types = data.types.map(t => capitalize(t.type.name));
        document.getElementById("pokemon-type").innerHTML = createTypeBadges(types);

        const weaknesses = new Set();
        for (const type of types) {
            const typeResponse = await fetch(`https://pokeapi.co/api/v2/type/${type.toLowerCase()}`);
            const typeData = await typeResponse.json();
            typeData.damage_relations.double_damage_from.forEach(weak => 
                weaknesses.add(capitalize(weak.name))
            );
        }
        document.getElementById("pokemon-weakness").innerHTML = createTypeBadges([...weaknesses]);

        const abilities = await Promise.all(data.abilities.map(async ability => {
            const abilityRes = await fetch(ability.ability.url);
            const abilityData = await abilityRes.json();
            const isHidden = ability.is_hidden ? "<span class='hidden-ability'>(Hidden)</span>" : "";
            return `<strong>${capitalize(ability.ability.name)}</strong> ${isHidden}: ${abilityData.effect_entries.find(e => e.language.name === 'en').effect}`;
        }));
        document.getElementById("pokemon-abilities").innerHTML = abilities.join('<br>');

        document.getElementById("pokemon-height").innerText = data.height / 10;
        document.getElementById("pokemon-weight").innerText = data.weight / 10;

        const genderRate = speciesData.gender_rate;
        document.getElementById("pokemon-genders").innerText = 
            genderRate === -1 ? "Genderless" : `Male: ${(8 - genderRate) / 8 * 100}%, Female: ${genderRate / 8 * 100}%`;

        document.getElementById("pokemon-stats").innerHTML = data.stats.map(s => 
            `${capitalizeStat(s.stat.name)}: ${s.base_stat}`
        ).join('<br>');

        let evolutionChain = "";
        let evo = evoData.chain;
        let hasEvolution = evo.evolves_to.length > 0;

        while (evo) {
            const evoName = evo.species.name;
            const evoResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${evoName}`);
            const evoData = await evoResponse.json();
            const evoSprite = evoData.sprites.front_default;

            evolutionChain += `<div class='evo-container' onclick="fetchPokemon('${evoName}')">
                <img src="${evoSprite}" alt="${capitalize(evoName)}">
                <br>${capitalize(evoName)}
            </div> → `;

            evo = evo.evolves_to[0];
        }

        if (hasEvolution) {
            document.getElementById("pokemon-evolution").innerHTML = evolutionChain.replace(/ → $/, "");
        } else {
            document.querySelector(".info-evo").style.display = "none";
        }
    } catch (error) {
        document.getElementById("container").innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function capitalizeStat(stat) {
    return stat.split('-').map(word => capitalize(word)).join(' ');
}

const params = new URLSearchParams(window.location.search);
if (params.has('name')) {
    fetchPokemon(params.get('name'));
}
