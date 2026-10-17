import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperApi } from "swiper";
import { A11y, Keyboard } from "swiper/modules";
import "swiper/css";
import ArrowChip from "./ArrowChip";
import Modal from "./Modal";
import styles from "../../css/utils/imageCarousel.module.css";

interface ImageCarouselModalProps {
  images: { src: string; alt: string }[];
  ariaLabel: string;
  onClose: () => void;
  panelClassName?: string; // the dialog's own look, in place of the default
  aspectRatio?: string; // of the frame each picture's fitted into (default 4 / 3)
  children?: ReactNode; // under the pictures, between Prev and Next: what they are
}

// A swipeable set of pictures in a dialog: under them, Prev and Next (the site's arrow chips) either side
// of which one it is. Load it lazily (React.lazy): the carousel library only comes down when someone
// opens one.
const ImageCarouselModal = ({ images, ariaLabel, onClose, panelClassName, aspectRatio, children }: ImageCarouselModalProps) => {
  const swiper = useRef<SwiperApi | null>(null);
  const [at, setAt] = useState(0);
  const many = images.length > 1;

  return (
    <Modal onClose={onClose} ariaLabel={ariaLabel} panelClassName={panelClassName ?? styles.panel}>
      <Swiper
        modules={[A11y, Keyboard]}
        keyboard={{ enabled: true }}
        spaceBetween={0}
        slidesPerView={1}
        className={styles.swiper}
        onSwiper={(s) => (swiper.current = s)}
        onSlideChange={(s) => setAt(s.activeIndex)}
      >
        {images.map((img, i) => (
          <SwiperSlide key={i}>
            <div className={styles.slide} style={aspectRatio ? { aspectRatio } : undefined}>
              <img src={img.src} alt={img.alt} className={styles.image} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      {(many || children) && (
        <div className={styles.bar}>
          {many && <ArrowChip dir={-1} label="Previous picture" disabled={at === 0} onClick={() => swiper.current?.slidePrev()} />}
          <div className={styles.caption}>
            {children}
            {many && (
              <p className={styles.count} aria-live="polite">
                {at + 1} of {images.length}
              </p>
            )}
          </div>
          {many && <ArrowChip dir={1} label="Next picture" disabled={at === images.length - 1} onClick={() => swiper.current?.slideNext()} />}
        </div>
      )}
    </Modal>
  );
};

export default ImageCarouselModal;
