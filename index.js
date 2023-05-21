//Define the game variables
var isPlaying = false;
var totalCards = 12;
var totalClicks = 0;
var matches = 0;
//Time variables
var startTime;            
var maxTime = 0;
var pauseCountdown = true;
var lastTime = 0;
var randomPowerupTime = 0;
//Screen size variables
var width = 600
var height = 400



//setup a new game
const setup = async () => {
  isPlaying = false;

  //Reset variables
  $("#total_pairs").text("Total Pairs: " + totalCards/2);
  totalClicks = 0;
  $("#total_clicks").text("Total Clicks: " + totalClicks);
  matches = 0;
  $("#matches").text("Matches: " + matches);
  $("#pairs_left").text("Pairs Left: " + (totalCards/2 - matches));
  pauseCountdown = false;

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

  //Prevent grid overflow
  let meanish = sqrtish(totalCards);
  if(totalCards/meanish > meanish){
    meanish = totalCards/meanish;
  }

  var width = 100 / meanish
  var height = 100 / meanish

  //Create Cards
  for (let i = 0; i < totalCards / 2; i++) {
    let card = $("<div id= >").addClass("card");
    let frontFace = $("<img>").addClass("front_face").attr("src", pokemonImages[i]);
    let id = "img" + i;
    frontFace.attr("id", id);
    let backFace = $("<img>").addClass("back_face").attr("src", "back.webp");
    card.append(frontFace);
    card.append(backFace);
    card.css("width", `${width}%`);
    card.css("height", `${height}%`);
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
    card.css("width", `${width}%`);
    card.css("height", `${height}%`);
    $("#game_grid").append(card);
  }


  //Randomize Cards
  const cards = $(".card");
  for (let i = 0; i < cards.length; i++) {
    const rand1 = Math.floor(Math.random() * cards.length - 1) + 1;
    const rand2 = Math.floor(Math.random() * cards.length - 1) + 1;
    cards.eq(rand1).before(cards.eq(rand2)); //Shuffles two random cards
  } 

  //Set Timer
  $("#timer").text("Time Remaining: 0:00");
  clearInterval(timer);
  if (maxTime == 0) {
    maxTime = totalCards * 3 * 1000;
  }
  //Random time for powerup, between 1/4 and 3/4 of max time
  randomPowerupTime = Math.floor(Math.random() * maxTime/2 + maxTime/4)/1000;
  startTime = Date.now();
  //Time events
  setInterval( function() {
    var deltaTime = Date.now() - lastTime;
    var elapsedTime = Date.now() - startTime; // milliseconds elapsed since start
    if(pauseCountdown){startTime += deltaTime;} //If game is over, don't count down
    let newTime = maxTime - elapsedTime;
    let seconds = Math.floor(newTime/1000);
    lastTime = Date.now();
    $("#timer").text("Time Remaining: " + seconds);
    if(seconds < 0 && isPlaying){
      pauseCountdown = true;
      lose();
    }
    //Powerup events
    $("#powerup").css("color", `hsl(${newTime/2}, 100%, 58%)`);
    //hsl(0, 38%, 58%)
    if(seconds < randomPowerupTime){
      randomPowerupTime = -999
      powerup();
    }
  });


  //Game Logic
  isPlaying = true;
  let firstCard = undefined;
  let secondCard = undefined;
  $(".card").on(("click"), function () {
    if (!isPlaying || $(this).hasClass("flip") || (firstCard && secondCard)) {
      return;
    }
    totalClicks++; //Increment total clicks
    $("#total_clicks").text("Total Clicks: " + totalClicks); //Update total clicks

    $(this).toggleClass("flip");
    if (!firstCard) {
      firstCard = $(this).find(".front_face")[0];
      $(this).addClass("outOfPlay");
    } else {
      secondCard = $(this).find(".front_face")[0];
      $(this).addClass("outOfPlay");
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


//Get random pokemon image from API
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
      pauseCountdown = false;
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
    $(`#${card.id}`).parent().removeClass("outOfPlay");
  }, 1000);
}

//Sets up the user interface buttons
const setButtons = () => {
  $("#reset").on("click", () => {
    animateEnd();
  });
  $("#back").on("click", () => {
    $("#game").hide();
    setup();
    $("#menu").show();
    
  }
  );
}

//Gets the closest thing to a square root
function sqrtish(num){
  let meanest = 1;
  for (let i = 1; i <= Math.ceil(Math.sqrt(num)); i++) {
    if(num % i == 0){
      meanest = i;
    }
  }
  return meanest;
}


function start(){
  $("#menu").hide();
  $("#game").show();
  setup();
  setButtons();
}

function lose(){
  isPlaying = false;
  alert("Out of Time!");
  animateEnd();
}

function powerup(){
  $("#powerup").show();
  $(".card").each(function(){
    if(!$(this).hasClass("outOfPlay") ){
      $(this).toggleClass("flip");
    }
  });
  
  setTimeout(() => {
    $(".card").each(function(){
      if(!$(this).hasClass("outOfPlay")){
        $(this).toggleClass("flip");
      }
    });
    $("#powerup").hide();
  }, 1500);
}




//Start the game when the page loads
$(document).ready(() => {
  $("#easy").on("click", () => {
    totalCards = 16;
    maxTime = 0;
    start();
  });
  $("#medium").on("click", () => {
    totalCards = 36;
    maxTime = 0;
    start();
  });
  $("#hard").on("click", () => {
    totalCards = 100;
    maxTime = 0;
    start();
  });
  $("#custom_game").on("click", () => {

    //Ensure that custom pairs is within bounds
    if($("#setpairs").val() > $("#setpairs").attr("max")){
      $("#setpairs").val($("#setpairs").attr("max"));
    }
    if($("#setpairs").val() < $("#setpairs").attr("min")){
      $("#setpairs").val($("#setpairs").attr("min"));
    }

    //Ensure that custom time is within bounds
    if($("#settime").val() > $("#settime").attr("max")){
      $("#settime").val($("#settime").attr("max"));
    }
    if($("#settime").val() < $("#settime").attr("min")){
      $("#settime").val($("#settime").attr("min"));
    }

    //Set total cards and max time
    totalCards = $("#setpairs").val() * 2;
    maxTime = $("#settime").val() * 1000;
    start();
  }
  );

  //Settings
  $("#darkmodetoggle").on("click", () => {
    $('body').toggleClass("darkmode");
  });


});