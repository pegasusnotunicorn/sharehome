import { GsapFadeScrub } from "../utils/useGsap";
import { trackEvent } from "../utils/trackEvent";
import { PLAYERS, PRESS, RATINGS, type Review } from "./reviews";
import landingPageStyles from "../../css/landingPage.module.css";
import styles from "../../css/pages/home/reviews.module.css";

// "as of Oct 20, 2026"
const asOf = (day: string) =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

// What people are saying: the ratings, then the press, then players, each in their own words
export default function ReviewsSection() {
  return (
    <GsapFadeScrub
      fadeIn
      className={`${landingPageStyles.mainpageContainer} ${styles.section}`}
    >
      <div className={styles.heading}>
        <p className={landingPageStyles.stepEyebrow}>Reviews</p>
        <h2 className={styles.title}>What people are saying</h2>
      </div>

      <ul className={styles.ratings}>
        {RATINGS.map((r) => (
          <li key={r.href}>
            <a
              className={styles.rating}
              href={r.href}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent("review_link", { to: r.href })}
            >
              <span className={styles.ratingLabel}>{r.label}</span>
              <span className={styles.asOf}>as of {asOf(r.asOf)}</span>
            </a>
          </li>
        ))}
      </ul>

      <ul className={`${styles.cards} ${styles.press}`}>
        {PRESS.map((r) => (
          <ReviewCard key={r.by} review={r} big />
        ))}
      </ul>

      <ul className={`${styles.cards} ${styles.players}`}>
        {PLAYERS.map((r) => (
          <ReviewCard key={r.quote} review={r} />
        ))}
      </ul>
    </GsapFadeScrub>
  );
}

const ReviewCard = ({ review: r, big }: { review: Review; big?: boolean }) => {
  const href = r.href;
  return (
    <li className={`${styles.card}${big ? ` ${styles.big}` : ""}`}>
      <figure className={styles.figure}>
        <blockquote className={styles.quote}>
          <p>“{r.quote}”</p>
        </blockquote>
        <figcaption className={styles.credit}>
          <span className={styles.by}>{r.by}</span>
          {r.score && <span className={styles.score}>{r.score}</span>}
        </figcaption>
      </figure>
      {href && (
        <a
          className={`${styles.link} tap-area`}
          href={href}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackEvent("review_link", { to: href })}
        >
          {r.linkText}
        </a>
      )}
    </li>
  );
};
