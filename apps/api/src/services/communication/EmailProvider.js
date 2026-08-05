import nodemailer from 'nodemailer';
import prisma from '../../config/prisma.js';

class EmailProvider {
  constructor() {
    this.transporter = null;
    
    // In production, configure SMTP via env vars
    const host = process.env.SMTP_HOST || 'smtp.ethereal.email';
    const port = process.env.SMTP_PORT || 587;
    const user = process.env.SMTP_USER || 'dummy_user';
    const pass = process.env.SMTP_PASS || 'dummy_pass';

    if (user !== 'dummy_user') {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port == 465, 
        auth: { user, pass }
      });
    } else {
      console.warn('SMTP credentials missing. EmailProvider will run in MOCK mode.');
    }
  }

  async sendEmail(to, subject, html, text = '') {
    try {
      if (!this.transporter) {
        console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
        await this.logDelivery(to, 'EMAIL', subject, 'SENT');
        return true;
      }

      const info = await this.transporter.sendMail({
        from: `"A² ReVamp Gym" <${process.env.SMTP_FROM || 'noreply@a2revamp.com'}>`,
        to,
        subject,
        text,
        html,
      });

      console.log(`Email sent: ${info.messageId}`);
      await this.logDelivery(to, 'EMAIL', subject, 'SENT');
      return true;
    } catch (err) {
      console.error('Email sending failed:', err);
      await this.logDelivery(to, 'EMAIL', subject, 'FAILED', err.message);
      return false;
    }
  }

  async logDelivery(recipient, channel, subject, status, errorMessage = null) {
    try {
      await prisma.deliveryLog.create({
        data: { recipient, channel, subject, status, errorMessage }
      });
    } catch (e) {
      console.error('Failed to log delivery:', e);
    }
  }
}

export default new EmailProvider();
