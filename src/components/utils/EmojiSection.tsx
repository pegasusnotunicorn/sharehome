import { useMemo } from "react";
import { getAllFinishedPeople } from "../Characters/Characters";
import styles from "../../css/utils/emojisection.module.css";
import DefaultButton from "../utils/DefaultButton";
import { DISCORD_URL } from "../../utils/links";

interface EmojiSectionProps {
  className?: string;
}

// how many stickers show: three rows of four on a phone, two rows of eight on a wide screen (the CSS
// hides the rest)
const SHOWN = 16;

// The free emojis on Discord: what you get for joining, beside a sheet of the emojis as stickers
export const EmojiSection = ({ className = "" }: EmojiSectionProps) => {
  const emojis = useMemo(
    () =>
      getAllFinishedPeople(true)
        .flatMap((c) => c.emoji.map((emoji) => ({ urlName: c.urlName, name: c.name, emoji })))
        .slice(0, SHOWN),
    []
  );

  return (
    <section id="emojis" className={`${styles.emojiSection} ${className}`} aria-labelledby="emojis-title">
      <div className={styles.panel}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Free on Discord</p>
          <h2 id="emojis-title" className={styles.title}>
            Free character emojis
          </h2>
          <p className={styles.lede}>Join the Discord community to use these emojis for free right now!</p>
          <ul className={styles.perks}>
            <li>See previews and unreleased content before anyone else.</li>
            <li>Be a part of the developer journey from the beginning.</li>
            <li>Playtest and give feedback to help shape the games.</li>
          </ul>
          <DefaultButton
            variant="primary"
            href={DISCORD_URL}
            className={styles.cta}
            icon="discord"
            text="Get free emojis"
          />
        </div>
        <ul className={styles.stickers} aria-label="Some of the emojis">
          {emojis.map((e, i) => (
            <li key={e.emoji} className={styles.sticker} style={{ "--tilt": `${((i * 37) % 11) - 5}deg` } as React.CSSProperties}>
              <span className={styles.stickerFace}>
                <img loading="lazy" src={`/images/emojis/${e.emoji}.webp`} alt={`${e.name}'s emoji`} width={64} height={64} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
