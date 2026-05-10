import { useEffect } from "react";
import { NavLink } from "react-router";
import { Splash } from "./utils/Splash";
import errorStyles from "../css/pages/errorPage.module.css";

const ErrorPage = () => {
  useEffect(() => {
    document.title = "Something went wrong!";
  }, []);

  return (
    <div className={`content max-width ${errorStyles.errorPage}`}>
      <div className="subcontentWrapper margin-top min-width">
        <div className={`characterContent ${errorStyles.pageIntro}`}>
          <h2 className={`subtitle ${errorStyles.pageIntroTitle}`}>
            Page not found
          </h2>
          <p className={errorStyles.pageIntroLead}>
            Sorry but we could not find the page you were looking for 🧭
          </p>
          <NavLink to="/" className={errorStyles.homeLink}>
            Click here to go back to the home page
          </NavLink>
        </div>
      </div>

      <Splash />
    </div>
  );
};

export default ErrorPage;
