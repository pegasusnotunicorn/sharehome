import React, { useEffect } from 'react';
import { MemberCard } from './MemberCard.js';
import { EventGoalCard } from './EventGoalCard.js';
import '../../css/footer.css';

function randomIntFromInterval(min, max) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

//create an array of random cards given type and total amount to make
function createRandomCards(type, totalSame, totalAll){
  return [...Array(totalSame)].map((curr, index)=>{
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
        width:"35vh",
        height:"25vh",
        fontSize:"1vh",
        left:randomLeft + "vw",
        zIndex:randomZ,
        bottom:"-100%",
        transform:"rotate(0deg)",
        transition:"none",
        position:"fixed"
      },
      transition:"bottom " + randomTransition + "s, transform " + randomTransition + "s " + randomTransition/2 + "s",
      //used for animation later in useEffect
      randomBottom:randomBottom + "vh",
      randomDegree:"rotate(" + randomDegree + "deg)",
    }

    return (type === "member") ? (<MemberCard {...props}/>) : (<EventGoalCard {...props}/>);
  });;
}

const Footer = (props) => {

  let totalMemberCards = Math.ceil(window.innerWidth / 200);
  let totalEventGoalCards = Math.ceil(window.innerWidth / 500);
  let totalCards = totalMemberCards + totalEventGoalCards;

  let memberCards = createRandomCards("member", totalMemberCards, totalCards);
  let eventGoalCard = createRandomCards("eventgoal", totalEventGoalCards, totalCards);

  //animate bottom + rotation to simulate "throwing" the cards from bottom
  useEffect(()=>{
    for (let i = 0; i < memberCards.length; i++){
      document.getElementById("member" + i).style.transition = memberCards[i].props.transition;
      document.getElementById("member" + i).style.bottom = memberCards[i].props.randomBottom;
      document.getElementById("member" + i).style.transform = memberCards[i].props.randomDegree;
    }
    for (let i = 0; i < eventGoalCard.length; i++){
      document.getElementById("eventgoal" + i).style.transition = eventGoalCard[i].props.transition;
      document.getElementById("eventgoal" + i).style.bottom = eventGoalCard[i].props.randomBottom;
      document.getElementById("eventgoal" + i).style.transform = eventGoalCard[i].props.randomDegree;
    }
  });

  return (
    <div className="footer">
      {eventGoalCard}
      {memberCards}
    </div>
  )
}

export default Footer;
