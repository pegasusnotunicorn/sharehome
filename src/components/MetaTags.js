import React from 'react';
import { matchPath } from 'react-router';
import { useLocation } from 'react-router-dom';

import { getSpecificPersonByURL } from './Characters/Characters.js';
import CustomHelmet from './utils/CustomHelmet.js';

const MetaTags = (props) => {
  let splashImage = "/images/mainbox.jpg";
  let description = "A fantastical reality TV card game about laughing, acting, and storytelling. Form relationships, stir up drama, and achieve your secret life goals!"
  let title = "Love, Career & Magic — A SHAREHOME Game";

  //character specific
  const { pathname } = useLocation();
  const params =  matchPath(pathname, { path:"/characters/:name" });
  if (params){
    let chosenCharacter = getSpecificPersonByURL(params.params.name);
    if (chosenCharacter){
      title = `Love, Career & Magic — ${chosenCharacter.name}`;
      splashImage = chosenCharacter.image.url;

      description = "Introducing ";
      description += (chosenCharacter.title) ? chosenCharacter.title : `${chosenCharacter.name}, the ${chosenCharacter.race}`;
      description += `. A ${chosenCharacter.age} year old ${chosenCharacter.job}`;
      description += (chosenCharacter.employer) ? ` at ${chosenCharacter.employer}` : ``
      description += ` and member of SHAREHOME—A reality TV show about 6 mythical strangers living together in the same house.`
    }
  }

  //add absolute image path for Twitter
  splashImage = `https://lovecareermagic.com${splashImage}`;

  return (
    <CustomHelmet title={title} splashImage={splashImage} description={description} />
  )
}

export default MetaTags;
