import React from 'react';
import ReactDOM from 'react-dom';
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
    families: [
      'Rowdies-Regular',
      'Rowdies-Light',
      'Rowdies-Bold',
      'NotoSansJP Bold'
    ],
  },
  active: ()=>{
    //set language so we can use custom CSS
    document.getElementById('sharehome').setAttribute("language", i18n.language);
    ReactDOM.render(
      <Router />,
      document.getElementById('sharehome')
    );
  }
});
