import React from 'react';
import { Helmet } from "react-helmet";
import { matchPath } from 'react-router';
import { useLocation } from 'react-router-dom';

import { getSpecificPersonByURL } from './Characters/Characters.js';

const MetaTags = (props) => {
  let splashImage = "/images/splash.jpg";
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

  return (
    <Helmet>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#FFFFFF" />

      <meta name="description" data-react-helmet="true" content={ description } />

      <meta itemprop="name" data-react-helmet="true" content={ description } />
      <meta itemprop="description" data-react-helmet="true" content={ description } />
      <meta itemprop="image" data-react-helmet="true" content={ splashImage } />

      <meta property="fb:app_id" content="" />
      <meta property="og:title" data-react-helmet="true" content={ title } />
      <meta property="og:description" data-react-helmet="true" content={ description } />
      <meta property="og:image" data-react-helmet="true" content={ splashImage } />
      <meta property="og:url" content="" />
      <meta property="og:type" content="website" />

      <meta name="twitter:card" content="summary_large_image"></meta>
      <meta name="twitter:title" data-react-helmet="true" content={ title }></meta>
      <meta name="twitter:description" data-react-helmet="true" content={ description } />
      <meta name="twitter:image" content={ splashImage } />
      <meta name="twitter:site" content="@sysifuscorp" />
      <meta name="twitter:creator" content="@1minlee" />
    </Helmet>
  )
}

export default MetaTags;
