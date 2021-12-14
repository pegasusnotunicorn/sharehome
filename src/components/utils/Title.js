import React from 'react';
import { NavLink } from 'react-router-dom';

export const Title = (props) => {

  return (
    <div className="lcmContainer">
      <div className="titleWrapper">
        <NavLink to="/">
          <img className="lcmImage" src="/images/lcm.png" alt="Love, Career, & Magic"></img>
        </NavLink>
        <h3 className="sharehomegame">a SHAREHOME game</h3>
      </div>
      {props.addons}
    </div>
  );
}

export const TitleCircle = (props) => {

  return (
    <div className="titleWrapper">
      <NavLink to="/">
        <img className="lcmImage" src="/images/lcmCircle.png" alt="Love, Career, & Magic"></img>
      </NavLink>
      <h3 className="sharehomegame">a SHAREHOME game</h3>
    </div>
  );
}
