import React, { useEffect } from 'react';
import Card from './Card/Card.js';

function randomIntFromInterval(min, max) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

//create an array of random cards given type and total amount to make
const RandomCardsForFooter = (type, totalSame, totalAll) => {
  return [...Array(totalSame)].map((curr, index)=>{

    //random stuff to simulate throwing cards from below the screen
    let randomLeft = Math.round((Math.random() * 10 - 5) + (index)*(100/totalSame));
    let randomBottom = randomIntFromInterval(-20, -7);
    let randomZ = Math.round(Math.random() * totalAll);
    let randomDegree = randomIntFromInterval(-180, 180);
    let randomTransition = Math.round(Math.random() * 75) / 100;

    //half of all person cards are members/commentators and same for event/goal cards
    let tempType = (type === "person")
      ? ((Math.random() > 0.5) ? "member" : "commentator")
      : ((Math.random() > 0.5) ? "goal" : "event");

    let props = {
      id:type + index,
      key:tempType + index,
      type:tempType,
      mainStyle:{
        //stuff needed size the card
        width:"35vh",
        height:"25vh",
        fontSize:"1vh",
        //stuff needed to simulate the random throwing
        position:"fixed",
        transition:"none",
        transform:"rotate(0deg)",
        zIndex:randomZ,
        left:randomLeft + "vw",
        bottom:"-100%",
      },
      //used for animation later in useEffect
      transition:"bottom " + randomTransition + "s, transform " + randomTransition + "s " + randomTransition/2 + "s",
      randomBottom:randomBottom + "vh",
      randomDegree:"rotate(" + randomDegree + "deg)",
    }

    //dont flip event / goal cards
    if (type !== "person"){
      props.showFront = false;
    }

    return (<Card {...props}/>);
  });;
}

const Footer = (props) => {

  let totalMemberCards = Math.ceil(window.innerWidth / 200);
  let totalEventGoalCards = Math.ceil(window.innerWidth / 500);
  let totalCards = totalMemberCards + totalEventGoalCards;

  let memberCards = RandomCardsForFooter("person", totalMemberCards, totalCards);
  let CardBack = RandomCardsForFooter("eventgoal", totalEventGoalCards, totalCards);

  //animate bottom + rotation to simulate "throwing" the cards from bottom
  useEffect(()=>{
    for (let i = 0; i < memberCards.length; i++){
      let memberCardDom = document.getElementById("person" + i);
      memberCardDom.classList.toggle("is-flipped");   //toggle a flip so we can avoid the first flip no show problem
      memberCardDom.style.transition = memberCards[i].props.transition;
      memberCardDom.style.bottom = memberCards[i].props.randomBottom;
      memberCardDom.style.transform = memberCards[i].props.randomDegree;
    }
    for (let i = 0; i < CardBack.length; i++){
      document.getElementById("eventgoal" + i).style.transition = CardBack[i].props.transition;
      document.getElementById("eventgoal" + i).style.bottom = CardBack[i].props.randomBottom;
      document.getElementById("eventgoal" + i).style.transform = CardBack[i].props.randomDegree;
    }
  });

  return (
    <div className="footer">
      {CardBack}
      {memberCards}
    </div>
  )
}

export default Footer;
