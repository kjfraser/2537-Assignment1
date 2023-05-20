
const setup = () => {
  let firstCard = undefined;
  let secondCard = undefined;
  $(".card").on(("click"), function() {
    if($(this).hasClass("flip")){
      return;
    }
    console.log("clicked");
    $(this).toggleClass("flip");

    if (!firstCard){
      firstCard = $(this).find(".front_face")[0];
    } else {
      secondCard = $(this).find(".front_face")[0];
      console.log(firstCard, secondCard);

      if(firstCard.src == secondCard.src){
        console.log("match");
        $(`#${firstCard.id}`).parent().off("click");
        $(`#${secondCard.id}`).parent().off("click");
        console.log($(`#${firstCard.id}`));
        console.log($(`#${secondCard.id}`));
      firstCard = undefined;
        secondCard = undefined;  
      }else{
        console.log("no match");
        flipBack(firstCard);
        flipBack(secondCard);
        firstCard = undefined;
        secondCard = undefined;
      }
    }



  });
}

function flipBack(card){
  setTimeout(() => {
    $(`#${card.id}`).parent().toggleClass("flip");
  }, 1000);
}


$(document).ready(setup);