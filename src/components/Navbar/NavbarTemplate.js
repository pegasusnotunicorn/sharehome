import React from 'react';

//template used for sidebars
export const NavbarTemplate = (props) => {
  const navbarWidth = 300;
  const openCloseStyle = {};
  const navbarStyle = {
    width:navbarWidth,
  }
  const startingPosition = (props.startingPosition === "visible") ? 0 : -(navbarWidth+10);
  const startingHamburgerClass = (props.startingPosition === "visible") ? " is-active" : "";

  if (props.position === "left"){
    navbarStyle.left = startingPosition;
    openCloseStyle.left = 0;
  }
  if (props.position === "right"){
    navbarStyle.right = startingPosition;
    openCloseStyle.right = 20;
  }

  //function used to toggle open navbar
  const toggleNav = () => {
    let navPosition = document.getElementById(props.id).style[props.position];
    document.getElementById(props.id).style[props.position] = (navPosition === "0px") ? (-(navbarWidth + 10)) + "px" : "0px";
    document.getElementById(props.id).classList.toggle("is-active");
    document.getElementById(props.id + "OpenClose").classList.toggle("is-active");
  }

  return (
    <div id={props.id} className="navbar" style={navbarStyle} >
      <button id={props.id + "OpenClose"} className={"hamburger hamburger--slider navbarOpenClose" + startingHamburgerClass} onClick={toggleNav} style={openCloseStyle} type="button">
        <span className="hamburger-box">
          <span className="hamburger-inner"></span>
        </span>
      </button>
      {props.innards}
    </div>
  );
}

export default NavbarTemplate;
