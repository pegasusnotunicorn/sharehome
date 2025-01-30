import React, { useEffect } from "react";
import "../css/pages/contactPage.css";

const ContactPage = (props) => {
  useEffect(() => {
    document.title = "Contact us";
  });

  return (
    <div className="content">
      <div className="subcontentWrapper margin-top min-width">
        <div className="characterContent">
          <h2 className="subtitle">Get in touch!</h2>
          <div className="socialIconsWrapper">
            <a
              href="mailto:hello@lovecareermagic.com"
              target="_blank"
              rel="noreferrer"
            >
              <img src="/images/icons/email2.svg" alt="Email" />
            </a>
            <a
              href="https://instagram.com/sysifuscorp"
              target="_blank"
              rel="noreferrer"
            >
              <img src="/images/icons/instagram.svg" alt="Instagram" />
            </a>
            <a
              href="https://www.tiktok.com/@pegasusgamesnyc"
              target="_blank"
              rel="noreferrer"
            >
              <img src="/images/icons/tiktok.svg" alt="TikTok" />
            </a>
            <a
              href="https://www.reddit.com/user/sysifuscorp"
              target="_blank"
              rel="noreferrer"
            >
              <img src="/images/icons/reddit.svg" alt="Reddit" />
            </a>
            <a
              href="https://discord.com/invite/nv89cRgEsS"
              target="_blank"
              rel="noreferrer"
            >
              <img src="/images/icons/discord.svg" alt="Discord" />
            </a>
            <a
              href="https://twitter.com/sysifuscorp"
              target="_blank"
              rel="noreferrer"
            >
              <img src="/images/icons/twitter.svg" alt="Twitter" />
            </a>
            <a
              href="https://www.facebook.com/sysifuscorp"
              target="_blank"
              rel="noreferrer"
            >
              <img src="/images/icons/facebook.svg" alt="Facebook" />
            </a>
          </div>
        </div>
      </div>

      <div className="aboutMeWrapper">
        <div className="aboutMeVerticalWrapper">
          <img
            src="/images/wonmin.webp"
            alt="Wonmin, the game designer"
            className="wonminImage"
          />
        </div>
        <div className="aboutMeVerticalWrapper">
          <h2>
            Hello👋My name is Wonmin.
            <br />I am the game designer.
          </h2>
          <p>
            I quit my cushy corporate job in 2016 to pursue my dreams of
            becoming a game developer. And in March of 2021, that dream became a
            reality when my first game,{" "}
            <a href="https://sysifuscorp.com" target="_blank" rel="noreferrer">
              Welcome to Sysifus Corp
            </a>
            , was successfully funded on Kickstarter.
          </p>
          <p>
            I had no idea what I was doing when I quit my job. Even now, I'm
            still terrified for my future. But it is thanks to the support of
            fans like you that I am able to do what I love. And for that, I am
            truly thankful.
          </p>
          <p>
            Thanks for visiting my humble page and please consider{" "}
            <a
              href="https://buy.stripe.com/bIYg0Q1e08Z86Fa8wy"
              target="_blank"
              rel="noreferrer"
            >
              buying the game!
            </a>
          </p>
        </div>
      </div>
      <div className="madeby">
        <p>
          Love, Career & Magic is made by{" "}
          <a href="https://unicornwithwings.com">Pegasus Games</a> and is not
          affiliated with any existing reality TV show.
          <br />
          <sup>
            <i>(although I would love to be😏)</i>
          </sup>
        </p>
      </div>
    </div>
  );
};

export default ContactPage;
