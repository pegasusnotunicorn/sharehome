import styles from "./Banner.module.css";

const link =
  "https://pegasusgames.medium.com/an-expansion-is-officially-in-development-ec1b89f34cd5";
const text = "🥳 An expansion is officially in development!";

const Banner = () => {
  const items = Array.from({ length: 6 });

  return (
    <div className={`${styles["top-banner"]} ${styles["is-blue"]}`}>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={styles["top-banner-marquee-link"]}
      >
        <div className={styles["top-banner-marquee"]}>
          <div className={styles["top-banner-track"]}>
            {[0, 1].map((group) => (
              <div key={group} className={styles["top-banner-group"]}>
                {items.map((_, index) => (
                  <span
                    key={`${group}-${index}`}
                    className={styles["top-banner-link"]}
                  >
                    <span className={styles["top-banner-text"]}>{text}</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </a>
    </div>
  );
};

export default Banner;
