import React, { useRef } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import MetaTags from './components/MetaTags.js';
import Navbar from './components/Navbar/Navbar.js';
import ScrollToTop from './ScrollToTop.js';
import HomePage from './components/Home/HomePage.js';
import AboutPage from './components/About/AboutPage.js';
import CharactersPage from './components/Characters/CharactersPage.js';
import FreeStickersPage from './components/FreeStickersPage.js';
import ContactPage from './components/ContactPage.js';
import ErrorPage from './components/ErrorPage.js';
import Footer from './components/Footer.js';
// import ArtbookDownloadPage from './components/ArtbookDownloadPage.js';
// import FreeArtbookPage from './components/FreeArtbookPage.js';

const Router = (props) => {

  // <Route path="/designer" render={() => {
  //   return <DesignerPage />
  // }} />
  // <Route exact path="/freeartbook" render={() => {
  //     return <FreeArtbookPage />
  //   }} />
  // <Route exact path="/digitalartbook" render={() => {
  //   return <ArtbookDownloadPage />
  // }} />
  // <Route exact path="/freesticker" render={() => {
  //     return <FreeStickersPage />
  //   }} />

  //magic to open the navbar from inside homepage
  let setNavbarActive = useRef(null);
  const onChildMount = (setterFromChild) => {
    setNavbarActive.current = setterFromChild;
  };

  return (
    <BrowserRouter>
      <MetaTags></MetaTags>
      <Navbar onMount={onChildMount} />

      <ScrollToTop>
        <Switch>
          <Route exact path="/" render={() => {
            return <HomePage ref={setNavbarActive} />
          }} />
          <Route path="/about" render={() => {
            return <Redirect to="/howtoplay" />
          }} />
          <Route path="/howtoplay" render={() => {
            return <AboutPage />
          }} />
          <Route path={["/characters/:name", "/characters"]} render={() => {
            return <CharactersPage />
          }} />
          <Route exact path="/contact" render={() => {
            return <ContactPage />
          }} />
          <Route render={() => {
            return <ErrorPage />
          }} />
          <Redirect to="/" />
        </Switch>
      </ScrollToTop>

      <Footer key={Date.now()} />

    </BrowserRouter>
  )
}

export default Router;
