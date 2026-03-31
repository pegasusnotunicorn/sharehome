import { lazy, Suspense, useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router";
import MetaTags from "./components/MetaTags";
import Navbar from "./components/Navbar/Navbar";
import Banner from "./components/Banner";
import ScrollToTop from "./ScrollToTop";
import Footer from "./components/Footer";
import ExternalRedirect from "./components/ExternalRedirect";
import useUTMPreservation from "./hooks/useUTMPreservation";

const LandingPage = lazy(() => import("./components/Home/LandingPage"));
const TTRPGPage = lazy(() => import("./components/Home/TTRPGPage"));
const AboutPage = lazy(() => import("./components/About/AboutPage"));
const CharactersPage = lazy(() => import("./components/Characters/CharactersPage"));
const TermsPage = lazy(() => import("./components/TermsPage"));
const ContactPage = lazy(() => import("./components/ContactPage"));
const ErrorPage = lazy(() => import("./components/ErrorPage"));
const ArtbookDownloadPage = lazy(() => import("./components/ArtbookDownloadPage"));
const ThankYouPage = lazy(() => import("./components/ThankYouPage"));
const SignupPage = lazy(() => import("./components/SignupPage"));
const BuyPage = lazy(() => import("./components/BuyPage"));

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
      {!isExternalRedirect && <Footer />}
    </>
  );
};

export default Router;
