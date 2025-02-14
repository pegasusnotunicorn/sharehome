import { useRef, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
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
import ExternalRedirect from "./components/ExternalRedirect.js";
import useStoreUtmParams from "./hooks/useStoreUtmParams";

const stripeUrl =
  process.env.NODE_ENV === "development"
    ? process.env.REACT_APP_STRIPE_TEST_URL
    : process.env.REACT_APP_STRIPE_PROD_URL;

const Router = () => {
  // Magic to open the navbar from inside homepage
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

  useStoreUtmParams();

  const [videoModalVisible, setVideoModalVisible] = useState(false);

  return (
    <BrowserRouter>
      <MetaTags />
      <Navbar
        onMount={onChildMount}
        setVideoModalVisible={setVideoModalVisible}
      />

      <ScrollToTop>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                ref={setNavbarActive}
                videoModalVisible={videoModalVisible}
                setVideoModalVisible={setVideoModalVisible}
              />
            }
          />
          <Route path="/about" element={<Navigate to="/howtoplay" replace />} />
          <Route path="/howtoplay" element={<AboutPage />} />
          <Route path="/freeartbook" element={<FreeArtbookPage />} />
          <Route path="/digitalartbook" element={<ArtbookDownloadPage />} />
          <Route path="/characters" element={<CharactersPage />} />
          <Route path="/characters/:name" element={<CharactersPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/thankyou" element={<ThankYouPage />} />
          <Route
            path="/rulebook"
            element={<ExternalRedirect url="/rulebook.pdf" />}
          />
          <Route path="/buy" element={<ExternalRedirect url={stripeUrl} />} />
          {/* Fallback for undefined routes */}
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </ScrollToTop>

      <Footer key={Date.now()} />
    </BrowserRouter>
  );
};

export default Router;
