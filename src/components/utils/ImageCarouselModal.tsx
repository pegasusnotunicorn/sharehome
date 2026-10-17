import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Modal from "./Modal";
import styles from "../../css/utils/imageCarousel.module.css";

interface ImageCarouselModalProps {
  images: { src: string; alt: string }[];
  ariaLabel: string;
  onClose: () => void;
}

// A swipeable set of pictures in a dialog. Load it lazily (React.lazy): the carousel library only
// comes down when someone opens one.
const ImageCarouselModal = ({ images, ariaLabel, onClose }: ImageCarouselModalProps) => (
  <Modal onClose={onClose} ariaLabel={ariaLabel} panelClassName={styles.panel}>
    <Swiper
      modules={[Navigation, Pagination, A11y, Keyboard]}
      navigation
      pagination={{ clickable: true }}
      keyboard={{ enabled: true }}
      spaceBetween={0}
      slidesPerView={1}
      className={styles.swiper}
    >
      {images.map((img, i) => (
        <SwiperSlide key={i}>
          <div className={styles.slide}>
            <img src={img.src} alt={img.alt} className={styles.image} />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  </Modal>
);

export default ImageCarouselModal;
