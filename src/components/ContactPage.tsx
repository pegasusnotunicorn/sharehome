import { useEffect, useState } from "react";
import styles from "../css/pages/contactPage.module.css";
import { NavLink } from "react-router";
import PolaroidGallery from "./utils/PolaroidGallery";
import { CONTACT_POLAROIDS } from "./utils/contactPolaroids";
import useWindowDimensions from "./utils/useWindowDimensions";
import { SOCIAL_LINKS, SocialIcon, SocialIconDefs } from "./utils/SocialIcons";

const ContactPage = () => {
  const { isMobile } = useWindowDimensions();
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  useEffect(() => {
    document.title = "Contact us";
  }, []);

  return (
    <div className={`content ${styles.contactPage}`}>
      <SocialIconDefs className={styles.socialIconDefs} />
      <div className="subcontentWrapper margin-top min-width">
        <div className={`characterContent ${styles.pageIntro}`}>
          <h2 className={`subtitle ${styles.pageIntroTitle}`}>Contact us</h2>
          <p className={styles.pageIntroLead}>
            Follow along on my game dev journey 🎮
          </p>
          <div className={styles.socialIconsWrapper}>
            {SOCIAL_LINKS.map(
              ({
                href,
                label,
                iconId,
                external = true,
                brandColor,
                hoverBackground,
                hoverIconColor = "#fff",
              }) => (
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
              ),
            )}
          </div>
        </div>
      </div>

      <div className={styles.aboutMeWrapper}>
        <div className={styles.aboutMeVerticalWrapper}>
          <img
            src="/images/wonmin.webp"
            alt="Wonmin, the game designer"
            className={styles.wonminImage}
          />
        </div>
        <div className={styles.aboutMeVerticalWrapper}>
          <h2>
            <span className={styles.desktopOnlyGreeting}>Hello. </span>My name
            is Wonmin 👋
            <br />I am the game designer.
          </h2>
          <p>
            I quit my cushy corporate job in 2016 to pursue my dreams of
            becoming a game developer. And in March of 2021, that dream became a
            reality when my first game,{" "}
            <a href="http://sysifuscorp.com/" target="_blank" rel="noreferrer">
              Welcome to Sysifus Corp
            </a>
            , was successfully funded on Kickstarter.
          </p>
          {(!isMobile || isBioExpanded) && (
            <>
              <p>
                I had no idea what I was doing when I quit my job. Even now, I
                am still terrified for my future. But it is thanks to the
                support of fans like you that I am able to do what I love. And
                for that, I am truly thankful.
              </p>
              <p>
                I make games through{" "}
                <a
                  href="https://unicornwithwings.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  Pegasus Games
                </a>,
                including Love, Career & Magic, which is very much inspired by
                reality TV but not affiliated with any existing show.
              </p>
              <p>
                Thanks for visiting my humble page and please consider{" "}
                <NavLink to="/buy">buying the game!</NavLink>
              </p>
            </>
          )}
          {isMobile && (
            <div className={styles.readMoreButtonWrapper}>
              <button
                type="button"
                className={styles.readMoreButton}
                onClick={() => setIsBioExpanded((current) => !current)}
              >
                {isBioExpanded ? "Show less" : "Click here to read more"}
              </button>
            </div>
          )}
        </div>
      </div>
      <PolaroidGallery
        items={CONTACT_POLAROIDS}
        className={styles.contactPolaroids}
        showConnector={false}
      />
    </div>
  );
};

export default ContactPage;
