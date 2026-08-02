import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    this.initTransporter();
  }

  private initTransporter() {
    const host = this.config.get<string>('email.host');
    const port = this.config.get<number>('email.port', 587);
    const user = this.config.get<string>('email.user');
    const pass = this.config.get<string>('email.pass');

    if (!user || !pass) {
      this.logger.warn('⚠️  SMTP credentials not configured. Emails will be skipped.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  private async sendMail(options: nodemailer.SendMailOptions): Promise<void> {
    if (!this.transporter) {
      this.logger.debug(`[Email] Would send to ${options.to}: ${options.subject}`);
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.config.get<string>('email.from'),
        ...options,
      });
      this.logger.log(`Email sent: ${info.messageId}`);
    } catch (error) {
      this.logger.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendVerificationEmail(user: { email: string; firstName: string }, token: string) {
    const frontendUrl = this.config.get<string>('frontendUrl', 'http://localhost:3000');
    const verifyUrl = `${frontendUrl}/api/v1/auth/verify-email?token=${token}`;

    await this.sendMail({
      to: user.email,
      subject: '✅ Verify your FitForge Pro email',
      html: this.getVerificationEmailHtml(user.firstName, verifyUrl),
    });
  }

  async sendPasswordResetEmail(user: { email: string; firstName: string }, token: string) {
    const frontendUrl = this.config.get<string>('frontendUrl', 'http://localhost:3000');
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;

    await this.sendMail({
      to: user.email,
      subject: '🔑 Reset your FitForge Pro password',
      html: this.getPasswordResetHtml(user.firstName, resetUrl),
    });
  }

  async sendWelcomeEmail(user: { email: string; firstName: string }) {
    await this.sendMail({
      to: user.email,
      subject: '🏋️ Welcome to FitForge Pro!',
      html: this.getWelcomeEmailHtml(user.firstName),
    });
  }

  async sendMembershipConfirmation(
    user: { email: string; firstName: string },
    membership: { planName: string; endDate: Date; amount: number },
  ) {
    await this.sendMail({
      to: user.email,
      subject: `🎉 Membership Activated - FitForge Pro`,
      html: this.getMembershipConfirmationHtml(user.firstName, membership),
    });
  }

  async sendMembershipExpiryReminder(
    user: { email: string; firstName: string },
    daysLeft: number,
  ) {
    await this.sendMail({
      to: user.email,
      subject: `⏰ Your FitForge Pro membership expires in ${daysLeft} days`,
      html: this.getExpiryReminderHtml(user.firstName, daysLeft),
    });
  }

  async sendContactFormAutoReply(name: string, email: string, inquiryType: string) {
    await this.sendMail({
      to: email,
      subject: '📩 We received your message - FitForge Pro',
      html: this.getContactAutoReplyHtml(name, inquiryType),
    });
  }

  // ─── Email Templates ────────────────────────────────────────────────────
  private getBaseTemplate(content: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FitForge Pro</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #0A0A0F; color: #ffffff; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .logo { text-align: center; margin-bottom: 40px; }
    .logo-text { font-size: 24px; font-weight: 900; color: #F5A623; letter-spacing: -0.5px; }
    .card { background: #12121a; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 32px; margin-bottom: 24px; }
    .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #F5A623, #E8912C); color: #0A0A0F; font-weight: 700; text-decoration: none; border-radius: 12px; font-size: 15px; margin: 16px 0; }
    .footer { text-align: center; font-size: 12px; color: rgba(255,255,255,0.3); margin-top: 32px; }
    h1 { font-size: 28px; color: #ffffff; margin: 0 0 16px; }
    p { color: rgba(255,255,255,0.6); line-height: 1.7; margin: 0 0 16px; }
    .gold { color: #F5A623; }
    .divider { height: 1px; background: rgba(255,255,255,0.08); margin: 24px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <div class="logo-text">⚡ FitForge Pro</div>
    </div>
    ${content}
    <div class="footer">
      <p>© ${new Date().getFullYear()} FitForge Pro. All rights reserved.</p>
      <p>123 Fitness Blvd, Bandra West, Mumbai 400050</p>
    </div>
  </div>
</body>
</html>`;
  }

  private getVerificationEmailHtml(firstName: string, verifyUrl: string): string {
    return this.getBaseTemplate(`
      <div class="card">
        <h1>Hi ${firstName}! 👋</h1>
        <p>Welcome to FitForge Pro. You're one step away from starting your fitness journey!</p>
        <p>Please verify your email address by clicking the button below:</p>
        <div style="text-align: center;">
          <a href="${verifyUrl}" class="btn">✅ Verify Email Address</a>
        </div>
        <div class="divider"></div>
        <p style="font-size: 13px;">This link expires in <span class="gold">24 hours</span>. If you didn't create an account, you can ignore this email.</p>
      </div>
    `);
  }

  private getPasswordResetHtml(firstName: string, resetUrl: string): string {
    return this.getBaseTemplate(`
      <div class="card">
        <h1>Password Reset 🔑</h1>
        <p>Hi ${firstName}, we received a request to reset your FitForge Pro password.</p>
        <div style="text-align: center;">
          <a href="${resetUrl}" class="btn">Reset My Password</a>
        </div>
        <div class="divider"></div>
        <p style="font-size: 13px;">This link expires in <span class="gold">1 hour</span>. If you didn't request a password reset, please ignore this email. Your account is safe.</p>
      </div>
    `);
  }

  private getWelcomeEmailHtml(firstName: string): string {
    return this.getBaseTemplate(`
      <div class="card">
        <h1>Welcome to FitForge Pro, ${firstName}! 🏋️</h1>
        <p>Your account is verified and ready to go. Here's what you can do next:</p>
        <ul style="color: rgba(255,255,255,0.6); line-height: 2;">
          <li>📱 Download the FitForge Pro app</li>
          <li>📋 Set up your fitness profile</li>
          <li>🏋️ Book your first trainer session</li>
          <li>📅 Join a group class</li>
        </ul>
        <div style="text-align: center;">
          <a href="https://fitforgepro.in/dashboard/member" class="btn">Go to Dashboard</a>
        </div>
      </div>
    `);
  }

  private getMembershipConfirmationHtml(
    firstName: string,
    membership: { planName: string; endDate: Date; amount: number },
  ): string {
    return this.getBaseTemplate(`
      <div class="card">
        <h1>Membership Activated! 🎉</h1>
        <p>Hi ${firstName}, your <span class="gold">${membership.planName}</span> membership is now active.</p>
        <div class="divider"></div>
        <p>📅 Valid until: <span class="gold">${membership.endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></p>
        <p>💰 Amount paid: <span class="gold">₹${membership.amount.toLocaleString('en-IN')}</span></p>
        <div class="divider"></div>
        <p>Show your QR code at the entrance for seamless check-in!</p>
        <div style="text-align: center;">
          <a href="https://fitforgepro.in/dashboard/member" class="btn">View My QR Code</a>
        </div>
      </div>
    `);
  }

  private getExpiryReminderHtml(firstName: string, daysLeft: number): string {
    return this.getBaseTemplate(`
      <div class="card">
        <h1>Membership Expiring Soon ⏰</h1>
        <p>Hi ${firstName}, your FitForge Pro membership expires in <span class="gold">${daysLeft} days</span>.</p>
        <p>Renew now to avoid losing access and keep your progress streak alive!</p>
        <div style="text-align: center;">
          <a href="https://fitforgepro.in/dashboard/member/membership" class="btn">Renew Membership</a>
        </div>
      </div>
    `);
  }

  private getContactAutoReplyHtml(name: string, inquiryType: string): string {
    return this.getBaseTemplate(`
      <div class="card">
        <h1>We got your message! 📩</h1>
        <p>Hi ${name}, thank you for reaching out to FitForge Pro about <span class="gold">${inquiryType}</span>.</p>
        <p>Our team will review your message and get back to you within <span class="gold">24 hours</span> during business days.</p>
        <p>In the meantime, feel free to explore our membership plans or use our free health calculators.</p>
        <div style="text-align: center;">
          <a href="https://fitforgepro.in" class="btn">Visit FitForge Pro</a>
        </div>
      </div>
    `);
  }
}
