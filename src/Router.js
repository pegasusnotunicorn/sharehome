import React, { useState } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import NavbarMain from './components/Navbar/NavbarMain.js';
import Footer from './components/Footer.js';
import Home from './components/Home/Home.js';
import About from './components/About/About.js';
import Contact from './components/Contact/Contact.js';
import Designer from './components/Designer/Designer.js';
import Error from './components/Error.js';

const Router = (props) => {

  //state to show the footer or not
  const [showFooter, setShowFooter] = useState(true);

  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" render={() => {
          //pass the state setter so we can hide the footer when needed
          return <Home setShowFooter={setShowFooter}/>
        }} exact/>
        <Route path="/about" render={() => {
          return <About setShowFooter={setShowFooter}/>
        }} />
        <Route path="/contact" render={() => {
          return <Contact setShowFooter={setShowFooter}/>
        }} exact/>
        <Route path="/designer" render={() => {
          return <Designer setShowFooter={setShowFooter}/>
        }} exact/>
        <Route render={() => {
          return <Error setShowFooter={setShowFooter}/>
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
