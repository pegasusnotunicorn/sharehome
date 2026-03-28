import styles from "./Banner.module.css";

const link =
  "https://pegasusgames.medium.com/an-expansion-is-officially-in-development-ec1b89f34cd5";
const text = "🥳 An expansion is officially in development!";

const Banner = () => {
  return (
    <div className={`${styles["top-banner"]} ${styles["is-blue"]}`}>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={styles["top-banner-link"]}
      >
        <span className={styles["top-banner-text"]}>{text}</span>
        <span className={styles["top-banner-arrow"]}>→</span>
      </a>
    </div>
  );
};

export default Banner;
