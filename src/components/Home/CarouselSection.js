import React from 'react';

//import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Navigation, Pagination, A11y, Autoplay} from "swiper";
import { GsapFadeScrub } from "../utils/useGsap.js";

//import Swiper styles
import 'swiper/swiper.min.css'
import 'swiper/swiper-bundle.css';
// import 'swiper/components/navigation/navigation.min.css'
// import 'swiper/components/pagination/pagination.min.css'

//custom files
import '../../css/utils/swiper.css'
import useWindowDimensions from '../utils/useWindowDimensions.js';

// configure Swiper to use modules
SwiperCore.use([Navigation, Pagination, A11y, Autoplay]);

//return a single slide
const getPictureSlide = (index) => {
  return (
    <SwiperSlide key={`carouselImage${index}`}>
      <a rel="noreferrer" target="_blank" href={`/images/photoshoot/pictures${index}.jpg`}>
        <img alt={`Photoshoot ${index}`} className="carouselImage" src={`/images/photoshoot/pictures${index}.jpg`} />
      </a>
    </SwiperSlide>
  )
}

//make the swiper slides with the cards in them
export const CarouselSection = (props) => {
  const { width} = useWindowDimensions();

  let cardsPerView = (width >= 1400) ? 3 : (width >= 900) ? 2 : 1;

  let swiperProps = {
    modules:[Navigation, Pagination, A11y, Autoplay],
    navigation: true,
    loop:false,
    spaceBetween:50,
    slidesPerView:cardsPerView,
    pagination:{
      type: 'bullets',
      clickable: true,
    },
    // autoplay: {
    //   delay: 3000,
    //   pauseOnMouseEnter: true,
    //   disableOnInteraction: false,
    // },
    onSlideChange:() => {},
    onSwiper:(swiper) => {},
  }

  //get all photos in /images/photoshoot (total of 8)
  let totalPictures = 8;
  let allPictures = [];
  for (let x = 1; x <= totalPictures; x++){
    allPictures.push(getPictureSlide(x));
  }

  return (
    <GsapFadeScrub fadeIn scrub >
      <div className="carouselSection">
        <Swiper {...swiperProps} >
          { allPictures }
        </Swiper>
      </div>
    </GsapFadeScrub>
  );
}

export default CarouselSection
