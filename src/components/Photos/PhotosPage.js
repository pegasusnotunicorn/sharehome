import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Title } from '../utils/Title.js';

import '../../css/photos.css';

//main photo details
const mainPhotosDetails = [
  {
    image_link:"/images/splash.jpg"
  },
]

//a single photo with caption
const PhotoWithCaption = (props) => {
  return (
    <div className="photoWrapper" >
      <a target="_blank" rel="noopener noreferrer" href={props.image_link}>
        <img className="boxes" src={props.image_link} alt={props.image_alt}></img>
        <p className="caption noselect">{props.image_alt}</p>
      </a>
    </div>
  )
}

const PhotosPage = (props) => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "SHAREHOME - Photos";
  });

  //expansion photo details
  const expansionPhotosDetails = [
    {
      image_link:"/images/members/characters1.jpg",
      image_alt: t('characters.1.name'),
    },
    {
      image_link:"/images/members/characters2.jpg",
      image_alt: t('characters.2.name'),
    },
    {
      image_link:"/images/members/characters3.jpg",
      image_alt: t('characters.3.name'),
    },
    {
      image_link:"/images/members/characters4.jpg",
      image_alt: t('characters.4.name'),
    },
    {
      image_link:"/images/members/characters5.jpg",
      image_alt: t('characters.5.name'),
    },
    {
      image_link:"/images/members/characters6.jpg",
      image_alt: t('characters.6.name'),
    },
    {
      image_link:"/images/members/characters7.jpg",
      image_alt: t('characters.7.name'),
    },
  ]

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


  return (
    <div className="content max-width">
      <Title />
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
        <div className="photoSubcontent">
          <h3 className="moretocome">{t('photos page.moretocome')}</h3>
        </div>
      </div>
    </div>
  )
}

export default PhotosPage;
