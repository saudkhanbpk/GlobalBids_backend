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

export const notificationMailOptions = (notifications, email) => {
  return {
    to: email,
    subject: "Notification",
    html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
    <div style="background-color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); padding: 30px;">
        <div style="background-color: #4a90e2; color: white; text-align: center; padding: 15px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">${notifications.type}</h1>
        </div>
        
        <div style="margin-top: 20px;">
            <p style="margin-bottom: 15px;">Hello ${notifications.recipientId.username},</p>
            
            <div style="background-color: #f9f9f9; border-left: 4px solid #4a90e2; padding: 15px; margin: 20px 0;">
                <p style="margin: 0;">${notifications.message}</p>
            </div>
            <a href="${process.env.REDIRECT_URL}/${notifications.url}" style="display: block; width: 200px; margin: 20px auto; padding: 12px 20px; background-color: #4a90e2; color: white; text-decoration: none; text-align: center; border-radius: 5px; font-weight: bold;">View Details</a>
            
            <p style="margin-top: 20px;">Sent by: ${notifications.senderId.username}</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
            <p style="margin: 10px 0;">© {{2024}} Globalbids. All rights reserved.</p>
            <p style="margin: 10px 0;">You received this email because you are a registered ${notifications.recipientId.username}.</p>
        </div>
    </div>
</div>`,
  };
};
