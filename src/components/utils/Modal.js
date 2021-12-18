import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle, XCircle } from 'react-feather';
import { useTranslation } from 'react-i18next';

import '../../css/pages/designer/modal.css';

//a modal with keyboard functionality that shows
const Modal = (props) => {
  const { t } = useTranslation();

  const showModal = props.showModal;
  const setShowModal = props.setShowModal;
  const onClick = props.onClick;

  //various customizations
  const showCancel = props.showCancel;
  const confirmText = props.confirmText || t("yes");
  const cancelText = props.cancelText || t("no");

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
    if (onClick){
      onClick();
    }
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

  const modalText = () => {
    return {__html: props.modalText.replace('\n', "<br/>")};
  }

  const icon = props.icon || <AlertTriangle className="is-48 yellowStroke" />;

  return createPortal(
    (
      <div ref={modalRef} className="modal" tabIndex="0" onKeyDown={handleKeyPress} onClick={cancel}>
        <div onClick={(e)=>{e.stopPropagation()}} className="modalTextWrapper blueBackground">
          { icon }
          <h3 dangerouslySetInnerHTML={modalText()}></h3>
          <div className="modalButtonWrapper">
            <button className="modalButton button is-rounded" onClick={confirm}>
              <CheckCircle className="greenStroke" />{confirmText}
            </button>
            { showCancel &&
              <button className="modalButton button is-rounded" onClick={cancel}>
                <XCircle className="redStroke" />
                {cancelText}
              </button>
            }
          </div>
        </div>
      </div>
    ),
    document.getElementById("modal")
  )
}

export default Modal;
