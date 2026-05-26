import { lazy, Suspense, useState } from "react";
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
const AboutPage = lazy(() => import("./components/About/AboutPage"));
const CharactersPage = lazy(() => import("./components/Characters/CharactersPage"));
const TermsPage = lazy(() => import("./components/TermsPage"));
const ContactPage = lazy(() => import("./components/ContactPage"));
const ErrorPage = lazy(() => import("./components/ErrorPage"));
const ArtbookDownloadPage = lazy(() => import("./components/ArtbookDownloadPage"));
const ThankYouPage = lazy(() => import("./components/ThankYouPage"));
const SignupPage = lazy(() => import("./components/SignupPage"));
const CheckoutPage = lazy(() => import("./components/CheckoutPage"));

const Router = () => {
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
  const isExternalRedirect = ["/rulebook", "/buy", "/blog"].includes(location.pathname);

  const [videoModalVisible, setVideoModalVisible] = useState(false);

  useUTMPreservation();

  return (
    <>
      {!isExternalRedirect && <Banner />}
      <Suspense fallback={null}>
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
          <Route path="/ttrpg" element={<Navigate to="/" replace />} />
          <Route path="/about" element={<Navigate to="/howtoplay" replace />} />
          <Route path="/howtoplay" element={<AboutPage />} />
          <Route path="/digitalartbook" element={<ArtbookDownloadPage />} />
          <Route path="/characters" element={<CharactersPage />} />
          <Route path="/characters/:name" element={<CharactersPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/thankyou" element={<ThankYouPage />} />
          <Route path="/rulebook" element={<ExternalRedirect url="/rulebook.pdf" />} />
          <Route path="/blog" element={<ExternalRedirect url="https://pegasusgames.medium.com" />} />
          <Route
            path="/buy"
            element={
              <ExternalRedirect
                url={
                  import.meta.env.DEV
                    ? import.meta.env.REACT_APP_STRIPE_TEST_URL
                    : import.meta.env.REACT_APP_STRIPE_PROD_URL
                }
              />
            }
          />
          <Route path="/cart" element={<Navigate to="/checkout" replace />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
        {!isExternalRedirect && <Footer />}
      </Suspense>
    </>
  );
};

export default Router;
