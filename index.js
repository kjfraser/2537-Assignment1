var pageSize = 10;
let currentPage = 1;
let pokemon = [];

const updatePaginationDiv = (currentPage, numPages) => {
  $("#pagination").empty();

  let startPage = 1;
  let endPage = numPages;
  // for (let i = startPage; i <= endPage; i++) {
  //   $("#pagination").append(`
  //   <button class="btn btn-success psgr ml-1 numberedButtons" value="${i}">${i}</button>
  //   `);
  // }
  $("#pagination").append(`<button class="btn btn-success psgr ml-1 numberedButtons" value="${1}">First</button>`);
  $("#pagination").append(`<button class="btn btn-success psgr ml-1 numberedButtons" value="${currentPage - 1}">Previous</button>`);
  $("#pagination").append(`<button class="btn btn-success psgr ml-1 numberedButtons" value="${currentPage}">${currentPage}</button>`);
  $("#pagination").append(`<button class="btn btn-success psgr ml-1 numberedButtons" value="${currentPage + 1}">Next</button>`);
  $("#pagination").append(`<button class="btn btn-success psgr ml-1 numberedButtons" value="${numPages}">Last</button>`);
};

const paginate = async (currentPage, pageSize, pokemon) => {
  let selectedPokemon = pokemon.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  $("#pokecards").empty();
  selectedPokemon.forEach(async (pokemon) => {
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
};

const init = async () => {
  $("#pokecards").empty();
  let getResult = await axios.get(
    "https://pokeapi.co/api/v2/pokemon?offset=0&limit=810"
  );
  const pokemon = getResult.data.results;
 
  paginate(currentPage, pageSize, pokemon);
  const numPages = Math.ceil(pokemon.length / pageSize);
  updatePaginationDiv(currentPage, numPages);


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
    <h5>${pokeGet.data.id}</h5>
    `);

  });

  $('body').on('click', '.numberedButtons', async function(e){
  desiredPage = Number(e.target.value);
  if(desiredPage < 1 || desiredPage > numPages){
    return;
  }
  currentPage = desiredPage;
  paginate(currentPage, pageSize, pokemon);
  
  updatePaginationDiv(currentPage, numPages);

  })

};




$(document).ready(init);
