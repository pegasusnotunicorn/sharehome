import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Splash } from "./utils/Splash.js";

const ErrorPage = (props) => {
  useEffect(() => {
    document.title = "Something went wrong!";
  });

  return (
    <div className="content max-width">
      <div className="subcontentWrapper margin-top min-width">
        <div className="characterContent">
          <h2 className="subtitle">Something went wrong!</h2>
          <p>
            We're sorry, but we couldn't find the page you were looking for.
          </p>
          <p>
            <NavLink to="/">Click here to go back to the home page.</NavLink>
          </p>
        </div>
      </div>

      <Splash />
    </div>
  );
};

export default ErrorPage;
