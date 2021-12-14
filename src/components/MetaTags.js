import React from 'react';
import { Helmet } from "react-helmet";

const MetaTags = (props) => {

  const description = "A fantastical reality TV card game about laughing, acting, and storytelling. What sort of fantastical relationships will you form? You decide!"

  return (
    <div className="metatag_wrapper">
      <Helmet>
        <meta name="description" content={ description } />

        <meta itemprop="name" content={ description } />
        <meta itemprop="description" content={ description } />
        <meta itemprop="image" content="/images/splash.jpg" />

        <meta property="og:title" content="Love, Career & Magic — A SHAREHOME Game" />
        <meta property="og:description" content={ description } />
        <meta property="og:image" content="/images/splash.jpg" />
        <meta property="og:url" content="" />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image"></meta>
        <meta name="twitter:title" content="Love, Career & Magic — A SHAREHOME Game"></meta>
        <meta name="twitter:description" content={ description } />
        <meta name="twitter:image" content="/images/splash.jpg" />
        <meta name="twitter:site" content="@sysifuscorp" />
        <meta name="twitter:creator" content="@1minlee" />
      </Helmet>
    </div>
  )
}

export default MetaTags;
