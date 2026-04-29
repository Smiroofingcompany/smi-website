// /api/contact — Vercel serverless function
// Receives form submission, posts to CRM, sends Twilio SMS, sends internal email

const https = require('https');

// ── helpers ─────────────────────────────────────────────────────────────────

function httpsPost(hostname, path, auth, body) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(body);
    const req = https.request(
      {
        hostname,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': data.length,
          Authorization: 'Basic ' + Buffer.from(auth).toString('base64'),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => resolve({ status: res.statusCode, body: raw }));
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function httpsPostJSON(hostname, path, headers, payload) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(payload));
    const req = https.request(
      {
        hostname,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
          ...headers,
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => resolve({ status: res.statusCode, body: raw }));
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function qs(params) {
  return Object.entries(params)
    .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v ?? ''))
    .join('&');
}

// ── CRM ─────────────────────────────────────────────────────────────────────

async function postToCRM({ name, phone, email, service, message, smsConsent, page }) {
  const CRM_TOKEN = process.env.CRM_API_TOKEN;
  const headers = CRM_TOKEN ? { Authorization: 'Bearer ' + CRM_TOKEN } : {};
  try {
    await httpsPostJSON('crm.smiroof.com', '/api/leads', headers, {
      name,
      phone,
      email: email || '',
      service: service || '',
      message: message || '',
      sms_consent: smsConsent ? 'yes' : 'no',
      source_page: page || '/',
      source: 'website_contact_form',
    });
  } catch (err) {
    // Non-fatal: log and continue
    console.error('CRM post failed:', err.message);
  }
}

// ── Twilio SMS ───────────────────────────────────────────────────────────────

async function sendSMS(toPhone, firstName) {
  const SID = process.env.TWILIO_ACCOUNT_SID;
  const TOKEN = process.env.TWILIO_AUTH_TOKEN;
  const FROM = process.env.TWILIO_FROM_NUMBER;
  if (!SID || !TOKEN || !FROM) {
    console.warn('Twilio env vars not set — skipping SMS');
    return;
  }

  // Normalize phone to E.164 (assume US if no country code)
  let to = toPhone.replace(/\D/g, '');
  if (to.length === 10) to = '+1' + to;
  else if (to.length === 11 && to[0] === '1') to = '+' + to;
  else to = '+' + to;

  const body = `Hi ${firstName}, this is SMI Roofing. We got your request and will call you within 1 hour. Questions? Reply to this message or call (501) 464-5139. - SMI Roofing Team`;

  await httpsPost(
    'api.twilio.com',
    `/2010-04-01/Accounts/${SID}/Messages.json`,
    `${SID}:${TOKEN}`,
    qs({ To: to, From: FROM, Body: body })
  );
}

// ── Internal email via SMTP (nodemailer) ─────────────────────────────────────
// Requires SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS env vars.
// Works with Gmail (smtp.gmail.com:465), Outlook, Postmark, Mailgun SMTP, etc.

async function sendInternalEmail({ name, phone, email, service, message, page }) {
  const SMTP_HOST = process.env.SMTP_HOST;
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;
  const LEAD_NOTIFY_TO = process.env.LEAD_NOTIFY_TO || 'dmcorysmith@gmaill.com';
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('SMTP env vars not set — skipping internal email');
    return;
  }

  // Lazy-require so cold starts are unaffected if nodemailer is absent
  let nodemailer;
  try {
    nodemailer = require('nodemailer');
  } catch {
    console.warn('nodemailer not installed — skipping internal email');
    return;
  }

  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: `"SMI Roofing Website" <${SMTP_USER}>`,
    to: LEAD_NOTIFY_TO,
    subject: `🏠 New Lead: ${name} — ${service || 'General Inquiry'}`,
    text: [
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Email: ${email || 'Not provided'}`,
      `Service: ${service || 'Not specified'}`,
      `Message: ${message || 'None'}`,
      `Page: ${page || '/'}`,
    ].join('\n'),
    html: `
      <table style="font-family:sans-serif;font-size:15px;line-height:1.6">
        <tr><td style="padding:4px 12px 4px 0;font-weight:700">Name</td><td>${name}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:700">Phone</td><td>${phone}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:700">Email</td><td>${email || 'Not provided'}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:700">Service</td><td>${service || 'Not specified'}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:700">Message</td><td>${message || 'None'}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:700">Page</td><td>${page || '/'}</td></tr>
      </table>
    `,
  });
}

// ── Handler ──────────────────────────────────────────────────────────────────

module.exports = async function handler(req, res) {
  // CORS preflight
  res.setHeader('Access-Control-Allow-Origin', 'https://smiroof.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, email, service, message, smsConsent, page } = req.body || {};

  if (!name || !phone) {
    return res.status(400).json({ error: 'name and phone are required' });
  }

  const firstName = name.trim().split(/\s+/)[0];

  // Run CRM + SMS + email concurrently; don't let any single failure block success response
  const results = await Promise.allSettled([
    postToCRM({ name, phone, email, service, message, smsConsent, page }),
    smsConsent ? sendSMS(phone, firstName) : Promise.resolve(),
    sendInternalEmail({ name, phone, email, service, message, page }),
  ]);

  // Log any failures server-side but still return success to the visitor
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`Task ${i} failed:`, r.reason);
    }
  });

  return res.status(200).json({ success: true });
};
