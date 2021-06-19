import { getDefaultPersonCard, getDefaultEventGoalCard } from './cardConstants.js';
import i18n from "i18next";

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
    name:i18n.t("default") + " " + i18n.t(type) + " " + i18n.t("deck"),
    type:type,
    cards:defaultCards,
    currentCardIndex:0,
    createdOn:Date.now(),
    selected:true,
    description:i18n.t("default") + " " + i18n.t(type) + " " + i18n.t("deck"),
  }
}
