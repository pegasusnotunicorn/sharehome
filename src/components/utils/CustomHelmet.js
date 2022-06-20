import React from 'react';
import { Helmet } from "react-helmet";

const CustomHelmet = (props) => {
  return (
    <Helmet>
      <meta name="description" data-react-helmet="true" content={ props.description } />

      <meta itemprop="name" data-react-helmet="true" content={ props.description } />
      <meta itemprop="description" data-react-helmet="true" content={ props.description } />
      <meta itemprop="image" data-react-helmet="true" content={ props.splashImage } />

      <meta property="og:title" data-react-helmet="true" content={ props.title } />
      <meta property="og:description" data-react-helmet="true" content={ props.description } />
      <meta property="og:image" data-react-helmet="true" content={ props.splashImage } />
      <meta property="og:url" data-react-helmet="true" content={ window.location.href } />

      <meta name="twitter:title" data-react-helmet="true" content={ props.title }></meta>
      <meta name="twitter:description" data-react-helmet="true" content={ props.description } />
      <meta name="twitter:image" data-react-helmet="true" content={ props.splashImage } />
    </Helmet>
  )
}

export default CustomHelmet;
