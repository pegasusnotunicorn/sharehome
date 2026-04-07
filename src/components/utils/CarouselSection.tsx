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
  continuousAutoplay?: boolean;
  autoplaySpeed?: number;
  showNavigation?: boolean;
  mediaAspectRatio?: string;
  imageFit?: "contain" | "cover";
  autoplayEnabled?: boolean;
}

//return a single slide
const getPictureSlide = (
  index: number,
  directory: string,
  filename: string,
  href?: string,
  mediaAspectRatio?: string,
  imageFit: "contain" | "cover" = "contain"
) => {
  const frameStyle = mediaAspectRatio ? { aspectRatio: mediaAspectRatio } : undefined;
  const imageStyle = mediaAspectRatio
    ? { objectFit: imageFit, width: "100%", height: "100%" }
    : undefined;
  const containerClassName = [
    "noselect",
    styles.carouselImageContainer,
    mediaAspectRatio ? styles.fixedAspectContainer : "",
  ]
    .filter(Boolean)
    .join(" ");
  const frameClassName = [
    styles.carouselMediaFrame,
    mediaAspectRatio ? styles.fixedAspectFrame : "",
  ]
    .filter(Boolean)
    .join(" ");
  const imageClassName = [
    "noselect",
    styles.carouselImage,
    href ? "has-link" : "",
    mediaAspectRatio ? styles.fixedAspectImage : "",
  ]
    .filter(Boolean)
    .join(" ");
  const imageContent = (
    <div className={frameClassName} style={frameStyle}>
      <img
        loading="lazy"
        alt={`Carousel ${filename} ${index}`}
        className={imageClassName}
        style={imageStyle}
        src={`${directory}/${filename}.webp`}
      />
    </div>
  );

  return (
    <SwiperSlide key={`carouselImage${index}`}>
      {href ? (
        <a
          aria-label={`Open testimonial video ${index + 1} in a new tab`}
          rel="noreferrer"
          target="_blank"
          className={containerClassName}
          href={href}
        >
          {imageContent}
          <DefaultButton
            variant="primary"
            color="white"
            compact
            className={styles.buttonForLink}
            text="Watch video"
            icon="watch"
          />
        </a>
      ) : (
        <div className={containerClassName}>
          {imageContent}
        </div>
      )}
    </SwiperSlide>
  );
};

//make the swiper slides with the cards in them
export const CarouselSection = (props: CarouselSectionProps) => {
  const { width } = useWindowDimensions();

  const cardsPerView =
    width >= 1900 ? 5.25 : width >= 1600 ? 4.25 : width >= 1200 ? 3.25 : width >= 800 ? 2.25 : 1.5;
  const directory = props.directory;
  const filename = props.filename;
  const href = props.href;

  const specificFiles = props.specificFiles;
  const isContinuousAutoplay = props.continuousAutoplay ?? false;
  const showNavigation = props.showNavigation ?? true;
  const mediaAspectRatio = props.mediaAspectRatio;
  const imageFit = props.imageFit ?? "contain";
  const autoplayEnabled = props.autoplayEnabled ?? true;

  const swiperProps = {
    modules: [Navigation, Pagination, A11y, Autoplay],
    navigation: showNavigation,
    loop: props.loop ?? false,
    spaceBetween: 50,
    slidesPerView: cardsPerView,
    speed: isContinuousAutoplay ? props.autoplaySpeed ?? 4500 : 600,
    autoplay: autoplayEnabled
      ? {
          delay: isContinuousAutoplay ? 0 : props.delay ?? 2000,
          pauseOnMouseEnter: false,
          disableOnInteraction: false,
        }
      : false,
  };

  //get all photos
  const allPictures: React.ReactNode[] = [];
  if (!specificFiles) {
    const totalPictures = props.totalPictures ?? 0;
    for (let x = 1; x <= totalPictures; x++) {
      allPictures.push(
        getPictureSlide(
          x,
          directory,
          `${filename}${x}`,
          href,
          mediaAspectRatio,
          imageFit
        )
      );
    }
  } else {
    for (let x = 0; x < specificFiles.length; x++) {
      allPictures.push(
        getPictureSlide(
          x,
          directory,
          specificFiles[x].filename,
          specificFiles[x].href,
          mediaAspectRatio,
          imageFit
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
      className={`${styles.carouselSection} ${
        isContinuousAutoplay ? styles.continuousAutoplay : ""
      } ${props.className}`}
    >
      <Swiper {...swiperProps}>{allPictures}</Swiper>
    </GsapFadeScrub>
  );
};

export default CarouselSection;
