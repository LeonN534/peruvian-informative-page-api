import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();

const transporter: Transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER,
  port: +process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true' ? true : false,
  auth: {
    user: process.env.SMTP_LOGIN,
    pass: process.env.SMTP_KEY,
  },
});

export default transporter;
