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

const PAYMENT_LINK_URL = import.meta.env.DEV
  ? import.meta.env.REACT_APP_STRIPE_TEST_URL
  : import.meta.env.REACT_APP_STRIPE_PROD_URL;

const BuyGate = () => {
  const rollout = (import.meta.env.VITE_CHECKOUT_ROLLOUT as string) ?? "";
  const navigate = useNavigate();

  const useCustom = (() => {
    if (rollout === "100") return true;
    if (!rollout || rollout === "off") return false;
    const stored = sessionStorage.getItem("checkout_flow");
    if (stored === "custom" || stored === "payment_link") return stored === "custom";
    const isCustom = Math.random() < 0.5;
    sessionStorage.setItem("checkout_flow", isCustom ? "custom" : "payment_link");
    return isCustom;
  })();

  useEffect(() => {
    const flow = useCustom ? "custom_checkout" : "payment_link";

    if (useCustom) {
      // SPA nav keeps page alive so fire-and-forget is fine — hit ships before unload.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).gtag?.("event", "checkout_flow_assigned", { checkout_flow: flow });
      navigate("/checkout", { replace: true });
      return;
    }

    // Payment link: build target URL then fire GA4 event with event_callback so
    // the hit ships before we leave the SPA. 2 s timeout guards against gtag blocks.
    const buildUrl = () => {
      const currentParams = new URL(window.location.href).searchParams;
      const target = new URL(PAYMENT_LINK_URL);
      currentParams.forEach((v, k) => target.searchParams.set(k, v));
      const trackingKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];
      if (!trackingKeys.some((p) => currentParams.has(p))) {
        try {
          const stored = JSON.parse(sessionStorage.getItem("utm_params") || "{}") as Record<string, string>;
          Object.entries(stored).forEach(([k, v]) => target.searchParams.set(k, v));
        } catch { /* ignore corrupt storage */ }
      }
      return target.toString();
    };

    const redirect = () => window.location.replace(buildUrl());

    // 2s timer guarantees redirect even if gtag.js hasn't loaded yet; gtag.js typically
    // loads in ~500-1000ms so event_callback should fire before this in most cases
    const fallbackTimer = setTimeout(redirect, 2000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gtag = (window as any).gtag;
    if (gtag) {
      gtag("event", "checkout_flow_assigned", {
        checkout_flow: flow,
        event_callback: () => { clearTimeout(fallbackTimer); redirect(); },
      });
    }
  // useCustom and navigate are stable for the lifetime of this component mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // custom_checkout navigates instantly via SPA; payment_link waits up to 2s for gtag.js
  return useCustom ? null : (
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
