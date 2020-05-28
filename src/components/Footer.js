import React, { useEffect } from 'react';
import Card from './Card/Card.js';

function randomIntFromInterval(min, max) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

//create an array of random cards given type and total amount to make
function createRandomCards(type, totalSame, totalAll){
  return [...Array(totalSame)].map((curr, index)=>{

    //random stuff to simulate throwing cards from below the screen
    let randomLeft = Math.round((Math.random() * 10 - 5) + (index)*(100/totalSame));
    let randomBottom = randomIntFromInterval(-20, -7);
    let randomZ = Math.round(Math.random() * totalAll);
    let randomDegree = randomIntFromInterval(-80, 80);
    let randomTransition = Math.round(Math.random() * 75) / 100;

    let tempType = (type === "member") ? "member" : (Math.random() > 0.5) ? "goal" : "event";
    let props = {
      key:tempType + index,
      id:type + index,
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
    if (tempType !== "member"){
      props.showFront = false;
    }

    return (<Card {...props}/>);
  });;
}

const Footer = (props) => {

  let totalMemberCards = Math.ceil(window.innerWidth / 200);
  let totalCardBacks = Math.ceil(window.innerWidth / 500);
  let totalCards = totalMemberCards + totalCardBacks;

  let memberCards = createRandomCards("member", totalMemberCards, totalCards);
  let CardBack = createRandomCards("eventgoal", totalCardBacks, totalCards);

  //animate bottom + rotation to simulate "throwing" the cards from bottom
  useEffect(()=>{
    for (let i = 0; i < memberCards.length; i++){
      document.getElementById("member" + i).style.transition = memberCards[i].props.transition;
      document.getElementById("member" + i).style.bottom = memberCards[i].props.randomBottom;
      document.getElementById("member" + i).style.transform = memberCards[i].props.randomDegree;
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
