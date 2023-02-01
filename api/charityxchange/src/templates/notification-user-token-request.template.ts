export default function generatenotificationUserTokenTemplate() {
  const template = `<!DOCTYPE html>
    <html>
    <head>
      <title>Payment Receipt Confirmation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          font-size: 14px;
        }
    
        h1 {
          text-align: center;
          font-size: 24px;
          font-weight: bold;
        }
    
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
    
        .message {
          font-size: 18px;
          text-align: center;
          margin-bottom: 30px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Payment Confirmation</h1>
        <div class="message">
          We have received your payment request. We will notify you once it has been processed by email. Thank you for your patience.
        </div>
      </div>
    </body>
    </html>`;
  const UserUSDTTOkenTemplate = {
    subject: 'Payment Receipt Confirmation',
    html: template,
  };
  return UserUSDTTOkenTemplate;
}
