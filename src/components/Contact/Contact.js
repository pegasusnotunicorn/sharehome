import React, { useEffect } from 'react';
import { CornerLeftDown } from 'react-feather';
import { MemberCard } from '../Footer/MemberCard.js';
import { NavLink } from 'react-router-dom';
import '../../css/contact.css';

const Contact = (props) => {

  useEffect(() => {
    props.setShowFooter(true);
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
            Although it would be awesome if they could just reply to my emails.<br/>どうかよろしくお願いします！
          </p>
        </div>
        <div className="madeby">
          <p><CornerLeftDown style={{verticalAlign:"text-top", marginRight:"10px"}} />Made by this guy</p>
          <MemberCard
            memberName="Wonmin Lee"
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

export default Contact;
