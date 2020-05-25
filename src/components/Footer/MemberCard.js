import React from 'react';
import { getRandomMember, getSpecificMember } from './FooterCardConstants.js';

export const MemberCard = (props) => {
  let currentMember = (props.memberName) ? getSpecificMember(props.memberName) : getRandomMember();

  return (
    <div id={props.id} className="noselect memberCard footerCard" style={props.mainStyle}>
      <div className="memberCardShadow"></div>
      <div className="memberCardText">
        <div className="memberCardMainText">
          {currentMember.name} ({currentMember.age})
        </div>
        <div className="memberCardSubText">
          {currentMember.job}&nbsp;<span className="japaneseName">{currentMember.japaneseName}</span>
        </div>
      </div>
      <img
        draggable={false}
        className="memberCardImage nopointerevent"
        alt="Background for Card"
        src={currentMember.image.url}
      />
    </div>
  )
}
