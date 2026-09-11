import { env } from "@/config/env.config.js";

interface PasswordResetEmailData {
  email: string;
  name: string;
  resetToken: string;
}

export const buildPasswordResetEmail = ({
  email,
  name,
  resetToken,
}: PasswordResetEmailData) => {
  const resetUrl = `${env.appURL}/reset-password?email=${encodeURIComponent(
    email,
  )}&token=${encodeURIComponent(resetToken)}`;

  return {
    subject: "Reset your Salon Booking password",

    text: `
Hello ${name},

We received a request to reset your Salon Booking account password.

Use the following link to reset your password:

${resetUrl}

This link will expire in ${env.passwordResetExpiresMinutes} minutes.

If you did not request a password reset, you can safely ignore this email.

For security reasons, do not share this link with anyone.

Regards,
Salon Booking Team
      `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <title>Reset Password</title>
</head>

<body
  style="
    margin: 0;
    padding: 0;
    background-color: #f5f5f5;
    font-family: Arial, sans-serif;
  "
>
  <div
    style="
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      padding: 40px;
      border-radius: 8px;
    "
  >

    <h2>
      Reset your password
    </h2>

    <p>
      Hello ${name},
    </p>

    <p>
      We received a request to reset the
      password for your Salon Booking account.
    </p>

    <p>
      Click the button below to create a
      new password.
    </p>

    <p>
      <a
        href="${resetUrl}"
        style="
          display: inline-block;
          padding: 12px 24px;
          background: #000000;
          color: #ffffff;
          text-decoration: none;
          border-radius: 6px;
        "
      >
        Reset Password
      </a>
    </p>

    <p>
      This link will expire in
      <strong>
        ${env.passwordResetExpiresMinutes}
        minutes
      </strong>.
    </p>

    <p>
      If you did not request a password reset,
      you can safely ignore this email.
    </p>

    <p>
      Regards,<br />
      Salon Booking Team
    </p>

  </div>
</body>
</html>
      `.trim(),
  };
};

export const buildPasswordResetEmailSuccess = () => {
  return {
    subject: "Password Reset Successful",
    text: "Your password has been reset successfully",
    html: `
         <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Successful</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            background-color: #f9fafb;
            color: #111827;
          }

          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          }

          .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 40px 30px;
            text-align: center;
          }

          .header-icon {
            font-size: 48px;
            margin-bottom: 16px;
            animation: pulse 2s ease-in-out infinite;
          }

          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 0.8;
            }
            50% {
              transform: scale(1.1);
              opacity: 1;
            }
            100% {
              transform: scale(1);
              opacity: 0.8;
            }
          }

          .header-title {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
          }

          .header-subtitle {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
          }

          .content {
            padding: 40px 30px;
          }

          .message {
            text-align: center;
            margin-bottom: 32px;
          }

          .success-icon {
            font-size: 64px;
            color: #10b981;
            margin-bottom: 20px;
            animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          @keyframes popIn {
            from {
              transform: scale(0);
              opacity: 0;
            }
            60% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
            }
          }

          .message h2 {
            color: #111827;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 12px;
          }

          .message-text {
            color: #4b5563;
            font-size: 16px;
            line-height: 1.8;
            max-width: 450px;
            margin: 0 auto;
          }

          .info-box {
            background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
            border: 2px solid #dcfce7;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 32px;
            text-align: center;
          }

          .info-icon {
            font-size: 40px;
            margin-bottom: 12px;
            color: #10b981;
          }

          .info-title {
            color: #111827;
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 8px;
          }

          .info-text {
            color: #4b5563;
            font-size: 15px;
            line-height: 1.6;
          }

          .footer {
            padding: 24px 30px;
            background-color: #f9fafb;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }

          .footer-text {
            color: #9ca3af;
            font-size: 14px;
            margin-bottom: 12px;
          }

          .support-link {
            color: #10b981;
            text-decoration: none;
            font-weight: 600;
            transition: color 0.2s ease;
          }

          .support-link:hover {
            color: #059669;
            text-decoration: underline;
          }

          @media (max-width: 640px) {
            .container {
              margin: 0;
              border-radius: 0;
            }

            .header {
              padding: 32px 20px;
            }

            .content {
              padding: 32px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header Section -->
          <div class="header">
            <div class="header-icon">🔓</div>
            <h1 class="header-title">Authentication Notification</h1>
            <p class="header-subtitle">Your account security is our priority</p>
          </div>

          <!-- Content Section -->
          <div class="content">
            <!-- Message Section -->
            <div class="message">
              <div class="success-icon">✅</div>
              <h2>Password Reset Successful</h2>
              <p class="message-text">
                We're happy to inform you that your password has been successfully reset. You can now 
                log in to your account with your new password.
              </p>
            </div>

            <!-- Info Box -->
            <div class="info-box">
              <div class="info-icon">🛡️</div>
              <h3 class="info-title">Important Security Information</h3>
              <p class="info-text">
                If you did not initiate this password change, please contact our support team immediately 
                at ${env.smtp.mailFrom} or reply to this email to secure your account.
              </p>
            </div>

            <!-- Safe Login Reminder -->
            <div style="text-align: center; margin-bottom: 32px;">
              <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">
                Remember to always use strong, unique passwords for your accounts.
              </p>
            </div>
          </div>

          <!-- Footer Section -->
          <div class="footer">
            <p class="footer-text">
              This is an automated notification. Please do not reply to this email.
            </p>
            <p class="footer-text">
              &copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.
            </p>
            <a href="${env.appURL}" class="support-link">Visit Our Website</a>
          </div>
        </div>
      </body>
      </html>`,
  };
};

export const buildSendOTPEmail = (otp: string) => {
  return {
    subject: "OTP Verification",
    text: `Your OTP is ${otp}`,
    html: `
         <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Requested</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            background-color: #f9fafb;
            color: #111827;
          }

          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          }

          .header {
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
            padding: 40px 30px;
            text-align: center;
          }

          .header-icon {
            font-size: 48px;
            margin-bottom: 16px;
            animation: pulse 2s ease-in-out infinite;
          }

          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 0.8;
            }
            50% {
              transform: scale(1.1);
              opacity: 1;
            }
            100% {
              transform: scale(1);
              opacity: 0.8;
            }
          }

          .header-title {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
          }

          .header-subtitle {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
          }

          .content {
            padding: 40px 30px;
          }

          .message {
            text-align: center;
            margin-bottom: 32px;
          }

          .otp-icon {
            font-size: 64px;
            color: #6366f1;
            margin-bottom: 20px;
            animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          @keyframes popIn {
            from {
              transform: scale(0);
              opacity: 0;
            }
            60% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
            }
          }

          .message h2 {
            color: #111827;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 12px;
          }

          .message-text {
            color: #4b5563;
            font-size: 16px;
            line-height: 1.8;
            max-width: 450px;
            margin: 0 auto;
          }

          .otp-box {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border: 2px solid #dbeafe;
            border-radius: 12px;
            padding: 32px 24px;
            margin: 32px 0;
            text-align: center;
          }

          .otp-code-label {
            color: #4b5563;
            font-size: 15px;
            margin-bottom: 12px;
            display: block;
          }

          .otp-code {
            font-family: 'Courier New', Courier, monospace;
            font-size: 36px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: 8px;
            display: inline-block;
            padding: 16px 32px;
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
            color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 12px -2px rgba(99, 102, 241, 0.4);
          }

          .otp-expiry {
            color: #94a3b8;
            font-size: 14px;
            margin-top: 12px;
            display: block;
          }

          .warning-box {
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            border: 2px solid #fecaca;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 32px;
            text-align: center;
          }

          .warning-icon {
            font-size: 40px;
            margin-bottom: 12px;
            color: #ef4444;
          }

          .warning-title {
            color: #111827;
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 8px;
          }

          .warning-text {
            color: #4b5563;
            font-size: 15px;
            line-height: 1.6;
          }

          .footer {
            padding: 24px 30px;
            background-color: #f9fafb;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }

          .footer-text {
            color: #9ca3af;
            font-size: 14px;
            margin-bottom: 12px;
          }

          .support-link {
            color: #6366f1;
            text-decoration: none;
            font-weight: 600;
            transition: color 0.2s ease;
          }

          .support-link:hover {
            color: #4f46e5;
            text-decoration: underline;
          }

          @media (max-width: 640px) {
            .container {
              margin: 0;
              border-radius: 0;
            }

            .header {
              padding: 32px 20px;
            }

            .content {
              padding: 32px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header Section -->
          <div class="header">
            <div class="header-icon">🔒</div>
            <h1 class="header-title">Authentication Notification</h1>
            <p class="header-subtitle">Your account security is our priority</p>
          </div>

          <!-- Content Section -->
          <div class="content">
            <!-- Message Section -->
            <div class="message">
              <div class="otp-icon">🔐</div>
              <h2>One-Time Password (OTP)</h2>
              <p class="message-text">
                Please use the verification code below to complete your request. This code will 
                expire in 10 minutes for security reasons.
              </p>
            </div>
            <!-- OTP Box -->
            <div class="otp-box">
              <span class="otp-code-label">Verification Code</span>
              <div class="otp-code">${otp}</div>
              <span class="otp-expiry">Expires in 10 minutes</span>
            </div>
            <div class="warning-box">
              <div class="warning-icon">⚠️</div>
              <h3 class="warning-title">Security Reminder</h3>
              <p class="warning-text">
                Never share your OTP with anyone. Our staff will never ask for your OTP. 
                If you receive any suspicious requests, please report them immediately.
              </p>
            </div>
          </div>
          <!-- Footer Section -->
          <div class="footer">
            <p class="footer-text">
              This is an automated notification. Please do not reply to this email.
            </p>
            <p class="footer-text">
              &copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.
            </p>
            <a href="${env.appURL}" class="support-link">Visit Our Website</a>
          </div>
        </div>
      </body>
      </html>`,
  };
};
