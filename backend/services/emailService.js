import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';
import { query } from '../config/db.js';

dotenv.config();

// Create nodemailer transporter
const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT || 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromEmail = process.env.SMTP_FROM || 'no-reply@naturesip.com';

const isSmtpConfigured = smtpHost && smtpUser && smtpPass;

let transporter = null;

if (isSmtpConfigured) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort),
    secure: parseInt(smtpPort) === 465, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass
    },
    family: 4 // Force IPv4 to prevent ENETUNREACH on environments lacking IPv6 outbound routing
  });
  logger.info("📧 Nodemailer SMTP Transporter configured successfully.");
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ SMTP connection failed:', error.message);
    } else {
      console.log('📡 SMTP Server is ready to take our messages');
    }
  });
} else {
  logger.warn("⚠️ SMTP environment variables are unconfigured. E-mails will output to system logs.");
}

/**
 * Generic email sending wrapper with database logging and no-crash safety
 */
const sendMail = async (to, subject, htmlContent) => {
  const insertLog = async (status, errMessage = null) => {
    try {
      await query(
        'INSERT INTO email_logs (recipient, subject, status, error_message) VALUES ($1, $2, $3, $4)',
        [to, subject, status, errMessage]
      );
    } catch (dbErr) {
      logger.error(`❌ Failed to write log to email_logs database: ${dbErr.message}`);
    }
  };

  if (!isSmtpConfigured) {
    logger.info(`[Email Simulator] Outbound Email to: <${to}>\nSubject: ${subject}\nBody: ${htmlContent.substring(0, 300)}... (truncated)`);
    await insertLog('sent');
    return { simulated: true, success: true, messageId: `msg_mock_${Date.now()}` };
  }

  try {
    const info = await transporter.sendMail({
      from: `"NatureSip Premium" <${fromEmail}>`,
      to,
      subject,
      html: htmlContent
    });
    logger.info(`✉️ Email successfully dispatched to ${to}. Message ID: ${info.messageId}`);
    logger.info(`📩 Nodemailer Info: ${JSON.stringify({ accepted: info.accepted, rejected: info.rejected, envelope: info.envelope, response: info.response })}`);
    await insertLog('sent');
    return { simulated: false, success: true, messageId: info.messageId, accepted: info.accepted, rejected: info.rejected, response: info.response };
  } catch (err) {
    logger.error(`❌ Failed to send email to ${to}: ${err.message}`);
    await insertLog('failed', err.message);
    // Graceful error capture instead of crashing client pipelines
    return { simulated: false, success: false, error: err.message };
  }
};


/**
 * @desc    Send Welcome email to newly registered users
 */
export const sendWelcomeEmail = async (email, name) => {
  const subject = "Welcome to NatureSip Premium! 🌿";
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #4CAF50; text-align: center;">Welcome, ${name}!</h2>
      <p>Thank you for creating an account with NatureSip Premium. We are thrilled to have you join our wellness community!</p>
      <p>With NatureSip, you can create custom juice blends matching your flavor profile, participate in wellness quizzes, and pre-order premium cold-pressed juices directly.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:3000/#login" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Explore NatureSip</a>
      </div>
      <hr style="border: 0; border-top: 1px solid #eee;" />
      <p style="font-size: 12px; color: #888; text-align: center;">NatureSip Inc., 123 Wellness Blvd. Revitalize Your Senses.</p>
    </div>
  `;
  return await sendMail(email, subject, htmlContent);
};

/**
 * @desc    Send Order Receipt / Confirmation
 */
export const sendOrderConfirmationEmail = async (email, orderDetails) => {
  const { id, name, sku, amount, quantity } = orderDetails;
  const subject = `Order Confirmed - #${id.substring(0, 8)}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #4CAF50; text-align: center;">Thank you for your order, ${name}!</h2>
      <p>Your payment has been successfully processed, and your pre-order has been secured.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="border-bottom: 2px solid #eee; text-align: left;">
            <th style="padding: 8px;">Item SKU</th>
            <th style="padding: 8px;">Quantity</th>
            <th style="padding: 8px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 8px;">${sku}</td>
            <td style="padding: 8px;">${quantity}</td>
            <td style="padding: 8px; text-align: right;">$${parseFloat(amount).toFixed(2)}</td>
          </tr>
          <tr style="border-top: 2px solid #eee; font-weight: bold;">
            <td colspan="2" style="padding: 8px;">Total Paid</td>
            <td style="padding: 8px; text-align: right;">$${parseFloat(amount).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      <p style="font-size: 14px; color: #555;">Order ID: <code>${id}</code></p>
      <p>We'll notify you as soon as your batch is scheduled for cold-press preparation and shipment.</p>
      <hr style="border: 0; border-top: 1px solid #eee;" />
      <p style="font-size: 12px; color: #888; text-align: center;">NatureSip Inc. Revitalize Your Senses.</p>
    </div>
  `;
  return await sendMail(email, subject, htmlContent);
};

/**
 * @desc    Send Refund Receipt
 */
export const sendRefundConfirmationEmail = async (email, name, paymentDetails) => {
  const { refundId, amount, orderId } = paymentDetails;
  const subject = `Refund Processed - Order #${orderId.substring(0, 8)}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #f44336; text-align: center;">Refund Processed</h2>
      <p>Hello ${name},</p>
      <p>This is to confirm that a refund of <strong>$${parseFloat(amount).toFixed(2)}</strong> has been processed for your order <code>${orderId}</code>.</p>
      <p>Depending on your financial institution, funds should reappear in your account within 5-10 business days.</p>
      <p>Refund ID: <code>${refundId}</code></p>
      <hr style="border: 0; border-top: 1px solid #eee;" />
      <p style="font-size: 12px; color: #888; text-align: center;">NatureSip Inc. If you have questions, please reach out to support@naturesip.com</p>
    </div>
  `;
  return await sendMail(email, subject, htmlContent);
};

/**
 * @desc    Send Low Stock Alert to Admins
 */
export const sendLowStockAlert = async (adminEmail, productDetails) => {
  const { sku, name, currentStock, threshold } = productDetails;
  const subject = `⚠️ LOW STOCK WARNING: ${sku}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0a800; border-radius: 8px; background-color: #fffdf5;">
      <h2 style="color: #d39e00;">Inventory Alert</h2>
      <p>An item's stock has fallen below its low stock threshold:</p>
      <ul>
        <li><strong>Product SKU:</strong> ${sku}</li>
        <li><strong>Product Name:</strong> ${name}</li>
        <li><strong>Current Stock Level:</strong> <span style="color: red; font-weight: bold;">${currentStock}</span></li>
        <li><strong>Low Stock Threshold:</strong> ${threshold}</li>
      </ul>
      <p>Please update supply log ledger in the NatureSip Admin Panel.</p>
      <hr style="border: 0; border-top: 1px solid #eee;" />
      <p style="font-size: 12px; color: #888; text-align: center;">Internal Automated System Alert.</p>
    </div>
  `;
  return await sendMail(adminEmail, subject, htmlContent);
};
