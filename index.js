const init = async () => {
  $("#pokecards").empty();
  let getResult = await axios.get(
    "https://pokeapi.co/api/v2/pokemon?offset=0&limit=810"
  );
  const pokemon = getResult.data.results;
  pokemon.forEach(async (pokemon) => {
    let pokeGet = await axios.get(pokemon.url);
    $("#pokecards").append(`
    <div class="pokecard card" pokeName=${pokeGet.data.name}> 
    <h3>${pokeGet.data.name.toUpperCase()}</h3>
    <img src="${pokeGet.data.sprites.front_default}" alt="${pokeGet.data.name}">
    <button type="button" class="btn btn-success" data-toggle="modal" data-target="#pokeModal">
      More
    </button>
    </div>
    `);
  });


$('body').on('click', '.pokecard', async function(){
  console.log("Hello");
  //Gets the attribute 'pokeName' of the html element.
  const pokeName = $(this).attr('pokeName');
  const pokeGet = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokeName}`);

  //Kind of like a for loop
  const types = pokeGet.data.types.map((attribute) => attribute.type.name);

  $('.modal-body').html(`
    <div style="width:200px">
    <img src="${pokeGet.data.sprites.other['official-artwork'].front_default}" alt="${pokeGet.data.name}">
    <div>
    <h3>Abilities</h3>
    <ul>
    ${pokeGet.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
    </ul>
    </div>

    <div>
    <h3>Stats</h3>
    <ul>
    ${pokeGet.data.stats.map((attribute) => `<li>${attribute.stat.name}: ${attribute.base_stat}</li>`).join('')}
    </ul>
    </div>

    </div>

    <h3>Types</h3>
    <ul>
    ${types.map((type) => `<li>${type}</li>`).join('')}
    </ul>
    `);
    
    $('.modal-title').html(`
    <h2>${pokeGet.data.name.toUpperCase()}</h2>
    `);

});
}




$(document).ready(init);
