import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { CornerLeftDown } from 'react-feather';

import Card from './Card/Card.js';

import '../css/contact.css';

const ContactPage = (props) => {

  useEffect(() => {
    document.title = "SHAREHOME - Contact us";
  });

  return (
    <div className="content max-width">
      <NavLink to="/"><div className="title noselect"></div></NavLink>
      <div className="subcontentWrapper">
        <h2 className="subtitle">Questions? Comments?</h2>
        <p>Email us at <a className="email" href="mailto:hello@sharehomethegame.com">hello@sharehomethegame.com</a></p>
      </div>
      <div className="subcontentWrapper">
        <div className="madeby">
          <p>
            SHAREHOME is made by <a href="https://unicornwithwings.com">Pegasus Games</a> and
            is not affiliated with the makers of the popular Japanese reality TV show on that really popular streaming website.
          </p>
          <p>
            Although it would be awesome if they could just reply to my emails.<br/>どうかよろしくお願い致します！
          </p>
        </div>
        <div className="madeby">
          <p><CornerLeftDown style={{verticalAlign:"text-top", marginRight:"10px"}} />Made by this guy</p>
          <Card
            type="member"
            personName="Wonmin Lee"
            showFront={true}
            mainStyle={{
              width:"300px",
              height:"200px",
              fontSize:"9px",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
