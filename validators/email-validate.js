export function validateEmail(email) {
  const emailRegex =
    /^(?![.\-_])([a-zA-Z0-9._-]+)(?<![.\-_])@(?!(?:-|\.)[a-zA-Z0-9-]+)[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}
