import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import WebFont from 'webfontloader';

import './css/index.css';
import './css/utils/translations/eng.css';
import './css/utils/translations/jap.css';
import './css/utils/fonts.css';
import Router from './Router.js';
import i18n from './i18n';

//load font first
WebFont.load({
  custom: {
    families: ['AmaticSC Regular', 'ZenKurenaido Regular'],
  },
  active: ()=>{
    //set language so we can use custom CSS
    document.getElementById('sharehome').setAttribute("language", i18n.language);

    ReactDOM.render(
      <React.StrictMode>
        <Router />
      </React.StrictMode>,
      document.getElementById('sharehome')
    );
  },
});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
