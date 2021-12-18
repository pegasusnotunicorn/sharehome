import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import MetaTags from './components/MetaTags.js';
import NavbarMain from './components/Navbar/NavbarMain.js';
import Footer from './components/Footer.js';
import HomePage from './components/HomePage.js';
import AboutPage from './components/About/AboutPage.js';
import CharactersPage from './components/Characters/CharactersPage.js';
import ContactPage from './components/ContactPage.js';
import DesignerPage from './components/Designer/DesignerPage.js';
import ErrorPage from './components/ErrorPage.js';
import { ShapesContainer } from "./components/utils/ShapesContainer.js";

const Router = (props) => {

  return (
    <BrowserRouter>
      <MetaTags></MetaTags>
      <ShapesContainer count={70}/>
      <Switch>
        <Route exact path="/" render={() => {
          //pass the state setter so we can hide the footer when needed
          return <HomePage />
        }} />
        <Route path="/about" render={() => {
          return <AboutPage />
        }} />
        <Route path="/characters" render={() => {
          return <CharactersPage />
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
