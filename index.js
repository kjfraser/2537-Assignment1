//Define the game variables
const cardCount = 6;

const setup = async () => {

  //Load Random Images from Pokemon API
  let getResult = await axios.get("https://pokeapi.co/api/v2/pokemon?offset=0&limit=810");
  let pokemon = getResult.data.results;
  let pokemonImages = [];
  for (let i = 0; i < cardCount / 2; i++) {
    let pokemonImage = ""
    while(pokemonImage == "" || pokemonImages.includes(pokemonImage)){
      pokemonImage = await getRandomPokemon(pokemon);
    }
    pokemonImages.push(pokemonImage);
  }

  //Clear the game grid
  $("#game_grid").empty();

  //Create Cards
  for (let i = 0; i < cardCount / 2; i++) {
    let card = $("<div id= >").addClass("card");
    let frontFace = $("<img>").addClass("front_face").attr("src", pokemonImages[i]);
    let id = "img" + i;
    frontFace.attr("id", id);
    let backFace = $("<img>").addClass("back_face").attr("src", "back.webp");
    card.append(frontFace);
    card.append(backFace);
    $("#game_grid").append(card);
  }
  //Create duplicate set
  for (let i = cardCount / 2; i < cardCount; i++) {
    let card = $("<div id= >").addClass("card");
    let frontFace = $("<img>").addClass("front_face").attr("src", pokemonImages[i - cardCount / 2]);
    let id = "img" + i;
    frontFace.attr("id", id);
    let backFace = $("<img>").addClass("back_face").attr("src", "back.webp");
    card.append(frontFace);
    card.append(backFace);
    $("#game_grid").append(card);
  }

  //Randomize Cards
  const cards = $(".card");
  for (let i = 0; i < cards.length; i++) {
    const target = Math.floor(Math.random() * cards.length - 1) + 1;
    const target2 = Math.floor(Math.random() * cards.length - 1) + 1;
    cards.eq(target).before(cards.eq(target2));
  }

  //Game Logic
  let firstCard = undefined;
  let secondCard = undefined;
  $(".card").on(("click"), function () {
    if ($(this).hasClass("flip") || (firstCard && secondCard)) {
      return;
    }
    $(this).toggleClass("flip");
    if (!firstCard) {
      firstCard = $(this).find(".front_face")[0];
    } else {
      secondCard = $(this).find(".front_face")[0];
      if (firstCard.src == secondCard.src) {
        console.log("match");
        $(`#${firstCard.id}`).parent().off("click");
        $(`#${secondCard.id}`).parent().off("click");
        firstCard = undefined;
        secondCard = undefined;
        checkWin();
      } else {
        console.log("no match");
        flipBack(firstCard);
        flipBack(secondCard);
        firstCard = undefined;
        secondCard = undefined;
      }
    }
  });

}

async function getRandomPokemon(pokemon) {
  let randomPokemon = Math.floor(Math.random() * pokemon.length);
  let pokemonName = pokemon[randomPokemon].name;
  let pokemonResult = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
  let pokemonImage = pokemonResult.data.sprites.front_default;
  return pokemonImage;
}

//Check for win
function checkWin() {
  if ($(".flip").length == cardCount) {
    setTimeout(() => {
      alert("You Win!");
      animateEnd();
    }, 1000);

  }
}
//Animate cards turning over at end of game
function animateEnd() {
  $(".card").toggleClass("flip");
  setTimeout(() => {
    setup();
  }, 1000);
}

//Flip cards back over if no match
function flipBack(card) {
  setTimeout(() => {
    $(`#${card.id}`).parent().toggleClass("flip");
  }, 1000);
}


$(document).ready(setup);