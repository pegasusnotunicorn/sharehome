import "./Banner.css";

const link =
  "https://pegasusgames.medium.com/i-cannot-believe-it-but-love-career-magic-is-sold-out-e986b8f5747a";
const text = "😱 Love, Career & Magic is completely SOLD OUT!";

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
