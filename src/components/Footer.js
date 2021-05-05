import React, { useEffect } from 'react';
import Card from './Card/Card.js';

import '../css/footer.css';

function randomIntFromInterval(min, max) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

//create an array of random cards given approximate ratio of eventgoal to person cards
const RandomCardsForFooter = (totalPeopleCards, totalEventGoalCards) => {
  return [...Array(totalPeopleCards + totalEventGoalCards)].map((curr, index, array)=>{

    //half of all person cards are members/commentators and same for event/goal cards
    let broadType = (Math.random() > (totalPeopleCards / array.length)) ? "eventgoal" : "person";
    let specificType = (broadType === "person")
        ? ((Math.random() > 0.5) ? "member" : "commentator")
        : ((Math.random() > 0.5) ? "goal" : "event");

    //random stuff to simulate throwing cards from below the screen
    let randomTransition = Math.round(Math.random() * 75) / 100;
    let randomDegree = randomIntFromInterval(-180, 180);
    let randomZ = Math.round(Math.random() * array.length);
    let randomLeft = Math.round((index - 1) * (100 / array.length));

    //u shaped distribution
    let uShapeVar = Math.floor(Math.pow((index + 1 - array.length / 2), 2) / 4) - 15;
    let randomBottom = uShapeVar;

    let props = {
      id:broadType + index,
      key:broadType + index,
      type:specificType,
      flipPercentage: 0.75,     //chance of showing front of the card
      mainStyle:{
        //stuff needed size the card
        width:"300px",
        height:"215px",
        fontSize:"7.5px",
        //stuff needed to simulate the random throwing
        position:"absolute",
        transform:"rotate(0deg)",
        zIndex:randomZ,
        left:randomLeft + "vw",
        bottom:"-100%",
        transition:"bottom " + randomTransition + "s, transform " + randomTransition + "s " + randomTransition/2 + "s",
        //other shit
        cursor:"pointer",
      },
      //used for animation later in useEffect
      randomBottom:randomBottom + "vh",
      randomDegree:"rotate(" + randomDegree + "deg)",
    }

    //dont flip event / goal cards
    if (broadType === "eventgoal"){
      props.showFront = false;
    }

    return (<Card {...props}/>);
  });;
}

const Footer = (props) => {

  //used to make ratio of cards
  let totalPeopleCards = Math.ceil(window.innerWidth / 150);
  let totalEventGoalCards = Math.ceil(window.innerWidth / 400);

  let footerCards = RandomCardsForFooter(totalPeopleCards, totalEventGoalCards);

  //toggle a flip so we can avoid the first flip no show problem
  useEffect(()=>{
    for (let i = 0; i < footerCards.length; i++){
      let personCard = document.getElementById("person" + i);
      if (personCard){
        document.getElementById("person" + i).classList.toggle("is-flipped");
      }
    }
  });

  return (
    <div className="footer">
      {footerCards}
    </div>
  )
}

export default Footer;
