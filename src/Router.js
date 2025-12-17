import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router";
import MetaTags from "./components/MetaTags.js";
import Navbar from "./components/Navbar/Navbar.js";
import Banner from "./components/Banner.js";
import ScrollToTop from "./ScrollToTop.js";
import LandingPage from "./components/Home/LandingPage.js";
import TTRPGPage from "./components/Home/TTRPGPage.js";
import AboutPage from "./components/About/AboutPage.js";
import CharactersPage from "./components/Characters/CharactersPage.js";
import TermsPage from "./components/TermsPage.js";
import ContactPage from "./components/ContactPage.js";
import ErrorPage from "./components/ErrorPage.js";
import Footer from "./components/Footer.js";
import ArtbookDownloadPage from "./components/ArtbookDownloadPage.js";
import ThankYouPage from "./components/ThankYouPage.js";
import SignupPage from "./components/SignupPage.js";
import ExternalRedirect from "./components/ExternalRedirect.js";
import useUTMPreservation from "./hooks/useUTMPreservation.js";

const STRIPE_BACKUP_PAYMENT_LINK =
  process.env.NODE_ENV === "development"
    ? process.env.REACT_APP_STRIPE_TEST_URL
    : process.env.REACT_APP_STRIPE_PROD_URL;

const Router = () => {
  // Hide the static image once React is ready
  useEffect(() => {
    const staticHero = document.getElementById("hero-static");
    if (staticHero) {
      staticHero.style.display = "none";
    }
  }, []);

  return (
    <BrowserRouter>
      <MetaTags />
      <ScrollToTop />
      <AppRoutes />
    </BrowserRouter>
  );
};

const AppRoutes = () => {
  const location = useLocation();
  const isExternalRedirect = ["/rulebook", "/buy"].includes(location.pathname);

  const [videoModalVisible, setVideoModalVisible] = useState(false);

  // Preserve UTM parameters across all page navigation
  useUTMPreservation();

  return (
    <>
      {!isExternalRedirect && <Banner />}
      {!isExternalRedirect && <Navbar videoModalVisible={videoModalVisible} />}
      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              videoModalVisible={videoModalVisible}
              setVideoModalVisible={setVideoModalVisible}
            />
          }
        />
        <Route
          path="/ttrpg"
          element={
            <TTRPGPage
              videoModalVisible={videoModalVisible}
              setVideoModalVisible={setVideoModalVisible}
            />
          }
        />
        <Route path="/about" element={<Navigate to="/howtoplay" replace />} />
        <Route path="/howtoplay" element={<AboutPage />} />
        <Route path="/digitalartbook" element={<ArtbookDownloadPage />} />
        <Route path="/characters" element={<CharactersPage />} />
        <Route path="/characters/:name" element={<CharactersPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/thankyou" element={<ThankYouPage />} />
        <Route
          path="/rulebook"
          element={<ExternalRedirect url="/rulebook.pdf" />}
        />
        {/* Fallback for /buy route */}
        <Route
          path="/buy"
          element={<ExternalRedirect url={STRIPE_BACKUP_PAYMENT_LINK} />}
        />
        <Route path="/terms" element={<TermsPage />} />
        {/* Fallback for undefined routes */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
      {!isExternalRedirect && <Footer key={Date.now()} />}
    </>
  );
};

export default Router;
