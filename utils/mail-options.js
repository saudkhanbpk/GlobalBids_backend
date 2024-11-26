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

export const invoiceMailOptions = (transaction, email) => {
  return {
    to: email,
    subject: "Project Lead Price Invoice",
    html: `
      <h2 style="text-align: center; color: #4CAF50;">Invoice for Payment</h2>
      <p>Dear Contractor,</p>
      <p>Thank you for your payment. Please find below the details of your recent transaction.</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
          <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: left;">Description</th>
          <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; text-align: left;">Details</th>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Transaction ID</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${transaction.transactionId}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Project Name</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${transaction.title}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Homeowner Name</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${transaction.homeownerName}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Budget</td>
          <td style="border: 1px solid #ddd; padding: 8px;">$${transaction.amount}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Category</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${transaction.category}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Lead Price</td>
          <td style="border: 1px solid #ddd; padding: 8px;">$${transaction.leadPrice}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Card Number</td>
          <td style="border: 1px solid #ddd; padding: 8px;">**** **** **** ${transaction.cardDigit}</td>
        </tr>
      </table>
      <p style="margin-top: 20px;">Best regards,<br>Your Company</p>
    `,
  };
};
