import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { ParallaxProvider } from 'react-scroll-parallax';

import MetaTags from './components/MetaTags.js';
import NavbarMain from './components/Navbar/NavbarMain.js';
import Footer from './components/Footer.js';
import HomePage from './components/HomePage.js';
import AboutPage from './components/About/AboutPage.js';
import CharactersPage from './components/Characters/CharactersPage.js';
import ContactPage from './components/ContactPage.js';
import ErrorPage from './components/ErrorPage.js';

const Router = (props) => {

  // <Route path="/designer" render={() => {
  //   return <DesignerPage />
  // }} />

  return (
    <ParallaxProvider>
      <BrowserRouter>
        <MetaTags></MetaTags>
        <NavbarMain />

        <Switch>
          <Route exact path="/" render={() => {
            return <HomePage />
          }} />
          <Route path="/about" render={() => {
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

        <Footer key={Date.now()} />

      </BrowserRouter>
    </ParallaxProvider>
  )
}

export default Router;
