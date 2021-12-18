import React from 'react';
import { Image, Copy, Trash2 } from 'react-feather';
import { useTranslation } from 'react-i18next';

import ConfirmModalButton from '../../utils/ConfirmModalButton.js';

import '../../../css/pages/designer/cardButtons.css';

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
              className="noselect button hideText is-rounded contentButton"
              htmlFor="imageFileInput"
            >
              <Image /><span>{t("designer page.editor.buttons.change image")}</span>
            </label>
          </>
        }

        <button className="noselect button hideText is-rounded contentButton" onClick={props.duplicateCurrentCard}>
          <Copy />
          <span>{t("designer page.editor.buttons.duplicate")}</span>
        </button>

        <ConfirmModalButton
          className="noselect button hideText is-rounded contentButton"
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
