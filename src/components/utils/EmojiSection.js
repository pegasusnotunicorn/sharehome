import React from 'react';
import { useTranslation } from 'react-i18next';

//custom files
import { getAllFinishedPeople } from '../Characters/Characters.js';
import '../../css/utils/emojisection.css';
import { GsapFadeScrub } from "./useGsap.js";
import DefaultButton from '../utils/DefaultButton.js';

const EmojiWrapper = ({emoji}) => {
  return (
    <div className="emojiWrapper">
      <img src={`/images/emojis/${emoji}.png`} className="emojiImage" title={emoji} alt={`${emoji}`}/>
    </div>
  )
}

export const EmojiSection = (props) => {
  const { t } = useTranslation();

  let allCharacters = getAllFinishedPeople();
  let allEmoji2Characters = allCharacters.filter(elem => elem.emoji2);

  const buildElem = (elem, key, two)=>{
    return <EmojiWrapper key={key} emoji={(two) ? elem.emoji2 : elem.emoji} />
  }
  let allEmojis = allCharacters.map((elem, index) => {return buildElem(elem, `${index}Emoji1`, false)}).concat(allEmoji2Characters.map((elem, index) => {return buildElem(elem, `${index}Emoji2`, true)}));

  // <DefaultButton href="/allEmojis.zip" download="allEmojis.zip" className="emojiPackDownloadButton" icon="download" inverted borderedBlack shadowless text={t('characters page.emojiall')}/>
  return (
    <div id="emojis" className="emojiSection">
      <GsapFadeScrub fadeIn className="fadeInTextWrapper">
        <div className="subcontentWrapper margin-top min-width">
          <div className="characterContent emojiDescriptionWrapper">
            <h2>{t('characters page.emojisection')}</h2>
            <p>{t('characters page.emojidescription')}</p>
            <ul>
              <li>{t('characters page.emojidesc1')}</li>
              <li>{t('characters page.emojidesc2')}</li>
              <li>{t('characters page.emojidesc3')}</li>
            </ul>
          </div>
          <div className="emojiButtonsWrapper">
            <DefaultButton href="https://discord.com/invite/nv89cRgEsS" className="emojiPackDownloadButton" icon="discordWhite" shadowless text={t('characters page.discordjoin')}/>
          </div>
          <div className="emojisWrapper">
            { allEmojis }
          </div>
        </div>
      </GsapFadeScrub>
    </div>
  )
}
