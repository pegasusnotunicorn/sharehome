import React from 'react';

//template used for sidebars
export const NavbarTemplate = (props) => {
  const navbarWidth = 300;
  const openCloseStyle = {};
  const startingPosition = (props.visibility === "visible") ? 0 : -(navbarWidth+10);
  const startingHamburgerClass = (props.visibility === "visible") ? " is-active" : "";

  //style the left or right sidebar
  const navbarStyle = {
    width:navbarWidth,
  }
  if (props.position === "left"){
    navbarStyle.left = startingPosition;
    navbarStyle.borderRight = "border-right:4px solid #1F1169";
    openCloseStyle.left = 0;
  }
  if (props.position === "right"){
    navbarStyle.right = startingPosition;
    navbarStyle.borderLeft = "border-right:4px solid #1F1169";
    openCloseStyle.right = 20;
  }

  //function used to toggle open navbar
  const toggleNav = () => {
    let newVisiblity = (props.visibility === "visible") ? "invisible" : "visible";
    props.setVisibility(newVisiblity);
  }

  return (
    <div id={props.id} className={"navbar" + startingHamburgerClass} style={navbarStyle} >
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
