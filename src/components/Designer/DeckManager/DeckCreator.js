import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowLeft } from 'react-feather';
import { useTranslation } from 'react-i18next';

import { getDefaultDeck } from '../utils/deckConstants.js';
import Card from '../../Card/Card.js';
import '../../../css/pages/designer/deckCreator.css';

// <p>
//   <NavLink to="/designer/copy">
//     ...or click here to copy someone else's deck
//   </NavLink>
// </p>

//CTA buttons to create a new deck
const DeckCreator = (props) => {
  const { t } = useTranslation();

  let deckTypes = [
    {
      type:"member",
      description:t("designer page.creator.decks.member"),
      className:"greenBackground",
    },
    {
      type:"event",
      description:t("designer page.creator.decks.event"),
      className:"redBackground",
    },
    {
      type:"goal",
      description:t("designer page.creator.decks.goal"),
      className:"blueBackground",
    },
  ].map((elem, index)=>{
    return (
      <div
        key={elem.type + index}
        className={`deckCreator noselect ${elem.className}`}
        onClick={()=>{
          props.createNewDeck(getDefaultDeck(elem.type));
        }}
      >
        <Card
          type={elem.type}
          showFront={false}
          mainStyle={{
            width:"175px",
            height:"125px",
            fontSize:"4.75px",
          }}
        />
        <p>{elem.description}</p>
      </div>
    )
  });

  return (
    <div className="subcontentWrapper">
      <h3 className="subsubtitle">
        { props.decks.length > 0 &&
          <NavLink to="/designer"><ArrowLeft className="subtitleBackPageArrow" /></NavLink>
        }
        <span>{t("designer page.creator.prompt")}</span>
      </h3>

      <div className="deckCreatorWrapper">
        {deckTypes}
      </div>
    </div>
  )
}

export default DeckCreator;
