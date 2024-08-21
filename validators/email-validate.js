export function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const domainPart = email.split("@")[1];
  const consecutiveDotsRegex = /\.{2,}/;
  if (consecutiveDotsRegex.test(domainPart)) {
    return false;
  }

  return emailRegex.test(email);
}
