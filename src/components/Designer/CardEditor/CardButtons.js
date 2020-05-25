import React from 'react';
import { Image, Copy, Trash2 } from 'react-feather';
import '../../../css/Designer/cardButtons.css';

function CardButtons(props){
  return (
    <div className="contentButtonWrapper contentWrapper">
      <input
        id="imageFileInput"
        type="file"
        onChange={props.handleInputChange}
        name="image"
        accept="image/*"
      />
      <label id="imageFileLabel" className="noselect button contentButton" htmlFor="imageFileInput"><Image />Change Image</label>
      <button className="noselect button contentButton" onClick={props.duplicateCurrentCard}><Copy />Duplicate Card</button>
      <button className="noselect button contentButton" onClick={props.removeCurrentCard}><Trash2 />Delete Card</button>
    </div>
  )
}

export default CardButtons;
