//  configuração adicional do Email complementando  o config >> mail.js
import nodemailer from 'nodemailer';
import { resolve } from 'path';
import exphbs from 'express-handlebars';
import nodemailerhbs from 'nodemailer-express-handlebars';
import mailConfig from '../config/mail';

class Mail {
  constructor(){
    const { host, port, secure, auth } = mailConfig;

    // transporter é como o nodemailer chama um serviço externo para enviar emails
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: auth.user ? auth : null,
    });

    // esse método configura os templates que estão em app>views>emails
    this.configureTemplates();
  };


  configureTemplates( ){
    const viewPath = resolve(__dirname, '..', 'app','views','emails')

    // o handlebars views age em cima desse método compile do nodemailer
    this.transporter.use(
      'compile',
      nodemailerhbs({
      viewEngine: exphbs.create({
        layoutsDir: resolve(viewPath, 'layouts'),
        partialsDir: resolve(viewPath, 'partials'),
        defaultLayout: 'default',
        extname: '.hbs'
      }),
      viewPath,
      extName: '.hbs'
    })
    )
  }


  // esse método envia o email
  sendMail(message) {
    return this.transporter.sendMail({
      ...mailConfig.default,
      ...message,
    }) // agora usa o sendMail lá no Appointment Controller
  }
}
export default new Mail();
