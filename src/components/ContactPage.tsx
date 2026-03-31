import { useEffect } from "react";
import styles from "../css/pages/contactPage.module.css";
import { NavLink } from "react-router";
import PolaroidGallery, { type PolaroidGalleryItem } from "./utils/PolaroidGallery";

const CONTACT_POLAROIDS: PolaroidGalleryItem[] = [
  {
    src: "/images/polaroids/contact/polaroid-1.webp",
    alt: "First ever prototype",
    hideOnMobile: true,
    caption: "First ever prototype",
  },
  {
    src: "/images/polaroids/contact/polaroid-2.webp",
    alt: "Welcome to Sysifus Corp Kickstarter funded",
    hideOnMobile: true,
    caption: (
      <>
        First game{" "}
        <a href="http://sysifuscorp.com/" target="_blank" rel="noreferrer">
          Welcome to Sysifus Corp
        </a>{" "}
        Kickstarter successfully funded
      </>
    ),
  },
  {
    src: "/images/polaroids/contact/polaroid-3.webp",
    alt: "Love, Career & Magic terrace house prototype",
    caption: "Love, Career & Magic prototype back when it was a Terrace House game",
  },
  {
    src: "/images/polaroids/contact/polaroid-4.webp",
    alt: "Fulfilling Sysifus Corp",
    hideOnMobile: true,
    caption: "Fulfilling Sysifus Corp",
  },
  {
    src: "/images/polaroids/contact/polaroid-5.webp",
    alt: "First ever street market",
    caption: "First ever street market",
  },
  {
    src: "/images/polaroids/contact/polaroid-6.webp",
    alt: "First board game conference PAX Unplugged 2021",
    caption: "First ever board game conference PAX Unplugged 2021",
  },
  {
    src: "/images/polaroids/contact/polaroid-7.webp",
    alt: "First time seeing my game in a game store",
    caption: "First time seeing my game in a game store",
  },
  {
    src: "/images/polaroids/contact/polaroid-8.webp",
    alt: "Made it into the Washington Post",
    caption: "Making it on the Washington Post",
  },
  {
    src: "/images/polaroids/contact/polaroid-9.webp",
    alt: "Parents reacting to my newspaper article",
    caption: "Parents reacting to my newspaper article",
  },
  {
    src: "/images/polaroids/contact/polaroid-10.webp",
    alt: "First failed Kickstarter attempt for Love, Career & Magic",
    caption: "First failed Kickstarter attempt for Love, Career & Magic",
  },
  {
    src: "/images/polaroids/contact/polaroid-11.webp",
    alt: "Revamped gameplay and PAX Unplugged 2022",
    caption: "Revamped gameplay and attending PAX Unplugged 2022",
  },
  {
    src: "/images/polaroids/contact/polaroid-12.webp",
    alt: "LCM second Kickstarter funded",
    caption: "LCM second Kickstarter funded",
  },
  {
    src: "/images/polaroids/contact/polaroid-13.webp",
    alt: "LCM Kickstarter order fulfillment",
    caption: "LCM KS order fulfillment",
  },
  {
    src: "/images/polaroids/contact/polaroid-14.webp",
    alt: "First event to sell out",
    caption: "First ever event to sell out",
  },
  {
    src: "/images/polaroids/contact/polaroid-15.webp",
    alt: "Final copy of Sysifus sold",
    hideOnMobile: true,
    caption: "Final copy of Sysifus sold",
  },
  {
    src: "/images/polaroids/contact/polaroid-16.webp",
    alt: "Rising Showcase recipient PAX Unplugged 2025",
    caption: "Selected as a Rising Showcase recipient PAX Unplugged 2025",
  },
  {
    src: "/images/polaroids/contact/polaroid-17.webp",
    alt: "Final copy of LCM sold",
    caption: "Final copy of LCM sold",
  },
  {
    src: "/images/polaroids/contact/polaroid-18.webp",
    alt: "Sold out of every single game",
    caption: "Sold out of every single game",
  },
];

const ContactPage = () => {
  useEffect(() => {
    document.title = "Contact us";
  }, []);

  return (
    <div className={`content ${styles.contactPage}`}>
      <div className="subcontentWrapper margin-top min-width">
        <div className={`characterContent ${styles.pageIntro}`}>
          <h2 className={`subtitle ${styles.pageIntroTitle}`}>Get in touch</h2>
          <p className={styles.pageIntroLead}>
            Follow along on my game dev journey 🎮
          </p>
          <div className={styles.socialIconsWrapper}>
            <a
              href="mailto:hello@lovecareermagic.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Email"
            >
              <img loading="lazy" src="/images/icons/email2.svg" alt="Email" />
            </a>
            <a
              href="https://instagram.com/sysifuscorp"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <img
                loading="lazy"
                src="/images/icons/instagram.svg"
                alt="Instagram"
              />
            </a>
            <a
              href="https://www.tiktok.com/@pegasusgamesnyc"
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
            >
              <img loading="lazy" src="/images/icons/tiktok.svg" alt="TikTok" />
            </a>
            <a
              href="https://www.reddit.com/user/sysifuscorp"
              target="_blank"
              rel="noreferrer"
              aria-label="Reddit"
            >
              <img loading="lazy" src="/images/icons/reddit.svg" alt="Reddit" />
            </a>
            <a
              href="https://discord.com/invite/nv89cRgEsS"
              target="_blank"
              rel="noreferrer"
              aria-label="Discord"
            >
              <img
                loading="lazy"
                src="/images/icons/discord.svg"
                alt="Discord"
              />
            </a>
            <a
              href="https://twitter.com/sysifuscorp"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
            >
              <img
                loading="lazy"
                src="/images/icons/twitter.svg"
                alt="Twitter"
              />
            </a>
            <a
              href="https://www.facebook.com/sysifuscorp"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              <img
                loading="lazy"
                src="/images/icons/facebook.svg"
                alt="Facebook"
              />
            </a>
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
          <p className={styles.imageCaption}>
            Love, Career & Magic is made by{" "}
            <a href="https://unicornwithwings.com">Pegasus Games</a> and is not
            affiliated with any existing reality TV show.{" "}
            <span className={styles.inlineCaptionAside}>
              (although I would love to be)
            </span>
          </p>
        </div>
        <div className={styles.aboutMeVerticalWrapper}>
          <h2>
            Hello. My name is Wonmin 👋
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
          <p>
            I had no idea what I was doing when I quit my job. Even now, I am
            still terrified for my future. But it is thanks to the support of
            fans like you that I am able to do what I love. And for that, I am
            truly thankful.
          </p>
          <p>
            Thanks for visiting my humble page and please consider{" "}
            <NavLink to="/buy">buying the game!</NavLink>
          </p>
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
