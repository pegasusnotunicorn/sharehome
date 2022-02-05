import React from 'react';

//import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Navigation, Pagination, A11y, Autoplay} from "swiper";

//import Swiper styles
import 'swiper/swiper.min.css'
import 'swiper/swiper-bundle.css';
// import 'swiper/components/navigation/navigation.min.css'
// import 'swiper/components/pagination/pagination.min.css'

//custom files
import '../../css/utils/swiper.css'
import Card from '../Card/Card.js';
import { getAllFinishedPeople } from '../Characters/Characters.js';
import useWindowDimensions from '../utils/useWindowDimensions.js';

// configure Swiper to use modules
SwiperCore.use([Navigation, Pagination, A11y, Autoplay]);

//get swiperslides filled with character cards for all characters
const getAllCharacterCards = (windowHeight, windowWidth) => {

  //to determine how big the cards will be based on window width
  let cardDividerByScreenWidth = (windowWidth >= 1400) ? 3.2 : (windowWidth >= 900) ? 2.2 : 1.2;

  //max card width / size
  let cardWidth = Math.min(Math.floor(windowWidth / cardDividerByScreenWidth), 600);
  let cardHeight = cardWidth / 1.7;
  let fontSize = (windowWidth >= 1400) ? 9 : (windowWidth >= 900) ? 7 : 5;

  return getAllFinishedPeople().map((curr, index, array)=>{
    let props = {
      personName: curr.name,
      showFront: true,
      disableFlip: true,
      type: "member",
      mainStyle:{
        //stuff needed for card size
        width:`${cardWidth}px`,
        height:`${cardHeight}px`,
        fontSize:`${fontSize}px`,
        //other shit
        cursor:"pointer",
      },
      className: (index%2 === 0) ? "floating" : "floating-counter",
    }

    let idkey = `swiperCard${index}`;
    return (
      <SwiperSlide id={idkey} key={idkey}>
        <Card {...props}/>
      </SwiperSlide>
    );
  });
}

//make the swiper slides with the cards in them
export const SwiperCharacters = (props) => {
  const { height, width} = useWindowDimensions();

  let cardsPerView = (width >= 1400) ? 3 : (width >= 900) ? 2 : 1;

  let allCharacterCards = getAllCharacterCards(height, width);
  let swiperProps = {
    modules:[Navigation, Pagination, A11y, Autoplay],
    navigation: true,
    loop:true,
    spaceBetween:0,
    slidesPerView:cardsPerView,
    pagination:{
      type: 'bullets',
      clickable: true,
    },
    autoplay: {
      delay: 3000,
      pauseOnMouseEnter: true,
      disableOnInteraction: false,
    },
    onSlideChange:() => {},
    onSwiper:(swiper) => {},
  }

  return (
    <Swiper {...swiperProps} >
      {allCharacterCards}
    </Swiper>
  );
}
