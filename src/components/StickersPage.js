import React, { useEffect } from 'react';
import { Helmet } from "react-helmet";
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

//custom files
import { Splash } from './utils/Splash.js';

const ErrorPage = (props) => {
  const { t } = useTranslation();

  //custom meta tags for this page
  const title = "Love, Career & Magic — Free stickers!";
  const splashImage = `https://sharehomethegame.com/images/splash.jpg`;
  const description = t("sticker page.description");

  //change title of page
  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className="content max-width">

      <Helmet>
        <meta name="description" data-react-helmet="true" content={ description } />

        <meta itemprop="name" data-react-helmet="true" content={ description } />
        <meta itemprop="description" data-react-helmet="true" content={ description } />
        <meta itemprop="image" data-react-helmet="true" content={ splashImage } />

        <meta property="og:title" data-react-helmet="true" content={ title } />
        <meta property="og:description" data-react-helmet="true" content={ description } />
        <meta property="og:image" data-react-helmet="true" content={ splashImage } />
        <meta property="og:url" data-react-helmet="true" content={ window.location.href } />

        <meta name="twitter:title" data-react-helmet="true" content={ title }></meta>
        <meta name="twitter:description" data-react-helmet="true" content={ description } />
        <meta name="twitter:image" data-react-helmet="true" content={ splashImage } />
      </Helmet>

      <div className="subcontentWrapper margin-top min-width">
        <div className="characterContent">
          <h2 className="subtitle">{t("sticker page.title")}</h2>
          <p>{t("sticker page.description")}</p>
          <p>{t("sticker page.description2")}</p>
          <p>{t("sticker page.description3")}</p>

          <form className="stickerTasksWrapper">
              <div style={{textDecoration:"underline"}} onClick={()=>{
                window.open("http://eepurl.com/hxOEy1");
              }}>
                <div className="checkWrapper"><input type="checkbox" id="task0" name="task0" /></div>
                <label htmlFor="task0">{t("sticker page.task 0")}</label>
              </div>
            <div className="taskWrapper">
              <div className="checkWrapper"><input type="checkbox" id="task1" name="task1" /></div>
              <label htmlFor="task1">{t("sticker page.task 1")}</label>
            </div>
            <div className="taskWrapper">
              <div className="checkWrapper"><input type="checkbox" id="task2" name="task2" /></div>
              <label htmlFor="task2">{t("sticker page.task 2")}</label>
            </div>
          </form>

          <p><NavLink to="/">{t("error page.link")}</NavLink></p>

        </div>
      </div>

      <Splash />
    </div>
  )
}

export default ErrorPage;
