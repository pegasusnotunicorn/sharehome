import { useState } from "react";
import type { ReactNode } from "react";
import styles from "../../css/utils/videoPoster.module.css";

// A YouTube video as a picture with a play button: the player (YouTube's no-cookie one) loads only when
// it's clicked, and plays straight away. It fills its parent (give that the video's shape). `playing`
// and `onPlay` let the page keep track of it; `children` is shown over the picture.
interface VideoPosterProps {
  id: string; // the YouTube video's id
  start?: number; // where to start, in seconds
  title: string; // the player's title
  label: string; // what the play button says to screen readers
  poster: string;
  posterWidth: number;
  posterHeight: number;
  posterClassName?: string;
  playing?: boolean;
  onPlay?: () => void;
  children?: ReactNode;
}

export default function VideoPoster({ id, start, title, label, poster, posterWidth, posterHeight, posterClassName, playing, onPlay, children }: VideoPosterProps) {
  const [clicked, setClicked] = useState(false);
  if (playing ?? clicked)
    return (
      <iframe
        key={id}
        className={styles.video}
        src={`https://www.youtube-nocookie.com/embed/${id}?${start ? `start=${start}&` : ""}autoplay=1&rel=0&modestbranding=1&playsinline=1`}
        title={title}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
    );
  return (
    <button
      type="button"
      className={styles.poster}
      onClick={() => {
        setClicked(true);
        onPlay?.();
      }}
      aria-label={label}
    >
      <img className={`${styles.picture} ${posterClassName ?? ""}`.trim()} src={poster} alt="" loading="lazy" width={posterWidth} height={posterHeight} />
      <span className={styles.shade} aria-hidden="true" />
      <span className={styles.play} aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M8 5.5v13l11-6.5z" />
        </svg>
      </span>
      {children}
    </button>
  );
}
