import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'react-feather';
import '../../../css/Designer/modal.css';

//shows a modal to confirm the choice
export const ConfirmModalButton = (props) => {
  const [showModal, setShowModal] = useState(false);
  const closeModal = (e) => {
    setShowModal(false);
  }

  return (
    <span>
      <button
        className={props.className}
        onClick={()=>{setShowModal(true)}}
      >
        {props.icon}{props.text}
      </button>

      {showModal &&
        <div className="modal" onClick={closeModal}>
          <div onClick={(e)=>{e.stopPropagation()}}className="modalTextWrapper blueBackground">
            <AlertTriangle className="is-48 yellowStroke" />
            <h3>{props.modalText}</h3>
            <div className="modalButtonWrapper">
              <button className="modalButton button" onClick={()=>{
                closeModal();
                props.onClick();
              }}>
                <CheckCircle className="greenStroke" />Yes
              </button>
              <button className="modalButton button" onClick={closeModal}>
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
