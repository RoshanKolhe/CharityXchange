export default function generateKycDeclineTemplate(userData: any) {
  const template = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>KYC Declined</title>
        <style>
          .container {
            width: 500px;
            margin: 0 auto;
            text-align: center;
            font-family: Arial, sans-serif;
          }
    
          h1 {
            font-size: 24px;
            color: #333;
            margin-bottom: 20px;
          }
    
          p {
            font-size: 18px;
            color: #333;
            margin-bottom: 20px;
          }
    
          .btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: #f44336;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>KYC Verification Declined</h1>
          <p>Dear ${userData.name},</p>
          <p>We're sorry to inform you that your KYC verification has been declined due to ${userData?.reason}.</p>
          <p>If you have any questions or concerns, please contact our support team for further assistance.</p>
          <a href="#" class="btn">Contact Support</a>
        </div>
      </body>
    </html>
    `;
  const UserKycTemplate = {
    subject: 'User Kyc Declined',
    html: template,
  };
  return UserKycTemplate;
}
