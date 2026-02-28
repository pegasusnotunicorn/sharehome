import "./Banner.css";

const link =
  "https://pegasusgames.medium.com/an-expansion-is-officially-in-development-ec1b89f34cd5";
const text = "🥳 An expansion is officially in development!";

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
