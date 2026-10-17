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
import useTrackingTags from "./hooks/useTrackingTags";
import { SocialIconDefs } from "./components/utils/SocialIcons";
import ErrorBoundary from "./components/utils/ErrorBoundary";
import { session } from "./utils/safeStorage";
import { BLOG_URL } from "./utils/links";

const LandingPage = lazy(() => import("./components/Home/LandingPage"));
const AboutPage = lazy(() => import("./components/About/AboutPage"));
const CharactersPage = lazy(() => import("./components/Characters/CharactersPage"));
const TermsPage = lazy(() => import("./components/TermsPage"));
const PrivacyPage = lazy(() => import("./components/PrivacyPage"));
const ContactPage = lazy(() => import("./components/ContactPage"));
const ErrorPage = lazy(() => import("./components/ErrorPage"));
const ArtbookDownloadPage = lazy(() => import("./components/ArtbookDownloadPage"));
const ThankYouPage = lazy(() => import("./components/ThankYouPage"));
const SignupPage = lazy(() => import("./components/SignupPage"));
const CheckoutPage = lazy(() => import("./components/CheckoutPage"));
const RafflePage = lazy(() => import("./components/RafflePage"));
const PlayPage = lazy(() => import("./components/Play/PlayPage"));

// /buy is handled server-side by netlify/edge-functions/buy.js: the GA4
// checkout_flow_assigned event and UTM forwarding onto the /checkout redirect.
// Buy buttons skip it (they go to /checkout and beacon /buy for the event), so
// this route only mounts if an in-app link to /buy is added — those never send
// a request to /buy, so force a full-page load and let the edge function take
// over.
// /cart is an old name for /checkout: the query (UTMs, a recovery email's address) goes along.
const CartRedirect = () => {
  const { search } = useLocation();
  return <Navigate to={{ pathname: "/checkout", search }} replace />;
};

const BUY_EDGE_ATTEMPT_KEY = "buy_edge_attempt_at";

const BuyGate = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // If the edge function fell through (misconfigured env, plain `vite` dev
    // server), the full-page load lands right back here — a second mount within
    // 10s means reloading would loop, so degrade to the custom checkout, which
    // works without the edge function.
    const lastAttempt = Number(session.get(BUY_EDGE_ATTEMPT_KEY) || 0);
    if (Date.now() - lastAttempt < 10_000) {
      navigate("/checkout", { replace: true });
      return;
    }
    session.set(BUY_EDGE_ATTEMPT_KEY, String(Date.now()));
    window.location.replace(window.location.pathname + window.location.search);
    // Empty deps: this must run exactly once per mount — a re-run would trip
    // the 10s guard and hijack the in-flight redirect to /checkout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "sans-serif", color: "#888" }}>
      Redirecting to checkout…
    </div>
  );
};

// (to the page's content, without a #main left in the address)
const skipToMain = (e: React.MouseEvent) => {
  const main = document.getElementById("main");
  if (!main) return;
  e.preventDefault();
  main.focus();
  main.scrollIntoView();
};

const Router = () => {
  return (
    <BrowserRouter>
      <MetaTags />
      <SocialIconDefs />
      <ScrollToTop />
      <AppRoutes />
    </BrowserRouter>
  );
};

const AppRoutes = () => {
  const location = useLocation();
  const isExternalRedirect = ["/rulebook", "/buy", "/blog"].includes(location.pathname);
  // (an online game room is played full screen: no banner or navbar over the table)
  const inRoom = location.pathname.startsWith("/play/");

  const [trailerPlaying, setTrailerPlaying] = useState(false);

  useTrackingTags();

  return (
    <>
      {/* (the first thing Tab reaches: straight past the banner and the top bar to the page itself) */}
      <a className="skip-link" href="#main" onClick={skipToMain}>
        Skip to content
      </a>
      {!isExternalRedirect && !inRoom && <Banner />}
      {/* (a page that crashes, or whose code can't be loaded: a "reload" page, not a blank one) */}
      <ErrorBoundary resetKey={location.pathname}>
        <Suspense fallback={null}>
          {!isExternalRedirect && !inRoom && <Navbar trailerPlaying={trailerPlaying} />}
          <main id="main" tabIndex={-1}>
            <Routes>
              <Route path="/" element={<LandingPage setTrailerPlaying={setTrailerPlaying} />} />
              <Route path="/ttrpg" element={<Navigate to="/" replace />} />
              <Route path="/about" element={<Navigate to="/howtoplay" replace />} />
              <Route path="/howtoplay" element={<AboutPage />} />
              <Route path="/digitalartbook" element={<ArtbookDownloadPage />} />
              <Route path="/characters" element={<CharactersPage />} />
              <Route path="/characters/:name" element={<CharactersPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/raffle" element={<RafflePage />} />
              <Route path="/play" element={<PlayPage />} />
              <Route path="/play/:code" element={<PlayPage />} />
              <Route path="/thankyou" element={<ThankYouPage />} />
              <Route path="/rulebook" element={<ExternalRedirect url="/rulebook.pdf" />} />
              <Route path="/blog" element={<ExternalRedirect url={BLOG_URL} />} />
              <Route path="/buy" element={<BuyGate />} />
              <Route path="/cart" element={<CartRedirect />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="*" element={<ErrorPage />} />
            </Routes>
          </main>
          {!isExternalRedirect && <Footer />}
        </Suspense>
      </ErrorBoundary>
    </>
  );
};

export default Router;
