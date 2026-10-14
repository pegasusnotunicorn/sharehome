import type { CSSProperties, ReactNode } from "react";
import { GsapWiggle } from "../../utils/useGsap";
import styles from "../../../css/pages/home/stepText.module.css";

// Where a doodle sits around a step's words: above them (at their start or end), below them, or
// beside them (start is the left, end the right)
export type DoodleSpot = "aboveStart" | "aboveEnd" | "belowStart" | "belowEnd" | "besideStart" | "besideEnd";

export interface Doodle {
  src: string;
  alt: string;
  at: DoodleSpot;
  along?: number; // above or below: how far along the words from that corner (0 at it, 1 at the other)
}

// A "How to play" step's words with their hand-drawn doodles. The doodles are placed by the words'
// own box, so they keep the same spots around the words at any screen size (put them on the side
// away from the step's cards); on phones they line up in a row above the words instead.
const StepText = ({ doodles, className, children }: { doodles: Doodle[]; className?: string; children: ReactNode }) => (
  <div
    className={[
      styles.stepText,
      doodles.some((d) => d.at === "besideStart") && styles.roomStart,
      doodles.some((d) => d.at === "besideEnd") && styles.roomEnd,
      className,
    ]
      .filter(Boolean)
      .join(" ")}
  >
    <div className={styles.doodles}>
      {doodles.map((d) => (
        <GsapWiggle
          key={d.src}
          className={`${styles.doodle} ${styles[d.at]}`}
          style={d.along ? ({ "--along": d.along } as CSSProperties) : undefined}
        >
          <img loading="lazy" src={d.src} alt={d.alt} />
        </GsapWiggle>
      ))}
    </div>
    {children}
  </div>
);

export default StepText;
