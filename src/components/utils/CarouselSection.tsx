import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import "swiper/css/a11y";
import { GsapFadeScrub } from "../utils/useGsap";
import useWindowDimensions from "../utils/useWindowDimensions";
import DefaultButton from "./DefaultButton";
import styles from "../../css/utils/swiper.module.css";

interface SpecificFile {
  filename: string;
  href?: string;
}

interface CarouselSectionProps {
  directory: string;
  filename: string;
  totalPictures?: number;
  random?: boolean;
  href?: string;
  className?: string;
  specificFiles?: SpecificFile[];
  loop?: boolean;
  delay?: number;
}

//return a single slide
const getPictureSlide = (index: number, directory: string, filename: string, href?: string) => {
  const imageContent = (
    <>
      <img
        loading="lazy"
        alt={`Carousel ${filename} ${index}`}
        className={`noselect ${styles.carouselImage} ${href ? "has-link" : ""}`}
        src={`${directory}/${filename}.webp`}
      />
      {href && (
        <DefaultButton
          variant="primary"
          color="white"
          compact
          className={styles.buttonForLink}
          text="Watch video"
          icon="watch"
        />
      )}
    </>
  );

  return (
    <SwiperSlide key={`carouselImage${index}`}>
      {href ? (
        <a
          aria-label={`Photoshoot ${index}`}
          rel="noreferrer"
          target="_blank"
          className={`noselect ${styles.carouselImageContainer}`}
          href={href}
        >
          {imageContent}
        </a>
      ) : (
        <div className={`noselect ${styles.carouselImageContainer}`}>
          {imageContent}
        </div>
      )}
    </SwiperSlide>
  );
};

//make the swiper slides with the cards in them
export const CarouselSection = (props: CarouselSectionProps) => {
  const { width } = useWindowDimensions();

  const cardsPerView = width >= 1400 ? 4 : width >= 900 ? 2 : 1.25;
  const directory = props.directory;
  const filename = props.filename;
  const href = props.href;

  const specificFiles = props.specificFiles;

  const swiperProps = {
    modules: [Navigation, Pagination, A11y, Autoplay],
    navigation: true,
    loop: props.loop ?? false,
    spaceBetween: 25,
    slidesPerView: cardsPerView,
    pagination: {
      type: "bullets" as const,
      clickable: true,
    },
    autoplay: {
      delay: props.delay ?? 2000,
      pauseOnMouseEnter: false,
      disableOnInteraction: true,
    },
  };

  //get all photos
  const allPictures: React.ReactNode[] = [];
  if (!specificFiles) {
    const totalPictures = props.totalPictures ?? 0;
    for (let x = 1; x <= totalPictures; x++) {
      allPictures.push(getPictureSlide(x, directory, `${filename}${x}`, href));
    }
  } else {
    for (let x = 0; x < specificFiles.length; x++) {
      allPictures.push(
        getPictureSlide(
          x,
          directory,
          specificFiles[x].filename,
          specificFiles[x].href
        )
      );
    }
  }

  //randomize array
  if (props.random) {
    allPictures.sort(() => 0.5 - Math.random());
  }

  return (
    <GsapFadeScrub
      fadeIn
      scrub
      className={`${styles.carouselSection} ${props.className}`}
    >
      <Swiper {...swiperProps}>{allPictures}</Swiper>
    </GsapFadeScrub>
  );
};

export default CarouselSection;
