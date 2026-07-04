import { lazy, Suspense, useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
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
const RafflePage = lazy(() => import("./components/RafflePage"));

// /buy is handled server-side by netlify/edge-functions/buy.js: flow assignment
// (checkout_flow cookie), the GA4 checkout_flow_assigned event, UTM forwarding,
// and payment-link attribution capture. This route only mounts on SPA
// navigations (Buy buttons are NavLinks), which never send a request to /buy —
// so force a full-page load of the same URL and let the edge function take over.
const BUY_EDGE_ATTEMPT_KEY = "buy_edge_attempt_at";

const BuyGate = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // If the edge function fell through (misconfigured env, plain `vite` dev
    // server), the full-page load lands right back here — a second mount within
    // 10s means reloading would loop, so degrade to the custom checkout, which
    // works without the edge function.
    const lastAttempt = Number(sessionStorage.getItem(BUY_EDGE_ATTEMPT_KEY) || 0);
    if (Date.now() - lastAttempt < 10_000) {
      navigate("/checkout", { replace: true });
      return;
    }
    sessionStorage.setItem(BUY_EDGE_ATTEMPT_KEY, String(Date.now()));
    window.location.replace(window.location.pathname + window.location.search);
    // Empty deps: this must run exactly once per mount — a re-run would trip
    // the 10s guard and hijack the in-flight redirect to /checkout.
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "sans-serif", color: "#888" }}>
      Redirecting to checkout…
    </div>
  );
};

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
          <Route path="/raffle" element={<RafflePage />} />
          <Route path="/thankyou" element={<ThankYouPage />} />
          <Route path="/rulebook" element={<ExternalRedirect url="/rulebook.pdf" />} />
          <Route path="/blog" element={<ExternalRedirect url="https://pegasusgames.medium.com" />} />
          <Route path="/buy" element={<BuyGate />} />
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
