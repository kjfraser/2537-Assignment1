var pageSize = 10;
let currentPage = 1;
var pokemon = [];
var allPokemon = [];

var updatePaginationDiv = (currentPage, numPages) => {
  $("#pagination").empty();
  $("#pagination").append(`<button class="btn btn-success psgr ml-1 numberedButtons" value="${1}">First</button>`);
  $("#pagination").append(`<button class="btn btn-success psgr ml-1 numberedButtons" value="${currentPage - 1}">Previous</button>`);
  $("#pagination").append(`<button class="btn btn-success psgr ml-1 numberedButtons" value="${currentPage}">${currentPage}</button>`);
  $("#pagination").append(`<button class="btn btn-success psgr ml-1 numberedButtons" value="${currentPage + 1}">Next</button>`);
  $("#pagination").append(`<button class="btn btn-success psgr ml-1 numberedButtons" value="${numPages}">Last</button>`);
};

var paginate = async (currentPage, pageSize, pokemon) => {
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

var getTypes = async () => {
  $("#types").empty();
  let typeGet = await axios.get("https://pokeapi.co/api/v2/type");
  let types = typeGet.data.results;
  types.forEach((type) => {
    $("#types").append(`<div class="form-check">
    <input class="form-check-input" type="checkbox"  value="${type.name}" id="type${type.name}">
    <label class="form-check-label" for="flexCheckDefault">
    ${type.name}
    </label>
  </div>
    `);

  });
};
async function getPokemonOfType(type) {
  let typeGet = await axios.get(`https://pokeapi.co/api/v2/type/${type}`);
  let pokemonGet = typeGet.data.pokemon.map((pokemon) => pokemon.pokemon);
  console.log(type);
  console.log(pokemonGet);
  return pokemonGet;
}

async function getAllPokemon(){
  let getResult = await axios.get(
    "https://pokeapi.co/api/v2/pokemon?offset=0&limit=810"
  );
  return getResult.data.results;
}

function findPokeOverlap(arraysLarge){
  arraysLarge.push(allPokemon);

  //Get the smallest array
  let smallestArray = arraysLarge[0];
  for (let i = 1; i < arraysLarge.length; i++) {
    if(arraysLarge[i].length < smallestArray.length){
      smallestArray = arraysLarge[i];
    }
  }
 

  //Put the smallest array at the front of the array
  arraysLarge = arraysLarge.filter(array => array != smallestArray)
  arraysLarge.unshift(smallestArray);

    //Get the names of the pokemon
    let arrays = [];
    for(let i = 0; i < arraysLarge.length; i++){
     arrays.push(new Array())
     for(let j = 0; j < arraysLarge[i].length; j++){
        arrays[i].push(arraysLarge[i][j].name);
      }
    }


  //Get the overlap
  let overlap = [];
  for (let item = 0; item < smallestArray.length; item++) {
    let itemvalid = true;
    for (let array = 1; array < arrays.length; array++) {
      if(!arrays[array].includes(smallestArray[item].name)){
        itemvalid = false;
      }
    }
    if(itemvalid){
      overlap.push(smallestArray[item]);
    }
  }

  console.log("overlap");
  console.log(overlap)
  return overlap;
}

async function applyFilters(){
  let filterArray = [];
  let checkboxes = document.querySelectorAll('input[type=checkbox]:checked');
  for (let i = 0; i < checkboxes.length; i++) {
   filterArray.push(getPokemonOfType(checkboxes[i].value));
   console.log(checkboxes[i].value + checkboxes.length)
  }
  


  Promise.all(filterArray).then((values) => {
    console.log("values")
    console.log(values);
    if(values.length == 0){
      init([]);
      return;
    }
    if(values.length == 1){
     init(values[0]);
    }
    let overlap = findPokeOverlap(values);
    init(overlap);
  });
}

var init = async (pokemon) => {
  allPokemon = await getAllPokemon();
  console.log("inited");
  if(pokemon.length == 0){
    pokemon = allPokemon
  }
  this.pokemon = pokemon;

  $("#pokecards").empty();
  paginate(currentPage, pageSize, pokemon);
  var numPages = Math.ceil(pokemon.length / pageSize);
  updatePaginationDiv(currentPage, numPages);


  $('body').on('click', '.pokecard', async function(){
  //Gets the attribute 'pokeName' of the html element.
  var pokeName = $(this).attr('pokeName');
  var pokeGet = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokeName}`);

  //Kind of like a for loop
  var types = pokeGet.data.types.map((attribute) => attribute.type.name);

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



 $(document).ready(init([]), getTypes());


