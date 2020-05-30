import React, { useState } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import NavbarMain from './components/Navbar/NavbarMain.js';
import Footer from './components/Footer.js';
import HomePage from './components/HomePage.js';
import AboutPage from './components/About/AboutPage.js';
import ContactPage from './components/ContactPage.js';
import DesignerPage from './components/Designer/DesignerPage.js';
import ErrorPage from './components/ErrorPage.js';

const Router = (props) => {

  //state to show the footer or not
  const [showFooter, setShowFooter] = useState(true);

  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" render={() => {
          //pass the state setter so we can hide the footer when needed
          return <HomePage setShowFooter={setShowFooter}/>
        }} exact/>
        <Route path="/about" render={() => {
          return <AboutPage setShowFooter={setShowFooter}/>
        }} />
        <Route path="/contact" render={() => {
          return <ContactPage setShowFooter={setShowFooter}/>
        }} exact/>
        <Route path="/designer" render={() => {
          return <DesignerPage setShowFooter={setShowFooter}/>
        }} exact/>
        <Route render={() => {
          return <ErrorPage setShowFooter={setShowFooter}/>
        }} exact/>
        <Redirect to="/" />
      </Switch>

      <NavbarMain />
      <Route render={() => {
        return (showFooter) ? <Footer key={Date.now()} /> : null
      }} />
    </BrowserRouter>
 )
}

export default Router;
