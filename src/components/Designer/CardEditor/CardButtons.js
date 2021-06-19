import React from 'react';
import { Image, Copy, Trash2 } from 'react-feather';
import { useTranslation } from 'react-i18next';

import ConfirmModalButton from '../../utils/ConfirmModalButton.js';

import '../../../css/Designer/cardButtons.css';

const CardButtons = (props) => {
  const { t } = useTranslation();
  const currentDeck = props.currentDeck;

  return (
    <>
      <div className="contentButtonWrapper">
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
              className="noselect button is-rounded contentButton"
              htmlFor="imageFileInput"
            >
              <Image />{t("designer page.editor.buttons.change image")}
            </label>
          </>
        }

        <button className="noselect button is-rounded contentButton" onClick={props.duplicateCurrentCard}><Copy />{t("designer page.editor.buttons.duplicate")}</button>

        <ConfirmModalButton
          className="noselect button is-rounded contentButton"
          onClick={props.removeCurrentCard}
          icon={<Trash2 />}
          text={t("designer page.editor.buttons.delete")}
          modalText={t("designer page.editor.buttons.delete prompt")}
        />
      </div>
    </>
  )
}

export default CardButtons;
