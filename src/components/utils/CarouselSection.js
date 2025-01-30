import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation, Pagination, A11y, Autoplay } from "swiper";
import { GsapFadeScrub } from "../utils/useGsap.js";
import "swiper/swiper.min.css";
import "swiper/swiper-bundle.css";
import "../../css/utils/swiper.css";
import useWindowDimensions from "../utils/useWindowDimensions.js";
import PropTypes from "prop-types";

// configure Swiper to use modules
SwiperCore.use([Navigation, Pagination, A11y, Autoplay]);

//return a single slide
const getPictureSlide = (index, directory, filename, href) => {
  return (
    <SwiperSlide key={`carouselImage${index}`}>
      <a
        rel="noreferrer"
        target="_blank"
        className="noselect"
        href={href ?? `${directory}/${filename}${index}.webp`}
      >
        <img
          loading="lazy"
          alt={`Photoshoot ${index}`}
          className="noselect carouselImage"
          src={`${directory}/${filename}${index}.webp`}
        />
      </a>
    </SwiperSlide>
  );
};

//make the swiper slides with the cards in them
export const CarouselSection = (props) => {
  const { width } = useWindowDimensions();

  let cardsPerView = width >= 1400 ? 4 : width >= 900 ? 2 : 1.25;
  let directory = props.directory;
  let filename = props.filename;
  let href = props.href;

  let swiperProps = {
    modules: [Navigation, Pagination, A11y, Autoplay],
    navigation: true,
    loop: false,
    spaceBetween: 25,
    slidesPerView: cardsPerView,
    pagination: {
      type: "bullets",
      clickable: true,
    },
    autoplay: {
      delay: 2000,
      pauseOnMouseEnter: false,
      disableOnInteraction: true,
    },
  };

  //get all photos in /images/photoshoot (total of 8)
  let totalPictures = props.totalPictures;
  let allPictures = [];
  for (let x = 1; x <= totalPictures; x++) {
    allPictures.push(getPictureSlide(x, directory, filename, href));
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
};

export default CarouselSection;
