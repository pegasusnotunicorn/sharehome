import { useState, useEffect } from "react";
import { NavLink } from "react-router";

const CookieConsent = ({ scrollThreshold = 10, timeDelay = 5000 }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const isLandingPage =
    window.location.pathname === "/" || window.location.pathname === "/ttrpg";

  useEffect(() => {
    const cookieConsent = localStorage.getItem("cookieConsent");
    if (cookieConsent) return;

    const timer = setTimeout(() => setTimerExpired(true), timeDelay);

    const handleScroll = () => {
      const scrolledPercentage =
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
        100;
      if (scrolledPercentage >= scrollThreshold) {
        setHasScrolled(true);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrollThreshold, timeDelay]);

  useEffect(() => {
    // Show the popup if the timer has expired and the user has scrolled on the landing page, or if it's not the landing page
    if (timerExpired && ((isLandingPage && hasScrolled) || !isLandingPage)) {
      setShowPopup(true);
    }
  }, [isLandingPage, timerExpired, hasScrolled]);

  const handleConsent = (granted) => {
    localStorage.setItem("cookieConsent", granted ? "granted" : "denied");

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "consent_update",
      ad_storage: granted ? "granted" : "denied",
      analytics_storage: granted ? "granted" : "denied",
      ad_user_data: granted ? "granted" : "denied",
      ad_personalization: granted ? "granted" : "denied",
    });

    if (window.gtag) {
      gtag("consent", "update", {
        ad_storage: granted ? "granted" : "denied",
        analytics_storage: granted ? "granted" : "denied",
        ad_user_data: granted ? "granted" : "denied",
        ad_personalization: granted ? "granted" : "denied",
      });
    }

    setShowPopup(false);
  };

  if (!showPopup) return null;

  return (
    <div className="cookie-popup">
      <div className="cookie-content">
        {showDetails ? (
          <div className="details">
            <p>
              Big game studios can throw millions at advertising—I can’t. I just
              want my game to be played by the people who will{" "}
              <strong>actually</strong> love it.
            </p>
            <p>
              To do that, I use cookies and data to help figure out where to
              find those players. I don't store or sell any of your personal
              data. I just use it to connect with the right audience.
            </p>
            <p>
              Learn more on my <NavLink to="/terms">privacy policy</NavLink>.
            </p>
            <div className="button-group justify-in-between">
              <button
                className="accept-btn"
                onClick={() => handleConsent(true)}
              >
                I consent
              </button>
              <button
                className="decline-btn"
                onClick={() => handleConsent(false)}
              >
                No thanks, I don't want to help you.
              </button>
            </div>
          </div>
        ) : (
          <div className="details">
            <p>
              I need a little help finding the right players for my game. Some
              simple data helps me do that 🙏
            </p>
            <div>
              <button
                className="details-btn"
                onClick={() => setShowDetails(!showDetails)}
              >
                Manage settings
              </button>
            </div>
            <div className="button-group">
              <button
                className="accept-btn"
                onClick={() => handleConsent(true)}
              >
                I consent
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .cookie-popup {
          z-index: 1000;
          position: fixed;
          bottom: 2em;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 1em;
          border-radius: 4px;
          max-width: 400px;
          text-align: left;
          box-shadow: 1px 1px 4px 0px #323232;
        }
        @media only screen and (max-width: 900px) {
          .cookie-popup {
            bottom: calc(2em + 40px);
            width: calc(100% - 4em);
            box-shadow: none;
          }
          .accept-btn {
            flex-grow: 1;
          }
          .decline-btn {
            width: 30%;
          }
        }
        .cookie-popup p {
          margin: 0;
          font-size: 0.8em;
        }
        .cookie-popup a {
          color: #fff;
        }
        .button-group {
          display: flex;
          justify-content: flex-start;
          gap: 10px;
          font-size: 0.75em;
        }
        .button-group.justify-in-between {
          justify-content: space-between;
        }
        button {
          padding: 8px 14px;
          border: none;
          cursor: pointer;
          border-radius: 5px;
        }
        .accept-btn {
          background: #4caf50;
          color: white;
          font-weight: bold;
          padding-left: 3em;
          padding-right: 3em;
          white-space: nowrap;
        }
        .details-btn {
          background: transparent;
          color: white;
          text-decoration: underline;
          font-size: 0.75em;
          padding: 0;
          margin: 0;
          white-space: nowrap;
        }
        .decline-btn {
          background: transparent;
          color: #fff;
          text-decoration: underline;
          font-size: 0.75em;
          padding: 0;
          margin: 0;
        }
        .details {
          text-align: left;
          display: flex;
          gap: 1em;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
};

export default CookieConsent;
