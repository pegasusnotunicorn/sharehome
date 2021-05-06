import React from 'react';
import { Home, HelpCircle, Mail, Edit, Star } from 'react-feather';

import { NavLink } from 'react-router-dom';
import NavbarTemplate from './NavbarTemplate.js';
import '../../css/navbar.css';
import '../../css/hamburger.css';

// <NavLink to="/purchase" activeClassName="is-active" className="button noselect navbarButton"><ShoppingCart />Purchase</NavLink>

//main navbar for page navigation on the website
export const NavbarMain = () => {
  const innards = (
    <div style={{height:"100%"}}>
      <NavLink to="/"><div className="title noselect"></div></NavLink>
      <div className="navbarButtonWrapper">
        <NavLink exact={true} to="/" activeClassName="is-active" className="button noselect navbarButton"><Home />Home</NavLink>
        <NavLink to="/about" activeClassName="is-active" className="button noselect navbarButton"><HelpCircle />How to play</NavLink>
        <NavLink to="/contact" activeClassName="is-active" className="button noselect navbarButton"><Mail />Contact Us</NavLink>
        <NavLink to="/designer" activeClassName="is-active" className="button noselect navbarButton"><Edit />Card Designer</NavLink>
        <a href="https://tabletopia.com/playground/sharehome-u81imm/play-now" rel="noopener noreferrer" target="_blank" activeClassName="is-active" className="button noselect navbarButton"><Star />Play Online</a>
      </div>
      <div className="navbarBottomWrapper">
        <p>Questions? Comments?</p>
        <p><a className="email" href="mailto:hello@sharehomethegame.com">hello@sharehomethegame.com</a></p>
      </div>
    </div>
  )

  return (
    <NavbarTemplate
      innards={innards}
      position="left"
      id="navbar"
    />
  )
}

export default NavbarMain;
