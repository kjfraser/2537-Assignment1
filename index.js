//Define the game variables
var totalCards = 6;
var totalClicks = 0;
var matches = 0;
var startTime;
var time = 30;

const setup = async () => {

  //Reset variables
  $("#total_pairs").text("Total Pairs: " + totalCards/2);
  totalClicks = 0;
  $("#total_clicks").text("Total Clicks: " + totalClicks);
  matches = 0;
  $("#matches").text("Matches: " + matches);
  $("#pairs_left").text("Pairs Left: " + (totalCards/2 - matches));

  //Load Random Images from Pokemon API
  let getResult = await axios.get("https://pokeapi.co/api/v2/pokemon?offset=0&limit=810");
  let pokemon = getResult.data.results;
  let pokemonImages = [];
  for (let i = 0; i < totalCards / 2; i++) {
    let pokemonImage = ""
    while(pokemonImage == "" || pokemonImages.includes(pokemonImage)){
      pokemonImage = await getRandomPokemon(pokemon);
    }
    pokemonImages.push(pokemonImage);
  }

  //Clear the game grid
  $("#game_grid").empty();

  //Create Cards
  for (let i = 0; i < totalCards / 2; i++) {
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
  for (let i = totalCards / 2; i < totalCards; i++) {
    let card = $("<div id= >").addClass("card");
    let frontFace = $("<img>").addClass("front_face").attr("src", pokemonImages[i - totalCards / 2]);
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

  //Reset Timer
  $("#timer").text("Time: 0:00");
  clearInterval(timer);
  time = totalCards/4 * 10 * 10000; 
  startTime = Date.now();
  setInterval( function() {
    var delta = Date.now() - startTime; // milliseconds elapsed since start
    let newTime = time - delta;
    let seconds = Math.floor(newTime/1000) % 60;
    $("#timer").text("Time: " + seconds);
  });



  

  //Game Logic
  let firstCard = undefined;
  let secondCard = undefined;
  $(".card").on(("click"), function () {
    if ($(this).hasClass("flip") || (firstCard && secondCard)) {
      return;
    }
    totalClicks++; //Increment total clicks
    $("#total_clicks").text("Total Clicks: " + totalClicks); //Update total clicks

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
        matches++;
        $("#matches").text("Matches: " + matches);
        $("#pairs_left").text("Pairs Left: " + (totalCards/2 - matches));
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
  if ($(".flip").length == totalCards) {
    setTimeout(() => {
      alert("You Win!");
      animateEnd();
    }, 1000);

  }
}
//Animate cards turning over at end of game
function animateEnd() {
  $(".card").removeClass("flip");
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

const setButtons = () => {
  console.log("setting buttons");
  $("#reset").on("click", () => {
    animateEnd();
  });
}

$(document).ready(()=>{
  setup();
  setButtons();
});