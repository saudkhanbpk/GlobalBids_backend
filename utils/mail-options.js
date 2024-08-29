export const otpMailOptions = (otp, email) => {
  return {
    to: email,
    subject: "VERIFICATION-OTP",
    html: `
          <div style="font-family: sans-serif;">
              <h1 style="font-weight: lighter;"><strong>Global</strong>Bids</h1>
              <p>Your Otp is ${otp}</p>
          </div>`,
  };
};
