const listaDePokemones = document.getElementById('pokemonList');
const modalPokemon = document.getElementById('pokemonModal');
const detallesPokemon = document.getElementById('pokemonDetails');
const cerrarModal = document.querySelector('.close');
const listaDeFavoritos = document.getElementById('favoritesList');
let pokemonesFavoritos = JSON.parse(localStorage.getItem('favorites')) || [];

// Función para obtener la lista de pokemones con evoluciones
async function obtenerListaDePokemones() {
    const respuesta = await fetch('https://pokeapi.co/api/v2/pokemon?limit=15');
    const datos = await respuesta.json();

    const pokemonesConEvolucion = await Promise.all(datos.results.map(async (pokemon) => {
        const detallesPokemon = await fetch(pokemon.url).then(res => res.json());
        const especie = await fetch(detallesPokemon.species.url).then(res => res.json());
        const cadenaEvolucion = await fetch(especie.evolution_chain.url).then(res => res.json());

        // Obtener la evolución base
        let evolucionBase = cadenaEvolucion.chain.species.name;
        let evolucionActual = cadenaEvolucion.chain.evolves_to[0]?.species.name || evolucionBase;

        return {
            ...detallesPokemon,
            evolucionBase: evolucionBase,
            evolucionActual: evolucionActual
        };
    }));

    // Ordenar por el número de Pokémon (id)
    pokemonesConEvolucion.sort((a, b) => {
        return a.id - b.id; // Ordenar de menor a mayor por el id
    });

    mostrarPokemones(pokemonesConEvolucion);
}


// Mostrar los pokemones en pantalla
function mostrarPokemones(pokemones) {
    listaDePokemones.innerHTML = '';
    pokemones.forEach(pokemon => {
        const tarjetaPokemon = crearTarjetaPokemon(pokemon);
        listaDePokemones.appendChild(tarjetaPokemon);
    });
}

// Crear tarjetas de Pokémon
function crearTarjetaPokemon(pokemon) {
    const tarjeta = document.createElement('div');
    tarjeta.classList.add('pokemon-card');

    const img = document.createElement('img');
    img.src = pokemon.sprites.front_default;

    const nombre = document.createElement('p');
    nombre.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

    const btnFavorito = document.createElement('button');
    btnFavorito.textContent = pokemonesFavoritos.includes(pokemon.name) ? 'Favorito' : 'Agregar a Favoritos';
    btnFavorito.classList.add('favorite-btn');
    if (pokemonesFavoritos.includes(pokemon.name)) {
        btnFavorito.classList.add('favorited');
    }

    // Usar event.stopPropagation() para evitar que el clic en el botón propague el evento
    btnFavorito.addEventListener('click', (event) => {
        event.stopPropagation(); // Evitar que el clic propague el evento
        alternarFavorito(pokemon.name, btnFavorito);
    });

    tarjeta.appendChild(img);
    tarjeta.appendChild(nombre);
    tarjeta.appendChild(btnFavorito);
    
    // Mostrar detalles solo si se hace clic en la tarjeta
    tarjeta.addEventListener('click', () => mostrarDetallesPokemon(pokemon));

    return tarjeta;
}


// Mostrar detalles del Pokémon
function mostrarDetallesPokemon(pokemon) {
    detallesPokemon.innerHTML = `
        <div class="pokeDetail">
        <img class="pokePhoto" src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <h2 class="pokeName">${pokemon.name.toUpperCase()}</h2>
        <p><strong>Altura:</strong> ${pokemon.height} m</p>
        <p><strong>Peso:</strong> ${pokemon.weight} kg</p>
        <p><strong>Habilidades:</strong> ${pokemon.abilities.map(ability => ability.ability.name).join(', ')}</p>
        </div>
    `;
    modalPokemon.style.display = 'block';
}

// Cerrar el modal de detalles
cerrarModal.onclick = function () {
    modalPokemon.style.display = 'none';
}

// Añadir o remover de favoritos
function alternarFavorito(nombrePokemon, boton) {
    if (pokemonesFavoritos.includes(nombrePokemon)) {
        pokemonesFavoritos = pokemonesFavoritos.filter(nombre => nombre !== nombrePokemon);
        boton.textContent = 'Agregar a Favoritos';
        boton.classList.remove('favorited');
    } else {
        pokemonesFavoritos.push(nombrePokemon);
        boton.textContent = 'Favorito';
        boton.classList.add('favorited');
    }
    localStorage.setItem('favorites', JSON.stringify(pokemonesFavoritos));
}


// Función de búsqueda
document.getElementById('searchImage').addEventListener('click', () => {
    const consulta = document.getElementById('pokemonSearch').value.toLowerCase();
    const todasLasTarjetas = [...document.querySelectorAll('.pokemon-card')];

    if (consulta === '') {
        // Si no hay consulta, mostrar todas las tarjetas
        obtenerListaDePokemones();
    } else {
        // Filtrar tarjetas según la consulta
        const pokemonesFiltrados = todasLasTarjetas.filter(tarjeta =>
            tarjeta.querySelector('p').textContent.toLowerCase().includes(consulta)
        );
        listaDePokemones.innerHTML = '';
        pokemonesFiltrados.forEach(tarjeta => listaDePokemones.appendChild(tarjeta));
    }
});



obtenerListaDePokemones();
