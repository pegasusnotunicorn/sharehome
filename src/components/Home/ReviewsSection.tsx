import { useEffect, useRef, useState } from "react";
import { GsapFadeScrub } from "../utils/useGsap";
import { trackEvent } from "../utils/trackEvent";
import ArrowChip from "../utils/ArrowChip";
import Icon from "../utils/Icons";
import { RATINGS, REVIEWS, type Review } from "./reviews";
import landingPageStyles from "../../css/landingPage.module.css";
import styles from "../../css/pages/home/reviews.module.css";

const follow = (href: string) => () => trackEvent("review_link", { to: href });

// What people are saying: the ratings, then the reviews in a row that scrolls sideways (swipe it, or
// page through it with the arrows, greyed out at either end)
export default function ReviewsSection() {
  const rowRef = useRef<HTMLUListElement>(null);
  const [ends, setEnds] = useState({ start: true, end: false });
  const measure = () => {
    const el = rowRef.current;
    if (el)
      setEnds({
        start: el.scrollLeft <= 4,
        end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
      });
  };
  useEffect(() => {
    measure();
    addEventListener("resize", measure);
    return () => removeEventListener("resize", measure);
  }, []);
  // a card's width (and the gap) at a time, so each stop lines up a card at the left
  const page = (dir: -1 | 1) => {
    const el = rowRef.current,
      card = el?.firstElementChild as HTMLElement | null;
    if (el && card)
      el.scrollBy({
        left:
          dir *
          (card.offsetWidth +
            parseFloat(getComputedStyle(el).columnGap || "0")),
        behavior: "smooth",
      });
  };

  return (
    <GsapFadeScrub
      fadeIn
      className={`${landingPageStyles.mainpageContainer} ${styles.section}`}
    >
      <div className={styles.heading}>
        <p className={landingPageStyles.stepEyebrow}>Reviews</p>
        <h2 className={styles.title}>What people are saying</h2>
        <ul className={styles.ratings}>
          {RATINGS.map((r) => (
            <li key={r.href}>
              <a
                className={`${styles.rating} tap-area`}
                href={r.href}
                target="_blank"
                rel="noreferrer"
                onClick={follow(r.href)}
              >
                <span className={styles.ratingScore}>{r.score}</span>{" "}
                <span className={styles.on}>on </span>
                {r.where}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <ul
        ref={rowRef}
        className={styles.row}
        aria-label="Reviews"
        onScroll={measure}
      >
        {REVIEWS.map((r) => (
          <ReviewCard key={r.quote} review={r} />
        ))}
      </ul>
      <div className={styles.arrows}>
        <ArrowChip
          dir={-1}
          label="Earlier reviews"
          disabled={ends.start}
          onClick={() => page(-1)}
        />
        <ArrowChip
          dir={1}
          label="More reviews"
          disabled={ends.end}
          onClick={() => page(1)}
        />
      </div>
    </GsapFadeScrub>
  );
}

const ReviewCard = ({ review: r }: { review: Review }) => (
  <li className={`${styles.card}${r.press ? ` ${styles.press}` : ""}`}>
    <figure className={styles.figure}>
      <blockquote className={styles.quote}>
        <p>“{r.quote}”</p>
      </blockquote>
      <figcaption className={styles.credit}>
        <span className={styles.by}>{r.by}</span>
        {r.score && <span className={styles.score}>{r.score}</span>}
      </figcaption>
    </figure>
    {r.href && (
      <a
        className={`${styles.link} tap-area`}
        href={r.href}
        target="_blank"
        rel="noreferrer"
        onClick={follow(r.href)}
      >
        {r.linkText}
        <Icon name="forward" className={styles.linkIcon} strokeWidth={2.4} />
      </a>
    )}
  </li>
);
