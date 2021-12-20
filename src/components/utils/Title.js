import React from 'react';
import { NavLink } from 'react-router-dom';

export const Title = (props) => {

  return (
    <div className="lcmContainer noselect">
      <div className="titleWrapper">
        <NavLink to="/" draggable={false}>
          <img draggable={false} className="lcmImage floating" src="/images/lcm.png" alt="Love, Career, & Magic"></img>
        </NavLink>
        <h3 className="sharehomegame">a sharehome game</h3>
      </div>
    </div>
  );
}
