const load = async () => {
  $("#pokecards").empty();
  let getResult = await axios.get(
    "https://pokeapi.co/api/v2/pokemon?offset=0&limit=810"
  );
  const pokemon = getResult.data.results;
  pokemon.forEach(async (pokemon) => {
    let res = await axios.get(pokemon.url);
    $("#pokecards").append(`
    <div class="pokecard card">
    <h3>${res.data.name.toUpperCase()}<h3>
    <img src="${res.data.sprites.front_default}" alt="${res.data.name}">
    <button type="button" class="btn btn-success" data-toggle="modal" data-target="#pokeModal">
      More
    </button>
    </div>
    `);
  });
};

$(document).ready(load);
