import React from 'react';
import { Home, HelpCircle, Mail, Edit, Star, ShoppingCart } from 'react-feather';

import { NavLink } from 'react-router-dom';
import '../../css/navbar.css';
import '../../css/hamburger.css';

const navbarWidth = 300;

function toggleNav() {
  let navLeft = document.getElementById("navbar").style.left;
  document.getElementById("navbar").style.left = (navLeft === "0px") ? (-(navbarWidth + 10)) + "px" : "0px";
  document.getElementById("navbar").classList.toggle("is-active");
  document.getElementById("navbarOpenClose").classList.toggle("is-active");
}

const Navbar = () => {
  return (
    <div id="navbar" className="navbar" style={{width:navbarWidth, left:-(navbarWidth+10)}}>
      <NavLink to="/"><div className="title noselect"></div></NavLink>
      <div className="navbarButtonWrapper">
        <NavLink exact={true} to="/" activeClassName="is-active" className="button noselect navbarButton"><Home />Home</NavLink>
        <NavLink to="/about" activeClassName="is-active" className="button noselect navbarButton"><HelpCircle />How to play</NavLink>
        <NavLink to="/contact" activeClassName="is-active" className="button noselect navbarButton"><Mail />Contact</NavLink>
        <NavLink to="/designer" activeClassName="is-active" className="button noselect navbarButton"><Edit />Designer</NavLink>
        <NavLink to="/play" activeClassName="is-active" className="button noselect navbarButton"><Star />Play Online</NavLink>
        <NavLink to="/purchase" activeClassName="is-active" className="button noselect navbarButton"><ShoppingCart />Purchase</NavLink>
      </div>
      <div className="navbarBottomWrapper">
        <p>Questions? Comments?</p>
        <p><a className="email" href="mailto:hello@sharehomethegame.com">hello@sharehomethegame.com</a></p>
      </div>
      <button id="navbarOpenClose" className="hamburger hamburger--slider navbarOpenClose" onClick={toggleNav} type="button">
        <span className="hamburger-box">
          <span className="hamburger-inner"></span>
        </span>
      </button>
    </div>
  );
}

export default Navbar;
