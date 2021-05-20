import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';

import '../../css/photos.css';

//all photo details
const photoDetails = [
  {
    image_link:"/images/boxes/main box front.png",
    image_alt:"Main box front view"
  },
  {
    image_link:"/images/boxes/main box back.png",
    image_alt:"Main box back view"
  },
  {
    image_link:"/images/boxes/shonan.png",
    image_alt:"SHONAN Expansion box"
  },
  {
    image_link:"/images/boxes/tokyo city.png",
    image_alt:"TOKYO CITY Expansion box"
  },
  {
    image_link:"/images/boxes/hawaii.png",
    image_alt:"HAWAII Expansion box"
  },
  {
    image_link:"/images/boxes/karuizawa.png",
    image_alt:"KARUIZAWA Expansion box"
  },
  {
    image_link:"/images/boxes/tokyo 2020.png",
    image_alt:"TOKYO 2020 Expansion box"
  }
]

//a single photo with caption
const PhotoWithCaption = (props) => {
  return (
    <div className="photoWrapper">
      <img className="boxes" src={props.image_link} alt={props.image_alt}></img>
      <p className="caption">{props.image_alt}</p>
    </div>
  )
}

const PhotosPage = (props) => {

  useEffect(() => {
    document.title = "SHAREHOME - Photos";
  });

  const allPhotos = photoDetails.map((elem, index)=>{
    return (
      <PhotoWithCaption
        image_link={elem.image_link}
        image_alt={elem.image_alt}
      />
    )
  });

  return (
    <div className="content max-width">
      <NavLink to="/"><div className="title noselect"></div></NavLink>
      <div className="subcontentWrapper border-bottom">
        <h2 className="subtitle">Photos</h2>
        <p>Here are some photos of the game!</p>
      </div>
      <div className="photoContent">
        { allPhotos }
      </div>
    </div>
  )
}

export default PhotosPage;
