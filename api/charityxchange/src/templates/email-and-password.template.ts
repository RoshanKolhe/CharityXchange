export default function generateEmailAndPasswordTemplate(mailOptions: any) {
  const template = `<!DOCTYPE html>
    <html>
    <head>
        <title>CharityXchange Credentials</title>
    </head>
    <body>
        <p>Dear ${mailOptions.name},</p>
        <p>Please find attached the Credential details for our platform. Completed your KYC and start earning</p>
        <p>Email: ${mailOptions.email}</p>
        <p>Password: ${mailOptions.password}</p>
        <p>If you have any questions or concerns, please do not hesitate to contact us.</p>
        <p>Thank you for your attention .</p>
        <p>Best regards,</p>
        <p>CharityXchange</p>
    </body>
    </html>`;
  const EmailAndPasswordTemplate = {
    subject: 'CharityXchange Credentials',
    html: template,
  };
  return EmailAndPasswordTemplate;
}
