import nodemailer from 'nodemailer';
import { config } from '#config/env';
import { logger } from '#lib/logger';

class EmailService {
  constructor() {
    this.transporter = null;
    this.init();
  }

  init() {
    // Check if email is disabled
    if (config.EMAIL_ENABLED === 'false' || config.EMAIL_ENABLED === false) {
      console.log('📧 [EMAIL] Email service is DISABLED');
      return;
    }

    console.log(`📧 [EMAIL] Initializing email service in ${config.NODE_ENV} mode`);

    // If no SMTP config provided, use Ethereal (fake SMTP for testing)
    if (!config.EMAIL_SMTP_HOST || !config.EMAIL_USERNAME || !config.EMAIL_PASSWORD) {
      console.log('📧 [EMAIL] No SMTP credentials found. Using Ethereal test account...');
      this.setupTestAccount();
      return;
    }

    // Use real SMTP credentials
    this.transporter = nodemailer.createTransport({
      host: config.EMAIL_SMTP_HOST,
      port: parseInt(config.EMAIL_SMTP_PORT),
      secure: config.EMAIL_SMTP_PORT === '465',
      auth: {
        user: config.EMAIL_USERNAME,
        pass: config.EMAIL_PASSWORD,
      },
    });

    console.log('📧 [EMAIL] Email service initialized with real SMTP');
  }

  async setupTestAccount() {
    try {
      console.log('📧 [EMAIL] Creating Ethereal test account...');
      const testAccount = await nodemailer.createTestAccount();
      
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      
      console.log(`📧 [EMAIL] Ethereal account created:`);
      console.log(`📧 [EMAIL] Username: ${testAccount.user}`);
      console.log(`📧 [EMAIL] Password: ${testAccount.pass}`);
      console.log(`📧 [EMAIL] View emails at: https://ethereal.email`);
      console.log(`📧 [EMAIL] Login with the credentials above to see sent emails\n`);
      
    } catch (error) {
      console.error('❌ [EMAIL] Failed to create Ethereal account:', error.message);
      this.transporter = null;
    }
  }

