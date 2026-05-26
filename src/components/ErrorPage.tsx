import { useEffect } from "react";
import { NavLink } from "react-router";
import { Splash } from "./utils/Splash";
import PageIntro from "./utils/PageIntro";
import errorStyles from "../css/pages/errorPage.module.css";

const ErrorPage = () => {
  useEffect(() => {
    document.title = "Something went wrong!";
  }, []);

  return (
    <div className={`content max-width ${errorStyles.errorPage}`}>
      <PageIntro
        title="Page not found"
        lead="Sorry but we could not find the page you were looking for 🧭"
      >
        <NavLink to="/" className={errorStyles.homeLink}>
          Click here to go back to the home page
        </NavLink>
      </PageIntro>

      <Splash />
    </div>
  );
};

export default ErrorPage;
