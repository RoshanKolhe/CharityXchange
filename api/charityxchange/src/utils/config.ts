const SITE_SETTINGS = {
  email: {
    type: 'smtp',
    host: 'smtp.hostinger.com',
    secure: true,
    port: 465,
    tls: {
      rejectUnauthorized: false,
    },
    auth: {
      user: 'crm@wolfizer.com',
      pass: 'Wolfizer@2020',
    },
  },
  fromMail: 'crm@wolfizer.com',
};
export default SITE_SETTINGS;
