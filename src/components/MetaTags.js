import React from 'react';

import CustomHelmet from './utils/CustomHelmet.js';

const MetaTags = (props) => {
  let splashImage = "/images/mainbox.jpg";
  let description = "A fantastical reality TV card game about laughing, acting, and storytelling. Form relationships, stir up drama, and achieve your secret life goals!"
  let title = "Love, Career & Magic — A SHAREHOME Game";

  return (
    <CustomHelmet title={title} splashImage={splashImage} description={description} />
  )
}

export default MetaTags;
