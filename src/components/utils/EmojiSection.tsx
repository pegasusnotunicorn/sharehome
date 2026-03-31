import { useEffect } from "react";
import { getAllFinishedPeople } from "../Characters/Characters";
import styles from "../../css/utils/emojisection.module.css";
import "../../css/utils/spotlight.css";
import { GsapFadeScrub } from "./useGsap";
import DefaultButton from "../utils/DefaultButton";
import useWindowDimensions from "../utils/useWindowDimensions";

interface EmojiWrapperProps {
  urlName: string;
  emoji: string;
  index: number;
}

//a single emoji wrapper
const EmojiWrapper = ({ urlName, emoji, index }: EmojiWrapperProps) => {
  return (
    <a aria-label={emoji} href={`/characters/${urlName}`}>
      <div id={`emojiWrapper${index}`} className={styles.emojiWrapper}>
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

interface EmojiSectionProps {
  className?: string;
}

export const EmojiSection = (props: EmojiSectionProps) => {
  //how many emojis should display
  let { width } = useWindowDimensions();
  const cutoffNumber = width <= 900 ? 10 : 24;

  useEffect(() => {
    const interval = setInterval(() => {
      let allEmojiDom = document.getElementsByClassName(styles.emojiWrapper);
      let activeEmoji = document.querySelectorAll(`.${styles.emojiWrapper}.active`);
      if (activeEmoji.length > 0 && activeEmoji[0])
        activeEmoji[0].classList.remove("active");

      let randomNum = Math.floor(Math.random() * allEmojiDom.length);
      document
        .getElementById(`emojiWrapper${randomNum}`)
        ?.classList.add("active");
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  //get all emojis
  let allCharacters = getAllFinishedPeople(true);
  let allEmojis: { urlName: string; emoji: string }[] = [];
  allCharacters.forEach((elem) => {
    let emojiObj: { urlName: string; emoji: string }[] = [];
    elem.emoji.forEach((x) => {
      emojiObj.push({
        urlName: elem.urlName,
        emoji: x,
      });
    });
    allEmojis = allEmojis.concat(emojiObj);
  });
  allEmojis = allEmojis.slice(0, cutoffNumber);

  const emojiElements = allEmojis.map((elem, index) => {
    return (
      <EmojiWrapper
        key={`emojiWrapper${index}`}
        index={index}
        emoji={elem.emoji}
        urlName={elem.urlName}
      />
    );
  });

  return (
    <div id="emojis" className={`${styles.emojiSection} ${props.className}`}>
      <div className="subcontentWrapper padding-top min-width">
        <GsapFadeScrub fadeIn className="fadeInTextWrapper">
          <div className={`characterContent ${styles.emojiDescriptionWrapper}`}>
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
          <div className={styles.emojiButtonsWrapper}>
            <DefaultButton
              variant="primary"
              href="https://discord.com/invite/nv89cRgEsS"
              className={styles.emojiPackDownloadButton}
              icon="discordWhite"
              text="Get free emojis"
            />
          </div>
        </GsapFadeScrub>
        <div className={styles.emojisWrapper}>{emojiElements}</div>
      </div>
    </div>
  );
};
