export default {
  host: process.env.MAIL_HOST, // 'smtp.mailtrap.io',
  port: process.env.MAIL_PORT, // '2525',
  secure: false,
  auth:{
    user: process.env.MAIL_USER,  // '7f72a06fb5411b',
    pass: process.env.MAIL_PASS, // 'e141b7b0f21058'
  },
  default:{
    from: 'Equipe GoBarber <noreply@gobarber.com>',
  }
}

// Amazon SES
// Mailgun
// Sparkpost
// Mandril(Mailchimp)

// Mailtrap (DEV)
