export default function generateEmailAndPasswordTemplate(mailOptions: any) {
  const template = `<!DOCTYPE html>
    <html>
    <head>
        <title>CharityXchange Credentials</title>
    </head>
    <style>
      a {
        display: inline-block;
        padding: 10px 20px;
        text-align: center;
        text-decoration: none;
        background-color: green;
        color: white;
        border-radius: 5px;
      }
    </style>
    <body>
        <p>Dear ${mailOptions.name},</p>
        <p>Please find attached the Credential details for our platform. Completed your KYC and start earning</p>
        <p>Email: ${mailOptions.email}</p>
        <p>Password: ${mailOptions.password}</p>
        <a href=${process.env.REACT_APP_LOGIN_ENDPOINT} target="_blank">Click here</a>
        <p>Please use above link to complete your kyc and get started.</p>
        <p>If you have any questions or concerns, please do not hesitate to contact us.</p>
        <p>Thank you for your attention .</p>
        <p>Best regards,</p>
        <p>CharityXchange</p>

        <p>${mailOptions.name} yang dihormati,,</p>
        <p>Sila dapatkan butiran Kredensial yang dilampirkan untuk platform kami. Selesaikan KYC anda dan mula menjana pendapatan</p>
        <p>Email: ${mailOptions.email}</p>
        <p>Password: ${mailOptions.password}</p>
        <a href=${process.env.REACT_APP_LOGIN_ENDPOINT} target="_blank">Click here</a>
        <p>Sila gunakan pautan di atas untuk melengkapkan kyc anda dan mulakan.</p>
        <p>
        Jika anda mempunyai sebarang pertanyaan atau kebimbangan, jangan teragak-agak untuk menghubungi kami.</p>
        <p>Terima kasih kerana memberi perhatian .</p>
        <p>Selamat sejahtera,</p>
        <p>CharityXchange</p>
    </body>
    </html>`;
  const EmailAndPasswordTemplate = {
    subject: 'CharityXchange Credentials',
    html: template,
  };
  return EmailAndPasswordTemplate;
}
