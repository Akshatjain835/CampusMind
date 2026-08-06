import nodemailer from 'nodemailer';
import dns from 'dns';

// Force Node to prefer IPv4 over IPv6 to resolve connection timeouts on Windows
dns.setDefaultResultOrder('ipv4first');

/**
 * Send HTML Meeting Invitation Email using Gmail Nodemailer
 */
export const sendMeetingEmail = async ({ to, title, date, timeSlot, room, agenda, invitationText, organizerName }) => {
  try {
    const recipientList = Array.isArray(to) ? to.join(', ') : to;
    const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER;
    const gmailPass = process.env.GMAIL_PASS || process.env.SMTP_PASS;

    let transporter;

    if (gmailUser && gmailPass) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass
        },
        tls: { rejectUnauthorized: false }
      });
    } else {
      // Ethereal Test Account Fallback if Gmail credentials are not set
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
        tls: { rejectUnauthorized: false }
      });
    }

    // Formatted HTML Email Template
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px; max-width: 600px; margin: auto;">
        <div style="border-bottom: 2px solid #818cf8; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="color: #a5b4fc; margin: 0;">📅 Department Meeting Invitation</h2>
          <p style="color: #94a3b8; font-size: 0.9rem; margin-top: 4px;">DepartmentAI Governance & Administrative Portal</p>
        </div>

        <div style="background: rgba(255, 255, 255, 0.05); padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #ffffff; margin-top: 0;">${title}</h3>
          <p style="margin: 6px 0; color: #cbd5e1;"><strong>Organizer:</strong> ${organizerName || 'Head of Department (HOD)'}</p>
          <p style="margin: 6px 0; color: #38bdf8;"><strong>Date & Time:</strong> ${date} | ${timeSlot}</p>
          <p style="margin: 6px 0; color: #34d399;"><strong>Venue / Allocated Room:</strong> ${room}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h4 style="color: #818cf8; margin-bottom: 8px;">📋 AI-Formulated Agenda & Key Objectives</h4>
          <pre style="background: #020617; padding: 12px; border-radius: 6px; color: #e2e8f0; font-family: monospace; white-space: pre-wrap; font-size: 0.85rem;">${agenda || '1. Department Academic Review\n2. Accreditation Progress\n3. Action Items'}</pre>
        </div>

        <div style="margin-bottom: 24px;">
          <h4 style="color: #c084fc; margin-bottom: 8px;">✉️ Formal Message</h4>
          <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.5;">${invitationText || 'You are requested to attend this meeting on time. Please confirm your attendance.'}</p>
        </div>

        <div style="border-top: 1px solid #334155; padding-top: 16px; font-size: 0.8rem; color: #64748b; text-align: center;">
          Dispatched via Gmail & DepartmentAI Academic Secretary.
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"DepartmentAI Portal" <${gmailUser || 'no-reply@campusmind.edu'}>`,
      to: recipientList,
      subject: `[Meeting Call]: ${title} - ${date}`,
      html: htmlBody
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Gmail Nodemailer Success]: Dispatched to ${recipientList}. MessageId: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('[Gmail Nodemailer Error]:', error.message);
    return null;
  }
};
