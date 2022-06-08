import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

//custom files
import { getAllFinishedPeople } from '../Characters/Characters.js';
import '../../css/utils/emojisection.css';
import { GsapFadeScrub } from "./useGsap.js";
import DefaultButton from '../utils/DefaultButton.js';
import useWindowDimensions from '../utils/useWindowDimensions.js';

//a single emoji wrapper
const EmojiWrapper = ({urlName, emoji, index}) => {
  return (
    <a href={`/characters/${urlName}`}>
      <div id={`emojiWrapper${index}`} className="emojiWrapper">
        <img src={`/images/emojis/${emoji}.png`} className="emojiImage" title={emoji} alt={`${emoji}`}/>
      </div>
    </a>
  )
}

export const EmojiSection = (props) => {
  const { t } = useTranslation();

  //how many emojis should display
  let { width } = useWindowDimensions();
  const cutoffNumber = (width <= 900) ? 12 : 24;

  useEffect(() => {
    const interval = setInterval(() => {
      let allEmojiDom = document.getElementsByClassName("emojiWrapper");
      let activeEmoji = document.getElementsByClassName("emojiWrapper active");
      if (activeEmoji.length > 0 && activeEmoji[0]) activeEmoji[0].classList.remove("active");

      let randomNum = Math.floor(Math.random() * allEmojiDom.length);
      document.getElementById(`emojiWrapper${randomNum}`).classList.add("active");
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  //get all emojis
  let allCharacters = getAllFinishedPeople(true);
  let allEmojis = [];
  allCharacters.forEach((elem, index) => {
    let emojiObj = [];
    elem.emoji.forEach((x,y) => {
      emojiObj.push({
        urlName : elem.urlName,
        emoji : x
      })
    });
    allEmojis = allEmojis.concat(emojiObj);
  });
  allEmojis = allEmojis.slice(0, cutoffNumber);

  allEmojis = allEmojis.map((elem, index) => {
    return (
      <EmojiWrapper key={`emojiWrapper${index}`} index={index} emoji={elem.emoji} urlName={elem.urlName} />
    )
  });

  // <DefaultButton href="/allEmojis.zip" download="allEmojis.zip" className="emojiPackDownloadButton" icon="download" inverted borderedBlack shadowless text={t('characters page.emojiall')}/>
  return (
    <div id="emojis" className={`emojiSection ${props.className}`}>
      <div className="subcontentWrapper padding-top min-width">
        <GsapFadeScrub fadeIn className="fadeInTextWrapper">
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
        </GsapFadeScrub>
        <GsapFadeScrub fadeIn scrub>
          <div className="emojisWrapper">
            { allEmojis }
          </div>
        </GsapFadeScrub>
      </div>
    </div>
  )
}
