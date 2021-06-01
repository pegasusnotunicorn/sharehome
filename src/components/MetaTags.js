import React from 'react';
import { Helmet } from "react-helmet";

const MetaTags = (props) => {

  const description = "A card game inspired by that hit Japanese reality TV show on that popular streaming service. SHAREHOME is a game about acting, laughing, and storytelling. What sort of relationships will you form? Will you uplift one another or devolve into chaos? You decide!"

  return (
    <div className="metatag_wrapper">
      <Helmet>
        <meta name="description" content={ description } />

        <meta itemprop="name" content={ description } />
        <meta itemprop="description" content={ description } />
        <meta itemprop="image" content="/images/photos/main box/Main Box + All Cards (Card Fronts).png" />

        <meta property="og:title" content="SHAREHOME - Your own reality TV card game." />
        <meta property="og:description" content={ description } />
        <meta property="og:image" content="/images/photos/main box/Main Box + All Cards (Card Fronts).png" />
        <meta property="og:url" content="" />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image"></meta>
        <meta name="twitter:title" content="SHAREHOME - Your own reality TV card game."></meta>
        <meta name="twitter:description" content={ description } />
        <meta name="twitter:image" content="/images/photos/main box/Main Box + All Cards (Card Fronts).png" />
        <meta name="twitter:site" content="@sysifuscorp" />
        <meta name="twitter:creator" content="@1minlee" />
      </Helmet>
    </div>
  )
}

export default MetaTags;
