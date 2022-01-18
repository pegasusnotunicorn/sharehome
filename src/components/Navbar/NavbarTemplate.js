import React from 'react';
import navbarStyles from '../../css/navbar.module.css';

//template used for sidebars
export const NavbarTemplate = (props) => {
  const navbarWidth = 300;
  const openCloseStyle = {};
  const startingPosition = (props.visibility === "visible") ? 0 : -(navbarWidth+10);
  const startingHamburgerClass = (props.visibility === "visible") ? "is-active" : "";

  //style the left or right sidebar
  const newStyle = {
    width:navbarWidth,
  }
  if (props.position === "left"){
    newStyle.left = startingPosition;
    newStyle.borderRight = "border-right:4px solid #1F1169";
    openCloseStyle.left = 0;
  }
  if (props.position === "right"){
    newStyle.right = startingPosition;
    newStyle.borderLeft = "border-right:4px solid #1F1169";
    openCloseStyle.right = 20;
  }

  //function used to toggle open navbar
  const toggleNav = () => {
    let newVisiblity = (props.visibility === "visible") ? "invisible" : "visible";
    props.setVisibility(newVisiblity);
  }

  //main navbar or deck editor sidebar
  const colorForNavbar = (props.position === "left") ? "whiteBackground" : "blueBackground"

  return (
    <div id={navbarStyles[props.id]} className={`${navbarStyles.navbarClass} ${startingHamburgerClass} ${colorForNavbar}`} style={newStyle} >
      <button id={`${navbarStyles[props.id]}OpenClose`} className={`hamburger ${colorForNavbar} hamburger--slider ${navbarStyles.navbarOpenClose} ${startingHamburgerClass}`} onClick={toggleNav} style={openCloseStyle} type="button">
        <span className="hamburger-box">
          <span className="hamburger-inner"></span>
        </span>
      </button>
      {props.innards}
    </div>
  );
}

export default NavbarTemplate;
