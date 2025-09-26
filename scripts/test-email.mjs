import 'dotenv/config';
import nodemailer from 'nodemailer';

const t = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT || 587),
  auth: process.env.EMAIL_SERVER_USER ? {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD
  } : undefined
});

const info = await t.sendMail({
  from: process.env.EMAIL_FROM,
  to: process.env.TEST_TO || 'you@example.com',
  subject: 'SMTP test',
  text: 'It works ✨'
});

console.log('Sent:', info.messageId);
