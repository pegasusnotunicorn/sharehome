// For logs: enough of a customer's email to tell orders apart, not the address itself.
// "jo.buyer@example.com" → "j***@example.com".
export function maskEmail(email) {
  if (typeof email !== "string" || !email.includes("@")) return email ? "***" : String(email);
  const [user, domain] = email.split("@");
  return `${user.slice(0, 1)}***@${domain}`;
}
