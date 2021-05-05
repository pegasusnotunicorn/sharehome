import { getDefaultPersonCard, getDefaultEventGoalCard } from './cardConstants.js';

export function getDefaultDeck(type){

  let defaultCards;

  switch (type){
    case "member":
    case "commentator":
      defaultCards = [getDefaultPersonCard()];
      break;
    case "event":
    case "goal":
    default:
      defaultCards = [getDefaultEventGoalCard(type)];
      break;
  }

  return {
    name:"Default " + capitalize(type) + " Deck",
    type:type,
    cards:defaultCards,
    currentCardIndex:0,
    createdOn:Date.now(),
    selected:true,
    description:"Default " + capitalize(type) + " Deck",
  }
}

//capitalize first letter of a string
function capitalize(string){
  return string.charAt(0).toUpperCase() + string.slice(1);
}
