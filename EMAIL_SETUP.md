# NatureSip Transactional Email Setup Guide

This guide provides instructions for configuring the transactional SMTP email subsystem for local development and live Render deployments.

---

## ⚙️ SMTP Environment Variables

NatureSip utilizes standard environment variables to establish NodeMailer transporter connections. If these variables are not configured, the system operates in a **mock simulator mode** by printing all outbound emails directly to the server console and logging them as `sent` in the database.

Add the following keys to your local environment file (`backend/.env`) or your Render environment variables dashboard:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=your-email@gmail.com
```

---

## 🔑 Gmail App Password Configuration

If you are using Gmail to send transactional emails, standard account passwords will be rejected by Google due to security constraints. You must generate an **App Password**:

1. Go to your **Google Account Settings** (https://myaccount.google.com).
2. Select the **Security** tab on the left-hand navigation panel.
3. Under the *How you sign in to Google* section, ensure **2-Step Verification** is turned **ON** (this is required to generate app passwords).
4. Click on **2-Step Verification**, scroll to the very bottom, and select **App passwords**.
5. Enter a name for the app (e.g., `NatureSip Server`) and click **Create**.
6. Google will display a 16-character code (e.g., `abcd efgh ijkl mnop`). **Copy this code**.
7. Paste this 16-character code (without spaces) as the value for `SMTP_PASS` in your environment variables.

---

## ☁️ Render Deployment Instructions

To wire up outbound transactional emails on your live Render backend:

1. Log into your **Render Dashboard** (https://dashboard.render.com).
2. Click on your active NatureSip backend **Web Service**.
3. Select the **Environment** tab on the left navigation column.
4. Click **Add Environment Variable** and enter the SMTP credentials:
   - `SMTP_HOST` = `smtp.gmail.com`
   - `SMTP_PORT` = `587`
   - `SMTP_USER` = `your-verified-email@gmail.com`
   - `SMTP_PASS` = `16-character-gmail-app-password`
   - `SMTP_FROM` = `your-verified-email@gmail.com`
5. Click **Save Changes**. Render will automatically redeploy your web service with the live SMTP credentials bound.

---

## 📊 Monitoring Outbound E-mails

All email dispatch attempts (whether real SMTP or simulated offline logs) are permanently stashed in the PostgreSQL `email_logs` table for administrative review:

- **Database Table**: `email_logs`
- **Fields**:
  - `recipient`: Destination email address.
  - `subject`: Email title.
  - `status`: Delivery outcome (`sent` or `failed`).
  - `error_message`: Stack/Error details captured if a real SMTP connection fails.
  - `sent_at`: Dispatch timestamp.
