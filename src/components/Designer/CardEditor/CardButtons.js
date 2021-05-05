import React from 'react';
import { Image, Copy, Trash2 } from 'react-feather';

import ConfirmModalButton from '../../utils/ConfirmModalButton.js';

import '../../../css/Designer/cardButtons.css';

const CardButtons = (props) => {
  const currentDeck = props.currentDeck;

  return (
    <>
      <div className="contentButtonWrapper">
        <h3 className="cardButtonsTitle">Card Editing Tools</h3>
        { (["member", "commentator"].indexOf(currentDeck.type) !== -1) &&
          <>
            <input
              id="imageFileInput"
              name="image"
              type="file"
              accept="image/*"
              onChange={props.handleInputChange}
            />
            <label
              id="imageFileLabel"
              className="noselect button is-transparent is-rounded contentButton"
              htmlFor="imageFileInput"
            >
              <Image />Change Image
            </label>
          </>
        }

        <button className="noselect button is-transparent is-rounded contentButton" onClick={props.duplicateCurrentCard}><Copy />Duplicate Card</button>

        <ConfirmModalButton
          className="noselect button is-transparent is-rounded contentButton"
          onClick={props.removeCurrentCard}
          icon={<Trash2 />}
          text="Delete Card"
          modalText="Are you sure you want to delete the current card?"
        />
      </div>
    </>
  )
}

export default CardButtons;
