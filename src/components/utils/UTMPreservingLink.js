import { NavLink } from "react-router";

const UTMPreservingLink = ({ to, children, ...props }) => {
  const handleClick = (e) => {
    // Only preserve UTM for /buy links
    if (to === "/buy") {
      e.preventDefault();

      // Get current URL parameters
      const currentUrl = new URL(window.location.href);
      const currentParams = currentUrl.searchParams;

      // Create the target URL with UTM parameters
      const targetUrl = new URL(to, window.location.origin);

      // Preserve UTM parameters and other tracking parameters
      const trackingParams = [
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_term",
        "utm_content",
        "gclid",
        "fbclid",
      ];

      trackingParams.forEach((param) => {
        if (currentParams.has(param)) {
          targetUrl.searchParams.set(param, currentParams.get(param));
        }
      });

      // Navigate to the URL with preserved parameters
      window.location.href = targetUrl.toString();
    }
    // For all other links, let the default NavLink behavior handle it
  };

  return (
    <NavLink to={to} onClick={handleClick} {...props}>
      {children}
    </NavLink>
  );
};

export default UTMPreservingLink;
