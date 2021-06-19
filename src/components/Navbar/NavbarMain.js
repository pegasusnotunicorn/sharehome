import React, { useState } from 'react';
import { Home, HelpCircle, Mail, Edit, Star, Camera } from 'react-feather';
import { useTranslation } from 'react-i18next';
import i18n from "i18next";

import { NavLink } from 'react-router-dom';
import NavbarTemplate from './NavbarTemplate.js';
import '../../css/navbar.css';
import '../../css/hamburger.css';


// <NavLink to="/purchase" activeClassName="is-active" className="button noselect navbarButton"><ShoppingCart />Purchase</NavLink>

//main navbar for page navigation on the website
export const NavbarMain = () => {
  const [visibility, setVisibility] = useState("invisible");
  const hideNav = () => { setVisibility("invisible"); }
  const { t } = useTranslation();

  const innards = (
    <div style={{height:"100%"}}>
      <NavLink to="/"><div className="title noselect"></div></NavLink>
      <div className="navbarButtonWrapper">
        <NavLink onClick={hideNav} exact={true} to="/" activeClassName="is-active" className="button noselect navbarButton"><Home />{t('navbar.home')}</NavLink>
        <NavLink onClick={hideNav} to="/about" activeClassName="is-active" className="button noselect navbarButton"><HelpCircle />{t('navbar.how to play')}</NavLink>
        <NavLink onClick={hideNav} to="/photos" activeClassName="is-active" className="button noselect navbarButton"><Camera />{t('navbar.photos')}</NavLink>
        <NavLink onClick={hideNav} to="/contact" activeClassName="is-active" className="button noselect navbarButton"><Mail />{t('navbar.contact us')}</NavLink>
        <NavLink onClick={hideNav} to="/designer" activeClassName="is-active" className="button noselect navbarButton"><Edit />{t('navbar.card designer')}</NavLink>
        <a href="https://tabletopia.com/games/sharehome" rel="noopener noreferrer" target="_blank" activeclassname="is-active" className="button noselect navbarButton"><Star />{t('navbar.play online')}</a>
      </div>
      <div className="navbarBottomWrapper">
        <p>
          <span className="languageChange" onClick={()=>{i18n.changeLanguage("en-US")}}>English</span> / <span className="languageChange" onClick={()=>{i18n.changeLanguage("ja")}}>日本語</span></p>
        <p>{t('navbar.questions')}</p>
        <p className="emailP"><a className="email" href="mailto:hello@sharehomethegame.com">hello@sharehomethegame.com</a></p>
      </div>
    </div>
  )

  return (
    <NavbarTemplate
      innards={innards}
      position="left"
      id="navbar"
      visibility={visibility}
      setVisibility={setVisibility}
    />
  )
}

export default NavbarMain;
