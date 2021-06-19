import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import '../../css/photos.css';

//main photo details
const mainPhotosDetails = [
  {
    image_link:"/images/photos/main box/Main Box 3.png"
  },
  {
    image_link:"/images/photos/main box/Main Box + All Cards (Box Back).png"
  },
  {
    image_link:"/images/photos/main box/Main Box + All Cards (Card Fronts).png"
  }
]

//expansion photo details
const expansionPhotosDetails = [
  {
    image_link:"/images/photos/expansions/Expansion Boxes 1.png"
  },
  {
    image_link:"/images/photos/expansions/Expansion Boxes 2.png"
  }
]

//shonan photo details
const shonanPhotosDetails = [
  {
    image_link:"/images/photos/expansions/shonan1.png"
  },
  {
    image_link:"/images/photos/expansions/shonan3.png"
  },
  {
    image_link:"/images/photos/expansions/shonan5.png"
  }
]

//tokyocity photo details
const tokyocityPhotosDetails = [
  {
    image_link:"/images/photos/expansions/tokyocity1.png"
  },
  {
    image_link:"/images/photos/expansions/tokyocity3.png"
  },
  {
    image_link:"/images/photos/expansions/tokyocity5.png"
  }
]

//hawaii photo details
const hawaiiPhotosDetails = [
  {
    image_link:"/images/photos/expansions/hawaii1.png"
  },
  {
    image_link:"/images/photos/expansions/hawaii3.png"
  },
  {
    image_link:"/images/photos/expansions/hawaii5.png"
  }
]

//karuizawa photo details
const karuizawaPhotosDetails = [
  {
    image_link:"/images/photos/expansions/karuizawa1.png"
  },
  {
    image_link:"/images/photos/expansions/karuizawa3.png"
  },
  {
    image_link:"/images/photos/expansions/karuizawa5.png"
  }
]

//tokyo2020 photo details
const tokyo2020PhotosDetails = [
  {
    image_link:"/images/photos/expansions/tokyo20201.png"
  },
  {
    image_link:"/images/photos/expansions/tokyo20203.png"
  },
  {
    image_link:"/images/photos/expansions/tokyo20205.png"
  }
]

//a single photo with caption
const PhotoWithCaption = (props) => {
  return (
    <a className="photoWrapper" target="_blank" rel="noopener noreferrer" href={props.image_link}>
      <img className="boxes" src={props.image_link} alt={props.image_alt}></img>
      <p className="caption">{props.image_alt}</p>
    </a>
  )
}

const PhotosPage = (props) => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "SHAREHOME - Photos";
  });

  //main photos
  const mainPhotos = mainPhotosDetails.map((elem, index)=>{
    return (
      <PhotoWithCaption
        key={index}
        image_link={elem.image_link}
        image_alt={elem.image_alt}
      />
    )
  });

  //expansion photos
  const expansionPhotos = expansionPhotosDetails.map((elem, index)=>{
    return (
      <PhotoWithCaption
        key={index}
        image_link={elem.image_link}
        image_alt={elem.image_alt}
      />
    )
  });

  //shonan photos
  const shonanPhotos = shonanPhotosDetails.map((elem, index)=>{
    return (
      <PhotoWithCaption
        key={index}
        image_link={elem.image_link}
        image_alt={elem.image_alt}
      />
    )
  });

  //tokyocity photos
  const tokyocityPhotos = tokyocityPhotosDetails.map((elem, index)=>{
    return (
      <PhotoWithCaption
        key={index}
        image_link={elem.image_link}
        image_alt={elem.image_alt}
        />
    )
  });

  //hawaii photos
  const hawaiiPhotos = hawaiiPhotosDetails.map((elem, index)=>{
    return (
      <PhotoWithCaption
        key={index}
        image_link={elem.image_link}
        image_alt={elem.image_alt}
      />
    )
  });

  //karuizawa photos
  const karuizawaPhotos = karuizawaPhotosDetails.map((elem, index)=>{
    return (
      <PhotoWithCaption
        key={index}
        image_link={elem.image_link}
        image_alt={elem.image_alt}
        />
    )
  });

  //tokyo2020 photos
  const tokyo2020Photos = tokyo2020PhotosDetails.map((elem, index)=>{
    return (
      <PhotoWithCaption
        key={index}
        image_link={elem.image_link}
        image_alt={elem.image_alt}
      />
    )
  });

  return (
    <div className="content max-width">
      <NavLink to="/"><div className="title noselect"></div></NavLink>
      <div className="photoContent">
        <div className="photoSubcontent">
          <h2 className="subtitle">{t('photos page.base.title')}</h2>
          <p>{t('photos page.base.description')}<br></br>
          <span style={{color:"red"}}>{t('photos page.warning red')}</span> {t('photos page.warning')}</p>
          { mainPhotos }
        </div>
        <div className="photoSubcontent">
          <h2 className="subtitle">{t('photos page.expansion.title')}</h2>
          <p>{t('photos page.expansion.description')}<br></br>
            <span style={{color:"red"}}>{t('photos page.warning red')}</span> {t('photos page.warning')}</p>
          { expansionPhotos }
        </div>
        <div id="SHONAN" className="photoSubcontent">
          <h2 className="subtitle">{t('photos page.shonan')}</h2>
          { shonanPhotos }
        </div>
        <div id="TOKYOCITY" className="photoSubcontent">
          <h2 className="subtitle">{t('photos page.tokyo city')}</h2>
          { tokyocityPhotos }
        </div>
        <div id="HAWAII" className="photoSubcontent">
          <h2 className="subtitle">{t('photos page.hawaii')}</h2>
          { hawaiiPhotos }
        </div>
        <div id="KARUIZAWA" className="photoSubcontent">
          <h2 className="subtitle">{t('photos page.karuizawa')}</h2>
          { karuizawaPhotos }
        </div>
        <div id="TOKYO2020" className="photoSubcontent">
          <h2 className="subtitle">{t('photos page.tokyo 2020')}</h2>
          { tokyo2020Photos }
        </div>
      </div>
    </div>
  )
}

export default PhotosPage;
