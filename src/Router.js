import { lazy, Suspense, useEffect, useState } from "react";
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
import Footer from "./components/Footer.js";
import ExternalRedirect from "./components/ExternalRedirect.js";
import useUTMPreservation from "./hooks/useUTMPreservation.js";

const LandingPage = lazy(() => import("./components/Home/LandingPage.js"));
const TTRPGPage = lazy(() => import("./components/Home/TTRPGPage.js"));
const AboutPage = lazy(() => import("./components/About/AboutPage.js"));
const CharactersPage = lazy(() => import("./components/Characters/CharactersPage.js"));
const TermsPage = lazy(() => import("./components/TermsPage.js"));
const ContactPage = lazy(() => import("./components/ContactPage.js"));
const ErrorPage = lazy(() => import("./components/ErrorPage.js"));
const ArtbookDownloadPage = lazy(() => import("./components/ArtbookDownloadPage.js"));
const ThankYouPage = lazy(() => import("./components/ThankYouPage.js"));
const SignupPage = lazy(() => import("./components/SignupPage.js"));
const BuyPage = lazy(() => import("./components/BuyPage.js"));

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
  const isExternalRedirect = ["/rulebook"].includes(location.pathname);

  const [videoModalVisible, setVideoModalVisible] = useState(false);

  // Preserve UTM parameters across all page navigation
  useUTMPreservation();

  return (
    <>
      {!isExternalRedirect && <Banner />}
      {!isExternalRedirect && <Navbar videoModalVisible={videoModalVisible} />}
      <Suspense fallback={null}>
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
        <Route path="/buy" element={<BuyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        {/* Fallback for undefined routes */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
      </Suspense>
      {!isExternalRedirect && <Footer key={Date.now()} />}
    </>
  );
};

export default Router;
