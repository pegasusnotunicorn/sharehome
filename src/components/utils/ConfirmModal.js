import React, { useState } from 'react';

import Modal from '../utils/Modal.js';

//an element that shows a modal to confirm the choice
export const ConfirmModal = (props) => {
  const [showModal, setShowModal] = useState(props.showModal);

  const OuterElement = props.outerElement;

  return (
    <>
      <OuterElement
        className={props.className}
        onClick={(e)=>{
          e.stopPropagation();
          setShowModal(true);
        }}
      >
        {props.innards}
      </OuterElement>
      { showModal &&
        <Modal
          showModal={showModal}
          setShowModal={setShowModal}
          onClick={props.onClick}
          modalText={props.modalText}
          showCancel={true}
        />
      }
    </>
  )
}

export default ConfirmModal;