  /**
   * Send verification email
   * @param {string} to - Recipient email
   * @param {string} token - Verification token
   * @param {string} firstName - User's first name
   * @returns {Promise<boolean>} Success status
   */
  async sendVerificationEmail(to, token, firstName = 'User') {
    // Always log the token in development for testing
    const verificationUrl = `${config.APP_URL}/api/auth/verify-email?token=${token}`;
    
    console.log(`\n📧 [EMAIL DEBUG] ==========================================`);
    console.log(`📧 [EMAIL DEBUG] VERIFICATION EMAIL DETAILS:`);
    console.log(`📧 [EMAIL DEBUG] To: ${to}`);
    console.log(`📧 [EMAIL DEBUG] Token: ${token}`);
    console.log(`📧 [EMAIL DEBUG] URL: ${verificationUrl}`);
    console.log(`📧 [EMAIL DEBUG] ==========================================\n`);

    if (!this.transporter) {
      console.log('📧 [EMAIL] No transporter available. Email would be sent in production.');
      console.log(`📧 [EMAIL] Verification URL for ${to}: ${verificationUrl}`);
      return true; // Return true so registration doesn't fail
    }

    const mailOptions = {
      from: `"Auth API" <${config.EMAIL_FROM}>`,
      to,
      subject: 'Verify Your Email Address',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background: #4F46E5; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0; 
            }
            .footer { 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 1px solid #eee; 
              color: #666; 
              font-size: 12px; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Auth API!</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
              
              <center>
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </center>
              
              <p>Or copy and paste this link in your browser:</p>
              <p><code>${verificationUrl}</code></p>
              
              <p>This link will expire in 24 hours.</p>
              
              <p>If you didn't create an account, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Auth API. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hi ${firstName},\n\nPlease verify your email address by clicking this link: ${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, you can safely ignore this email.`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      
      // If using Ethereal, show the preview URL
      if (config.EMAIL_SMTP_HOST === 'smtp.ethereal.email' || !config.EMAIL_SMTP_HOST) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log(`📧 [EMAIL] Verification email sent to Ethereal:`);
        console.log(`📧 [EMAIL] Preview URL: ${previewUrl}`);
      } else {
        console.log(`📧 [EMAIL] Verification email sent to ${to}: ${info.messageId}`);
      }
      
      return true;
    } catch (error) {
      console.error('❌ [EMAIL] Failed to send verification email:', error.message);
      return false;
    }
  }

  /**
   * Send password reset email
   * @param {string} to - Recipient email
   * @param {string} token - Password reset token
   * @param {string} firstName - User's first name
   * @returns {Promise<boolean>} Success status
   */
  async sendPasswordResetEmail(to, token, firstName = 'User') {
    const resetUrl = `${config.APP_URL}/api/password/reset?token=${token}`;
    
    console.log(`\n📧 [EMAIL DEBUG] ==========================================`);
    console.log(`📧 [EMAIL DEBUG] PASSWORD RESET EMAIL DETAILS:`);
    console.log(`📧 [EMAIL DEBUG] To: ${to}`);
    console.log(`📧 [EMAIL DEBUG] Token: ${token}`);
    console.log(`📧 [EMAIL DEBUG] URL: ${resetUrl}`);
    console.log(`📧 [EMAIL DEBUG] ==========================================\n`);

    if (!this.transporter) {
      console.log('📧 [EMAIL] No transporter available. Email would be sent in production.');
      return true;
    }

    const mailOptions = {
      from: `"Auth API" <${config.EMAIL_FROM}>`,
      to,
      subject: 'Reset Your Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #DC2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background: #DC2626; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0; 
            }
            .footer { 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 1px solid #eee; 
              color: #666; 
              font-size: 12px; 
            }
            .warning { 
              background: #FEF3C7; 
              border-left: 4px solid #F59E0B; 
              padding: 15px; 
              margin: 15px 0; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              
              <center>
                <a href="${resetUrl}" class="button">Reset Password</a>
              </center>
              
              <div class="warning">
                <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
              </div>
              
              <p>Or copy and paste this link in your browser:</p>
              <p><code>${resetUrl}</code></p>
              
              <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Auth API. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hi ${firstName},\n\nWe received a request to reset your password. Click this link to create a new password: ${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request a password reset, you can safely ignore this email.`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      
      if (config.EMAIL_SMTP_HOST === 'smtp.ethereal.email' || !config.EMAIL_SMTP_HOST) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log(`📧 [EMAIL] Password reset email sent to Ethereal:`);
        console.log(`📧 [EMAIL] Preview URL: ${previewUrl}`);
      } else {
        console.log(`📧 [EMAIL] Password reset email sent to ${to}: ${info.messageId}`);
      }
      
      return true;
    } catch (error) {
      console.error('❌ [EMAIL] Failed to send password reset email:', error.message);
      return false;
    }
  }

  /**
   * Send password changed confirmation email
   * @param {string} to - Recipient email
   * @param {string} firstName - User's first name
   * @returns {Promise<boolean>} Success status
   */
  async sendPasswordChangedEmail(to, firstName = 'User') {
    console.log(`📧 [EMAIL] Password change confirmation for ${to}`);

    if (!this.transporter) {
      console.log('📧 [EMAIL] No transporter available. Skipping email.');
      return true;
    }

    const mailOptions = {
      from: `"Auth API" <${config.EMAIL_FROM}>`,
      to,
      subject: 'Your Password Has Been Changed',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10B981; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .alert { 
              background: #F3F4F6; 
              border: 1px solid #D1D5DB; 
              padding: 15px; 
              border-radius: 5px; 
              margin: 15px 0; 
            }
            .footer { 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 1px solid #eee; 
              color: #666; 
              font-size: 12px; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Updated Successfully</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <p>This is a confirmation that your password has been successfully changed.</p>
              
              <div class="alert">
                <p><strong>Security Notice:</strong></p>
                <p>If you did not make this change, please contact our support team immediately.</p>
                <p>We recommend reviewing your account activity and ensuring your account security settings are up to date.</p>
              </div>
              
              <p>For your security, this change affects all devices where you are logged in.</p>
              
              <p>Thank you for helping us keep your account secure.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Auth API. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hi ${firstName},\n\nThis is a confirmation that your password has been successfully changed.\n\nIf you did not make this change, please contact our support team immediately.\n\nFor your security, this change affects all devices where you are logged in.\n\nThank you for helping us keep your account secure.`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📧 [EMAIL] Password change confirmation sent to ${to}: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('❌ [EMAIL] Failed to send password change confirmation:', error.message);
      return false;
    }
  }
}

export default new EmailService();