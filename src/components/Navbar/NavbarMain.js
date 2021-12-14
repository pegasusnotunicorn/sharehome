import React, { useState } from 'react';
import { Home, HelpCircle, Mail, Edit, FileText, Camera } from 'react-feather';
import { useTranslation } from 'react-i18next';
import i18n from "i18next";

import { NavLink } from 'react-router-dom';
import { TitleCircle } from '../utils/Title.js';
import { CustomForm } from '../utils/MailchimpForm.js';
import NavbarTemplate from './NavbarTemplate.js';
import '../../css/navbar.css';
import '../../css/hamburger.css';

// <NavLink to="/purchase" activeClassName="is-active" className="button noselect navbarButton"><ShoppingCart />Purchase</NavLink>
// <a href="https://tabletopia.com/games/sharehome" rel="noopener noreferrer" target="_blank" activeclassname="is-active" className="button noselect navbarButton"><Star />{t('navbar.play online')}</a>

//main navbar for page navigation on the website
export const NavbarMain = () => {
  const [visibility, setVisibility] = useState("invisible");
  const hideNav = () => { setVisibility("invisible"); }
  const { t } = useTranslation();

  const innards = (
    <div className="navBarMain" style={{height:"100%"}}>
      <TitleCircle />
      <div className="navbarButtonWrapper">
        <NavLink onClick={hideNav} exact={true} to="/" activeClassName="is-active" className="button noselect navbarButton"><Home />{t('navbar.home')}</NavLink>
        <NavLink onClick={hideNav} to="/about" activeClassName="is-active" className="button noselect navbarButton"><HelpCircle />{t('navbar.how to play')}</NavLink>
        <NavLink onClick={hideNav} to="/photos" activeClassName="is-active" className="button noselect navbarButton"><Camera />{t('navbar.photos')}</NavLink>
        <NavLink onClick={hideNav} to="/designer" activeClassName="is-active" className="button noselect navbarButton"><Edit />{t('navbar.card designer')}</NavLink>
        <NavLink onClick={hideNav} to="/contact" activeClassName="is-active" className="button noselect navbarButton"><Mail />{t('navbar.contact us')}</NavLink>
        <a href="https://pegasusgames.medium.com/" rel="noopener noreferrer" target="_blank" activeclassname="is-active" className="button noselect navbarButton"><FileText />{t('navbar.blog')}</a>
      </div>
      <div className="navbarBottomWrapper">
        <p className="languageChangeWrapper"><span className="languageChange" onClick={()=>{
            i18n.changeLanguage("en-US");
            document.getElementById('sharehome').setAttribute("language", "en-US");
          }}>English</span> / <span className="languageChange" onClick={()=>{
            i18n.changeLanguage("ja");
            document.getElementById('sharehome').setAttribute("language", "ja");
          }}>日本語</span></p>
        <CustomForm sidebar={true} />
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
