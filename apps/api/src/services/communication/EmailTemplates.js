export class EmailTemplates {
  static getBaseTemplate(content, header = 'A² ReVamp Gym') {
    return `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #0ea5e9;">
          <h1 style="color: #0ea5e9; margin: 0;">${header}</h1>
        </div>
        <div style="padding: 20px 0; font-size: 16px; line-height: 1.5;">
          ${content}
        </div>
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #777;">
          <p>© ${new Date().getFullYear()} A² ReVamp Gym. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    `;
  }

  static welcomeEmail(name) {
    const content = `
      <h3>Welcome to the A² ReVamp family, ${name}!</h3>
      <p>We're thrilled to have you onboard. Log in to your member portal to view your upcoming sessions, workouts, and diets.</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="display:inline-block; padding:10px 20px; background-color:#0ea5e9; color:white; text-decoration:none; border-radius:5px; margin-top:10px;">Go to Dashboard</a>
    `;
    return {
      subject: 'Welcome to A² ReVamp Gym!',
      html: this.getBaseTemplate(content)
    };
  }

  static invoiceEmail(name, invoiceNumber, amount) {
    const content = `
      <h3>Payment Successful!</h3>
      <p>Hi ${name},</p>
      <p>Your payment of <strong>₹${amount}</strong> was received successfully.</p>
      <p>Invoice Number: <strong>${invoiceNumber}</strong></p>
      <p>You can download your full PDF invoice from your Member Dashboard.</p>
    `;
    return {
      subject: `Payment Receipt: ${invoiceNumber}`,
      html: this.getBaseTemplate(content)
    };
  }

  static announcementEmail(title, body) {
    const content = `
      <h3>${title}</h3>
      <p>${body.replace(/\n/g, '<br>')}</p>
    `;
    return {
      subject: `Announcement: ${title}`,
      html: this.getBaseTemplate(content, 'A² ReVamp Updates')
    };
  }
}
