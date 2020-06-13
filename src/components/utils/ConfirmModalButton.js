import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle, XCircle } from 'react-feather';

import '../../css/Designer/modal.css';

const Modal = (props) => {
  return createPortal(
    (
      <div ref={props.modalRef} className="modal" tabIndex="0" onKeyDown={props.handleKeyPress} onClick={props.cancel}>
        <div onClick={(e)=>{e.stopPropagation()}} className="modalTextWrapper blueBackground">
          <AlertTriangle className="is-48 yellowStroke" />
          <h3>{props.modalText}</h3>
          <div className="modalButtonWrapper">
            <button className="modalButton button" onClick={props.confirm}>
              <CheckCircle className="greenStroke" />Yes
            </button>
            <button className="modalButton button" onClick={props.cancel}>
              <XCircle className="redStroke" />
              No
            </button>
          </div>
        </div>
      </div>
    ),
    document.getElementById("modal")
  )
}

//shows a modal to confirm the choice
export const ConfirmModalButton = (props) => {
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef(null);

  //cancel function
  const cancel = (e) => {
    if (e) {
      e.stopPropagation();
    }
    setShowModal(false);
  }

  //confirmation function
  const confirm = (e) => {
    if (e) {
      e.stopPropagation();
    }
    props.onClick();
    setShowModal(false);
  }

  //keyboard presses for modal
  const handleKeyPress = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (showModal){
      switch( e.keyCode ) {
        case 27:    //escape
          cancel();
          break;
        case 13:    //enter
          confirm();
          break;
        default:
          break;
      }
    }
  }

  //focus the modal div so we can add React Synthetic event handler to it, this way all state updates will be batched later
  useEffect(()=>{
    if (showModal){
      modalRef.current.focus();
    }
  });

  return (
    <>
      <button
        className={props.className}
        onClick={(e)=>{
          e.stopPropagation();
          setShowModal(true);
        }}
      >
        {props.icon}{props.text}
      </button>

      {showModal &&
        <Modal
          modalRef={modalRef}
          modalText={props.modalText}
          handleKeyPress={handleKeyPress}
          confirm={confirm}
          cancel={cancel}
        />
      }

    </>
  )
}

export default ConfirmModalButton;
