import { type ReactNode, useState } from "react";
import styles from "../../css/utils/polaroidGallery.module.css";
import Modal from "./Modal";
import modalStyles from "../../css/utils/modal.module.css";

// The polaroids as a flat grid that opens one large: what PolaroidJourney shows where its 3D ring
// can't be drawn

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

export const formatDate = (iso?: string) => {
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

      {activeItem && <PolaroidLightbox item={activeItem} onClose={() => setActiveIndex(null)} />}
    </>
  );
};

// A polaroid opened large: the site's dialog, the photo, its caption and date
export const PolaroidLightbox = ({ item, onClose }: { item: { src: string; alt: string; caption?: ReactNode; date?: string }; onClose: () => void }) => (
  <Modal onClose={onClose} panelClassName={`${modalStyles.panel} ${styles.lightboxPanel}`} ariaLabel={item.alt}>
    <img src={item.src} alt={item.alt} className={styles.lightboxPhoto} />
    {(item.caption || item.date) && (
      <div className={styles.lightboxCaptionWrapper}>
        {item.caption && <p className={styles.lightboxCaption}>{item.caption}</p>}
        {item.date && <p className={styles.lightboxDate}>{formatDate(item.date)}</p>}
      </div>
    )}
  </Modal>
);

export default PolaroidGallery;
