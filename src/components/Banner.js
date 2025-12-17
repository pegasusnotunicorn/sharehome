import "./Banner.css";

const link =
  "https://pegasusgames.medium.com/an-update-on-international-shipments-to-outside-the-usa-4e53a216ceb8";
const text = "📦 An update on international shipments";

const Banner = () => {
  return (
    <div className="top-banner is-blue">
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="top-banner-link"
      >
        <span className="top-banner-text">{text}</span>
        <span className="top-banner-arrow">→</span>
      </a>
    </div>
  );
};

export default Banner;
