import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import NavbarMain from './components/Navbar/NavbarMain.js';
import Footer from './components/Footer.js';
import HomePage from './components/HomePage.js';
import AboutPage from './components/About/AboutPage.js';
import ContactPage from './components/ContactPage.js';
import DesignerPage from './components/Designer/DesignerPage.js';
import ErrorPage from './components/ErrorPage.js';

// import PlayPage from './components/Play/PlayPage.js';
// <Route path="/play" render={() => {
//   return <PlayPage />
// }} />

const Router = (props) => {

  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" render={() => {
          //pass the state setter so we can hide the footer when needed
          return <HomePage />
        }} />
        <Route path="/about" render={() => {
          return <AboutPage />
        }} />
        <Route exact path="/contact" render={() => {
          return <ContactPage />
        }} />
        <Route path="/designer" render={() => {
          return <DesignerPage />
        }} />
        <Route render={() => {
          return <ErrorPage />
        }} />
        <Redirect to="/" />
      </Switch>

      <NavbarMain />
      <Route render={() => {
        return <Footer key={Date.now()} />
      }} />
    </BrowserRouter>
 )
}

export default Router;
