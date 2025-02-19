import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation, Pagination, A11y, Autoplay } from "swiper";
import { GsapFadeScrub } from "../utils/useGsap.js";
import "swiper/swiper.min.css";
import "swiper/swiper-bundle.css";
import "../../css/utils/swiper.css";
import useWindowDimensions from "../utils/useWindowDimensions.js";
import PropTypes from "prop-types";
import DefaultButton from "./DefaultButton.js";

// configure Swiper to use modules
SwiperCore.use([Navigation, Pagination, A11y, Autoplay]);

//return a single slide
const getPictureSlide = (index, directory, filename, href) => {
  return (
    <SwiperSlide key={`carouselImage${index}`}>
      <a
        aria-label={`Photoshoot ${index}`}
        rel="noreferrer"
        target="_blank"
        className="noselect carouselImageContainer"
        href={href ?? `${directory}/${filename}.webp`}
      >
        <img
          loading="lazy"
          alt={`Carousel ${filename} ${index}`}
          className={`noselect carouselImage ${href ? "has-link" : ""}`}
          src={`${directory}/${filename}.webp`}
        />
        {href && (
          <DefaultButton
            className="buttonForLink is-inverted is-outlined"
            text="Watch video"
            icon="watch"
          />
        )}
      </a>
    </SwiperSlide>
  );
};

//make the swiper slides with the cards in them
export const CarouselSection = (props) => {
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
      type: "bullets",
      clickable: true,
    },
    autoplay: {
      delay: props.delay ?? 2000,
      pauseOnMouseEnter: false,
      disableOnInteraction: true,
    },
  };

  //get all photos
  const allPictures = [];
  if (!specificFiles) {
    const totalPictures = props.totalPictures;
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
      className={`carouselSection ${props.className}`}
    >
      <Swiper {...swiperProps}>{allPictures}</Swiper>
    </GsapFadeScrub>
  );
};

// PropTypes
CarouselSection.propTypes = {
  directory: PropTypes.string.isRequired,
  filename: PropTypes.string.isRequired,
  totalPictures: PropTypes.number.isRequired,
  random: PropTypes.bool,
  href: PropTypes.string,
  className: PropTypes.string,
  specificFiles: PropTypes.arrayOf(PropTypes.object),
};

export default CarouselSection;
