export default function generateCongratulationsTemplate() {
  const template = `<html>
    <head>
      <meta charset="utf-8">
      <title>Thank you for Participating!</title>
    </head>
    <body>
      <h1>Thank you for Participating!</h1>
      <p>We appreciate your participation in our program, and we're happy to inform you that the reward for this cycle has been sent to you.</p>
      <p>It will be credited to your account shortly. If you have any questions or concerns, please feel free to contact us.</p>
      <p>Thank you again for your participation, and we look forward to working with you in the future!</p>
    </body>
  </html>`;
  const CongratulationsTemplate = {
    subject: 'Thank you for Participating!',
    html: template,
  };
  return CongratulationsTemplate;
}
