import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'react-feather';
import '../../../css/Designer/modal.css';

//shows a modal to confirm the choice
export const ConfirmModalButton = (props) => {
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef(null);

  //cancel function
  const cancel = (e) => {
    setShowModal(false);
  }

  //confirmation function
  const confirm = (e) => {
    props.onClick();
    setShowModal(false);
  }

  //keyboard presses for modal
  const handleKeyPress = (event) => {
    console.log("EEE")
    event.preventDefault();

    if (showModal){
      switch( event.keyCode ) {
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
    <span>
      <button
        className={props.className}
        onClick={()=>{setShowModal(true)}}
      >
        {props.icon}{props.text}
      </button>

      {showModal &&
        <div ref={modalRef} className="modal" tabIndex="0" onKeyDown={handleKeyPress} onClick={cancel}>
          <div onClick={(e)=>{e.stopPropagation()}}className="modalTextWrapper blueBackground">
            <AlertTriangle className="is-48 yellowStroke" />
            <h3>{props.modalText}</h3>
            <div className="modalButtonWrapper">
              <button className="modalButton button" onClick={confirm}>
                <CheckCircle className="greenStroke" />Yes
              </button>
              <button className="modalButton button" onClick={cancel}>
                <XCircle className="redStroke" />
                No
              </button>
            </div>
          </div>
        </div>
      }

    </span>
  )
}

export default ConfirmModalButton;
