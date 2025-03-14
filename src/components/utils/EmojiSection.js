import { useEffect } from "react";
import { getAllFinishedPeople } from "../Characters/Characters.js";
import "../../css/utils/emojisection.css";
import { GsapFadeScrub } from "./useGsap.js";
import DefaultButton from "../utils/DefaultButton.js";
import useWindowDimensions from "../utils/useWindowDimensions.js";
import PropTypes from "prop-types";

//a single emoji wrapper
const EmojiWrapper = ({ urlName, emoji, index }) => {
  return (
    <a aria-label={emoji} href={`/characters/${urlName}`}>
      <div id={`emojiWrapper${index}`} className="emojiWrapper">
        <img
          loading="lazy"
          src={`/images/emojis/${emoji}.webp`}
          className="emojiImage"
          title={emoji}
          alt={`${emoji}`}
        />
      </div>
    </a>
  );
};

EmojiWrapper.propTypes = {
  urlName: PropTypes.string,
  emoji: PropTypes.string,
  index: PropTypes.number,
};

export const EmojiSection = (props) => {
  //how many emojis should display
  let { width } = useWindowDimensions();
  const cutoffNumber = width <= 900 ? 12 : 24;

  useEffect(() => {
    const interval = setInterval(() => {
      let allEmojiDom = document.getElementsByClassName("emojiWrapper");
      let activeEmoji = document.getElementsByClassName("emojiWrapper active");
      if (activeEmoji.length > 0 && activeEmoji[0])
        activeEmoji[0].classList.remove("active");

      let randomNum = Math.floor(Math.random() * allEmojiDom.length);
      document
        .getElementById(`emojiWrapper${randomNum}`)
        .classList.add("active");
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  //get all emojis
  let allCharacters = getAllFinishedPeople(true);
  let allEmojis = [];
  allCharacters.forEach((elem) => {
    let emojiObj = [];
    elem.emoji.forEach((x) => {
      emojiObj.push({
        urlName: elem.urlName,
        emoji: x,
      });
    });
    allEmojis = allEmojis.concat(emojiObj);
  });
  allEmojis = allEmojis.slice(0, cutoffNumber);

  allEmojis = allEmojis.map((elem, index) => {
    return (
      <EmojiWrapper
        key={`emojiWrapper${index}`}
        index={index}
        emoji={elem.emoji}
        urlName={elem.urlName}
      />
    );
  });

  // <DefaultButton href="/allEmojis.zip" download="allEmojis.zip" className="emojiPackDownloadButton" icon="download" inverted borderedBlack shadowless text={t('characters page.emojiall')}/>
  return (
    <div id="emojis" className={`emojiSection ${props.className}`}>
      <div className="subcontentWrapper padding-top min-width">
        <GsapFadeScrub fadeIn className="fadeInTextWrapper">
          <div className="characterContent emojiDescriptionWrapper">
            <h2>Free character emojis</h2>
            <p>
              Join the Discord community to use these emojis for free right now!
            </p>
            <ul>
              <li>See previews and unreleased content before anyone else.</li>
              <li>Be a part of the developer journey from the beginning.</li>
              <li>Playtest and give feedback to help shape the games.</li>
            </ul>
          </div>
          <div className="emojiButtonsWrapper">
            <DefaultButton
              href="https://discord.com/invite/nv89cRgEsS"
              className="emojiPackDownloadButton"
              icon="discordWhite"
              shadowless
              text="Get free emojis"
            />
          </div>
        </GsapFadeScrub>
        <div className="emojisWrapper">{allEmojis}</div>
      </div>
    </div>
  );
};

EmojiSection.propTypes = {
  className: PropTypes.string,
};
