import React from 'react';

import ConfirmModal from '../utils/ConfirmModal.js';

//a button that shows a modal to confirm the choice
export const ConfirmModalButton = (props) => {
  const innards = (
    <>
      {props.icon}<span>{props.text}</span>
    </>
  )

  return (
    <ConfirmModal
      outerElement={"button"}
      innards={innards}
      className={props.className}
      onClick={props.onClick}
      modalText={props.modalText}
    />
  )
}

export default ConfirmModalButton;
