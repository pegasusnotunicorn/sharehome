import { useState } from "react";
import styles from "../css/pages/contactPage.module.css";
import { NavLink } from "react-router";
import { BUY_DESTINATION, recordBuyClick } from "./utils/BuyButton";
import { trackEvent } from "./utils/trackEvent";
import PolaroidJourney from "./utils/PolaroidJourney";
import { SOCIAL_LINKS, SocialIcon } from "./utils/SocialIcons";
import { CONTACT_EMAIL, SYSIFUS_URL } from "../utils/links";

const ContactPage = () => {
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  return (
    <div className={`content ${styles.contactPage}`}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>Say hi</p>
        <h1 className={styles.title}>Contact us</h1>
        <p className={styles.lede}>Follow along on my game dev journey 🎮</p>
        {/* (the address written out, to copy; its link styled as the bio's) */}
        <p className={`${styles.lede} ${styles.bio}`}>
          Or email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
        <div className={styles.socials}>
          {SOCIAL_LINKS.map(({ href, label, iconId, external = true, brandColor, hoverBackground, hoverIconColor = "#fff" }) => (
            <a
              key={label}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noreferrer" : undefined}
              aria-label={label}
              style={{
                ["--social-brand-color" as string]: brandColor,
                ["--social-brand-background" as string]: hoverBackground ?? brandColor,
                ["--social-brand-icon-color" as string]: hoverIconColor,
              }}
            >
              <SocialIcon className={styles.socialIcon} iconId={iconId} />
            </a>
          ))}
        </div>
      </header>

      <section className={styles.about}>
        <img src="/images/wonmin.webp" alt="Wonmin, the game designer" className={styles.portrait} />
        <div className={styles.aboutWords}>
          <p className={styles.label}>The game designer</p>
          <h2 className={styles.aboutTitle}>Hello, I&apos;m Wonmin 👋</h2>
          <div className={`${styles.bio}${isBioExpanded ? ` ${styles.bioOpen}` : ""}`}>
            <p>
              I quit my cushy corporate job in 2016 to pursue my dreams of becoming a game developer. And in March of
              2021, that dream became a reality when my first game,{" "}
              <a href={SYSIFUS_URL} target="_blank" rel="noreferrer">
                Welcome to Sysifus Corp
              </a>
              , was successfully funded on Kickstarter.
            </p>
            <p>
              I had no idea what I was doing when I quit my job. Even now, I am still terrified for my future. But it
              is thanks to the support of fans like you that I am able to do what I love. And for that, I am truly
              thankful.
            </p>
            <p>
              I make games through{" "}
              <a href="https://unicornwithwings.com" target="_blank" rel="noreferrer">
                Pegasus Games
              </a>
              , including Love, Career & Magic, which is very much inspired by reality TV but not affiliated with any
              existing show.
            </p>
            <p>
              Thanks for visiting my humble page and please consider{" "}
              <NavLink
                to={BUY_DESTINATION}
                onClick={() => {
                  trackEvent("buy_click", { from: "contact" });
                  recordBuyClick();
                }}
              >
                buying the game!
              </NavLink>
            </p>
          </div>
          <button type="button" className={styles.readMore} onClick={() => setIsBioExpanded((v) => !v)}>
            {isBioExpanded ? "Show less" : "Read more"}
          </button>
        </div>
      </section>

      <PolaroidJourney label="2018 – today" title="The journey so far" />
    </div>
  );
};

export default ContactPage;
