import { useRef, useEffect } from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import MetaTags from "./components/MetaTags.js";
import Navbar from "./components/Navbar/Navbar.js";
import ScrollToTop from "./ScrollToTop.js";
import HomePage from "./components/Home/HomePage.js";
import AboutPage from "./components/About/AboutPage.js";
import CharactersPage from "./components/Characters/CharactersPage.js";
import ContactPage from "./components/ContactPage.js";
import ErrorPage from "./components/ErrorPage.js";
import Footer from "./components/Footer.js";
import ArtbookDownloadPage from "./components/ArtbookDownloadPage.js";
import FreeArtbookPage from "./components/FreeArtbookPage.js";
import ThankYouPage from "./components/ThankYouPage.js";
import RulebookRedirect from "./components/RulebookRedirect.js";

const Router = () => {
  //magic to open the navbar from inside homepage
  let setNavbarActive = useRef(null);
  const onChildMount = (setterFromChild) => {
    setNavbarActive.current = setterFromChild;
  };

  // Hide the static image once React is ready
  useEffect(() => {
    const staticHero = document.getElementById("hero-static");
    if (staticHero) {
      staticHero.style.display = "none";
    }
  }, []);

  return (
    <BrowserRouter>
      <MetaTags></MetaTags>
      <Navbar onMount={onChildMount} />

      <ScrollToTop>
        <Switch>
          <Route
            exact
            path="/"
            render={() => {
              return <HomePage ref={setNavbarActive} />;
            }}
          />
          <Route
            path="/about"
            render={() => {
              return <Redirect to="/howtoplay" />;
            }}
          />
          <Route
            path="/howtoplay"
            render={() => {
              return <AboutPage />;
            }}
          />
          <Route
            exact
            path="/freeartbook"
            render={() => {
              return <FreeArtbookPage />;
            }}
          />
          <Route
            exact
            path="/digitalartbook"
            render={() => {
              return <ArtbookDownloadPage />;
            }}
          />
          <Route
            path={["/characters/:name", "/characters"]}
            render={() => {
              return <CharactersPage />;
            }}
          />
          <Route
            exact
            path="/contact"
            render={() => {
              return <ContactPage />;
            }}
          />
          <Route
            exact
            path="/thankyou"
            render={() => {
              return <ThankYouPage />;
            }}
          />
          <Route exact path="/rulebook" component={RulebookRedirect} />
          <Route
            exact
            path="/buy"
            render={() => {
              window.location.href =
                "https://buy.stripe.com/bIYg0Q1e08Z86Fa8wy";
              return null;
            }}
          />
          <Route
            render={() => {
              return <ErrorPage />;
            }}
          />
          <Redirect to="/" />
        </Switch>
      </ScrollToTop>

      <Footer key={Date.now()} />
    </BrowserRouter>
  );
};

export default Router;
