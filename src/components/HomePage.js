import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { CustomForm } from './utils/MailchimpForm.js';
// import { Printer, Gift, Smile } from 'react-feather';

import '../css/home.css';
import '../css/colors.css';

const HomePage = (props) => {

  useEffect(() => {
    document.title = "SHAREHOME - A custom party game";
  });

  return (
    <div className="content">
      <NavLink to="/"><div className="title noselect"></div></NavLink>
      <div className="subcontentWrapper">
        <h3>
          A card game inspired by that hit Japanese reality TV show on that popular streaming service.
        </h3>

        <h3>Coming soon.</h3>

        <CustomForm />

      </div>

      <div className="couchContainer">
        <img className="couch" src="/images/couch.svg" alt="Commentator couch"></img>
      </div>
    </div>
  );
}

export default HomePage;
