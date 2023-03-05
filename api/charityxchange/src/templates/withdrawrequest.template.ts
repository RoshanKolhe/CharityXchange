export default function generateWithdrawRequestSentTemplate() {
  const template = `<!DOCTYPE html>
    <html>
    <head>
        <title>Withdraw Request Successful</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f1f1f1;
                padding: 20px;
            }
            .container {
                background-color: #fff;
                border-radius: 5px;
                box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.2);
                padding: 20px;
                max-width: 600px;
                margin: 0 auto;
                text-align: center;
            }
            h1 {
                color: #008000;
                font-size: 36px;
                margin-top: 0;
            }
            p {
                font-size: 18px;
                margin-bottom: 20px;
            }
            .btn {
                background-color: #008000;
                color: #fff;
                padding: 10px 20px;
                border-radius: 5px;
                text-decoration: none;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Withdraw Request Successful</h1>
            <p>Your request for withdrawal has been successfully processed.</p>
            <p>The amount will be transferred to your designated account within the next 3-5 business days.</p>
        </div>
    </body>
    </html>`;
  const WithdrawRequestSentTemplate = {
    subject: 'Withdraw Request Successful',
    html: template,
  };
  return WithdrawRequestSentTemplate;
}
