import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT);
const user = process.env.SMTP_USER;
const passwd = process.env.SMTP_PASSWORD;

if (!host || !user || !passwd) {
  throw new Error('Brak konfiguracji SMTP w pliku .env');
}

const transportOptions: SMTPTransport.Options = {
  // or: service: "gmail", // Shortcut for Gmail's SMTP settings - see Well-Known Services
  // https://nodemailer.com/usage/using-gmail
  host: host,
  port: port,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: user,
    pass: passwd,
  },
};

export const transporter = nodemailer.createTransport(transportOptions);

export const mailOptions = {
  from: process.env.EMAIL_FROM,
};
