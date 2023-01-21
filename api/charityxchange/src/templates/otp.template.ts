export default function generateOtpTemplate(mailOptions: any) {
  const template = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>OTP Email</title>
        <style>
            body {
                font-family: Arial, sans-serif;
            }
            .otp-box {
                background-color: #f9f9f9;
                border: 1px solid #ccc;
                padding: 20px;
                margin: 20px;
                text-align: center;
            }
            .otp-code {
                font-size: 36px;
                font-weight: bold;
                color: #ff6600;
                margin-bottom: 10px;
            }
        </style>
    </head>
    <body>
        <div class="otp-box">
            <h1>One-Time Password (OTP)</h1>
            <p>As a security measure, we have generated a one-time password (OTP) for your account. Please use the following code to complete your login or transaction:</p>
            <div class="otp-code">${mailOptions.otp}</div>
            <p>Please note that this code is valid for a limited time and can only be used once. If you did not initiate this request, please contact us immediately.</p>
            <p>Thank you for your cooperation and understanding.</p>
        </div>
    </body>
    </html>
    `;
  const OtpTemplate = {
    subject: 'One-Time Password (OTP)',
    html: template,
  };
  return OtpTemplate;
}
