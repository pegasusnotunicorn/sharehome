import { type ReactNode, useEffect, useState } from "react";
import styles from "../../css/utils/polaroidGallery.module.css";

export interface PolaroidGalleryItem {
  src: string;
  alt: string;
  caption?: ReactNode;
  date?: string;
  hideOnMobile?: boolean;
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const formatDate = (iso?: string) => {
  if (!iso) return undefined;
  const parsed = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return iso;
  return dateFormatter.format(parsed);
};

interface PolaroidGalleryProps {
  items: PolaroidGalleryItem[];
  className?: string;
  showConnector?: boolean;
}

const rotationClasses = [
  styles.rotateNeg3,
  styles.rotatePos2,
  styles.rotateNeg1,
  styles.rotatePos3,
];

const PolaroidGallery = ({
  items,
  className,
  showConnector = true,
}: PolaroidGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const connectorClass = showConnector ? styles.withConnector : "";
  const activeItem = activeIndex !== null ? items[activeIndex] : null;

  useEffect(() => {
    if (activeIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveIndex(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex]);

  return (
    <>
      <div className={`${styles.polaroidGrid} ${connectorClass} ${className ?? ""}`.trim()}>
        {items.map((item, index) => (
          <button
            key={`${item.src}-${index}`}
            type="button"
            className={`${styles.polaroidCard} ${rotationClasses[index % rotationClasses.length]} ${
              item.hideOnMobile ? styles.hideOnMobile : ""
            }`}
            onClick={() => setActiveIndex(index)}
            aria-label={`Open ${item.alt}`}
          >
            <img
              src={item.src}
              alt={item.alt}
              className={styles.polaroidPhoto}
            />
            {(item.caption || item.date) && (
              <div className={styles.polaroidCaptionWrapper}>
                {item.caption && (
                  <p className={styles.polaroidCaption}>{item.caption}</p>
                )}
                {item.date && (
                  <p className={styles.polaroidDate}>{formatDate(item.date)}</p>
                )}
              </div>
            )}
          </button>
        ))}
      </div>

      {activeItem && (
        <div
          className={styles.lightbox}
          onClick={() => setActiveIndex(null)}
          role="presentation"
        >
          <div
            className={styles.lightboxCard}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={activeItem.alt}
          >
            <img
              src="/images/icons/cross.svg"
              alt="Close"
              className={styles.lightboxClose}
              onClick={() => setActiveIndex(null)}
            />
            <img
              src={activeItem.src}
              alt={activeItem.alt}
              className={styles.lightboxPhoto}
            />
            {(activeItem.caption || activeItem.date) && (
              <div className={styles.lightboxCaptionWrapper}>
                {activeItem.caption && (
                  <p className={styles.lightboxCaption}>{activeItem.caption}</p>
                )}
                {activeItem.date && (
                  <p className={styles.lightboxDate}>{formatDate(activeItem.date)}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PolaroidGallery;
