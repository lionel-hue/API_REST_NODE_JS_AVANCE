import nodemailer from 'nodemailer';
import { config } from '#config/env';
import { logger } from '#lib/logger';

class EmailService {
  constructor(***REMOVED*** {
    this.transporter = null;
    this.init(***REMOVED***;
  }

  init(***REMOVED*** {
    // Check if email is disabled
    if (config.EMAIL_ENABLED === 'false' || config.EMAIL_ENABLED === false***REMOVED*** {
      console.log('📧 [EMAIL] Email service is DISABLED'***REMOVED***;
      return;
    }

    console.log(`📧 [EMAIL] Initializing email service in ${config.NODE_ENV} mode`***REMOVED***;

    // If no SMTP config provided, use Ethereal (fake SMTP for testing***REMOVED***
    if (!config.EMAIL_SMTP_HOST || !config.EMAIL_USERNAME || !config.EMAIL_PASSWORD***REMOVED*** {
      console.log('📧 [EMAIL] No SMTP credentials found. Using Ethereal test account...'***REMOVED***;
      this.setupTestAccount(***REMOVED***;
      return;
    }

    // Use real SMTP credentials
    this.transporter = nodemailer.createTransport({
      host: config.EMAIL_SMTP_HOST,
      port: parseInt(config.EMAIL_SMTP_PORT***REMOVED***,
      secure: config.EMAIL_SMTP_PORT === '465',
      auth: {
        user: config.EMAIL_USERNAME,
        pass: config.EMAIL_PASSWORD,
      },
    }***REMOVED***;

    console.log('📧 [EMAIL] Email service initialized with real SMTP'***REMOVED***;
  }

  async setupTestAccount(***REMOVED*** {
    try {
      console.log('📧 [EMAIL] Creating Ethereal test account...'***REMOVED***;
      const testAccount = await nodemailer.createTestAccount(***REMOVED***;
      
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      }***REMOVED***;
      
      console.log(`📧 [EMAIL] Ethereal account created:`***REMOVED***;
      console.log(`📧 [EMAIL] Username: ${testAccount.user}`***REMOVED***;
      console.log(`📧 [EMAIL] Password: ${testAccount.pass}`***REMOVED***;
      console.log(`📧 [EMAIL] View emails at: https://ethereal.email`***REMOVED***;
      console.log(`📧 [EMAIL] Login with the credentials above to see sent emails\n`***REMOVED***;
      
    } catch (error***REMOVED*** {
      console.error('❌ [EMAIL] Failed to create Ethereal account:', error.message***REMOVED***;
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
  async sendVerificationEmail(to, token, firstName = 'User'***REMOVED*** {
    // Always log the token in development for testing
    const verificationUrl = `${config.APP_URL}/api/auth/verify-email?token=${token}`;
    
    console.log(`\n📧 [EMAIL DEBUG] ==========================================`***REMOVED***;
    console.log(`📧 [EMAIL DEBUG] VERIFICATION EMAIL DETAILS:`***REMOVED***;
    console.log(`📧 [EMAIL DEBUG] To: ${to}`***REMOVED***;
    console.log(`📧 [EMAIL DEBUG] Token: ${token}`***REMOVED***;
    console.log(`📧 [EMAIL DEBUG] URL: ${verificationUrl}`***REMOVED***;
    console.log(`📧 [EMAIL DEBUG] ==========================================\n`***REMOVED***;

    if (!this.transporter***REMOVED*** {
      console.log('📧 [EMAIL] No transporter available. Email would be sent in production.'***REMOVED***;
      console.log(`📧 [EMAIL] Verification URL for ${to}: ${verificationUrl}`***REMOVED***;
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
              <p>© ${new Date(***REMOVED***.getFullYear(***REMOVED***} Auth API. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hi ${firstName},\n\nPlease verify your email address by clicking this link: ${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, you can safely ignore this email.`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions***REMOVED***;
      
      // If using Ethereal, show the preview URL
      if (config.EMAIL_SMTP_HOST === 'smtp.ethereal.email' || !config.EMAIL_SMTP_HOST***REMOVED*** {
        const previewUrl = nodemailer.getTestMessageUrl(info***REMOVED***;
        console.log(`📧 [EMAIL] Verification email sent to Ethereal:`***REMOVED***;
        console.log(`📧 [EMAIL] Preview URL: ${previewUrl}`***REMOVED***;
      } else {
        console.log(`📧 [EMAIL] Verification email sent to ${to}: ${info.messageId}`***REMOVED***;
      }
      
      return true;
    } catch (error***REMOVED*** {
      console.error('❌ [EMAIL] Failed to send verification email:', error.message***REMOVED***;
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
  async sendPasswordResetEmail(to, token, firstName = 'User'***REMOVED*** {
    const resetUrl = `${config.APP_URL}/api/password/reset?token=${token}`;
    
    console.log(`\n📧 [EMAIL DEBUG] ==========================================`***REMOVED***;
    console.log(`📧 [EMAIL DEBUG] PASSWORD RESET EMAIL DETAILS:`***REMOVED***;
    console.log(`📧 [EMAIL DEBUG] To: ${to}`***REMOVED***;
    console.log(`📧 [EMAIL DEBUG] Token: ${token}`***REMOVED***;
    console.log(`📧 [EMAIL DEBUG] URL: ${resetUrl}`***REMOVED***;
    console.log(`📧 [EMAIL DEBUG] ==========================================\n`***REMOVED***;

    if (!this.transporter***REMOVED*** {
      console.log('📧 [EMAIL] No transporter available. Email would be sent in production.'***REMOVED***;
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
              <p>© ${new Date(***REMOVED***.getFullYear(***REMOVED***} Auth API. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hi ${firstName},\n\nWe received a request to reset your password. Click this link to create a new password: ${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request a password reset, you can safely ignore this email.`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions***REMOVED***;
      
      if (config.EMAIL_SMTP_HOST === 'smtp.ethereal.email' || !config.EMAIL_SMTP_HOST***REMOVED*** {
        const previewUrl = nodemailer.getTestMessageUrl(info***REMOVED***;
        console.log(`📧 [EMAIL] Password reset email sent to Ethereal:`***REMOVED***;
        console.log(`📧 [EMAIL] Preview URL: ${previewUrl}`***REMOVED***;
      } else {
        console.log(`📧 [EMAIL] Password reset email sent to ${to}: ${info.messageId}`***REMOVED***;
      }
      
      return true;
    } catch (error***REMOVED*** {
      console.error('❌ [EMAIL] Failed to send password reset email:', error.message***REMOVED***;
      return false;
    }
  }

  /**
   * Send password changed confirmation email
   * @param {string} to - Recipient email
   * @param {string} firstName - User's first name
   * @returns {Promise<boolean>} Success status
   */
  async sendPasswordChangedEmail(to, firstName = 'User'***REMOVED*** {
    console.log(`📧 [EMAIL] Password change confirmation for ${to}`***REMOVED***;

    if (!this.transporter***REMOVED*** {
      console.log('📧 [EMAIL] No transporter available. Skipping email.'***REMOVED***;
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
              <p>© ${new Date(***REMOVED***.getFullYear(***REMOVED***} Auth API. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hi ${firstName},\n\nThis is a confirmation that your password has been successfully changed.\n\nIf you did not make this change, please contact our support team immediately.\n\nFor your security, this change affects all devices where you are logged in.\n\nThank you for helping us keep your account secure.`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions***REMOVED***;
      console.log(`📧 [EMAIL] Password change confirmation sent to ${to}: ${info.messageId}`***REMOVED***;
      return true;
    } catch (error***REMOVED*** {
      console.error('❌ [EMAIL] Failed to send password change confirmation:', error.message***REMOVED***;
      return false;
    }
  }
}

export default new EmailService(***REMOVED***;