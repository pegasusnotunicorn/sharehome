import React, { useState } from 'react';
import { Home, HelpCircle, Mail, Edit, FileText, Users } from 'react-feather';
import { useTranslation } from 'react-i18next';
import i18n from "i18next";

import { NavLink } from 'react-router-dom';
import { CustomForm } from '../utils/MailchimpForm.js';
import NavbarTemplate from './NavbarTemplate.js';
import navbarStyles from '../../css/navbar.module.css';
import '../../css/utils/hamburger.css';

// <NavLink to="/purchase" activeClassName="is-active" className="button noselect navbarButton"><ShoppingCart />Purchase</NavLink>
// <a href="https://tabletopia.com/games/sharehome" rel="noopener noreferrer" target="_blank" activeclassname="is-active" className="button noselect navbarButton"><Star />{t('navbar.play online')}</a>

//main navbar for page navigation on the website
export const NavbarMain = () => {
  const [visibility, setVisibility] = useState("invisible");
  const hideNav = () => { setVisibility("invisible"); }
  const { t } = useTranslation();

  const innards = (
    <div className={`${navbarStyles.navBarMain}`} style={{height:"100%"}}>

      <div className={`${navbarStyles.titleWrapper}`}>
        <NavLink to="/">
          <img className={`${navbarStyles.lcmImage}`} src="/images/lcmCircle.png" alt="Love, Career, & Magic"></img>
        </NavLink>
        <h3 className={`${navbarStyles.sharehomegame}`}>a sharehome game</h3>
      </div>

      <div className={`${navbarStyles.navbarButtonWrapper}`}>
        <NavLink onClick={hideNav} exact={true} to="/" activeClassName={navbarStyles["is-active"]} className={`${navbarStyles.navbarButton} button noselect`}><Home />{t('navbar.home')}</NavLink>
        <NavLink onClick={hideNav} to="/about" activeClassName={navbarStyles["is-active"]} className={`${navbarStyles.navbarButton} button noselect`}><HelpCircle />{t('navbar.how to play')}</NavLink>
        <NavLink onClick={hideNav} to="/characters" activeClassName={navbarStyles["is-active"]} className={`${navbarStyles.navbarButton} button noselect`}><Users />{t('navbar.characters')}</NavLink>
        <NavLink onClick={hideNav} to="/designer" activeClassName={navbarStyles["is-active"]} className={`${navbarStyles.navbarButton} button noselect`}><Edit />{t('navbar.card designer')}</NavLink>
        <NavLink onClick={hideNav} to="/contact" activeClassName={navbarStyles["is-active"]} className={`${navbarStyles.navbarButton} button noselect`}><Mail />{t('navbar.contact us')}</NavLink>
        <a href="https://pegasusgames.medium.com/" rel="noopener noreferrer" target="_blank" activeclassname="is-active" className={`${navbarStyles.navbarButton} button noselect`}><FileText />{t('navbar.blog')}</a>
      </div>
      <div className={`${navbarStyles.navbarBottomWrapper}`}>
        <p className={`${navbarStyles.languageChangeWrapper}`}><span className={`${navbarStyles.languageChangeSpan}`} onClick={()=>{
            i18n.changeLanguage("en-US");
            document.getElementById('sharehome').setAttribute("language", "en-US");
          }}>English</span> / <span className={`${navbarStyles.languageChangeSpan}`} onClick={()=>{
            i18n.changeLanguage("ja");
            document.getElementById('sharehome').setAttribute("language", "ja");
          }}>日本語</span></p>
        <CustomForm
          sidebar={true}
          moduleStyles={navbarStyles}
        />
      </div>
    </div>
  )

  return (
    <NavbarTemplate
      innards={innards}
      position="right"
      id="navbar"
      visibility={visibility}
      setVisibility={setVisibility}
    />
  )
}

export default NavbarMain;
