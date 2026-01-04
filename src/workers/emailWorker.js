const { Worker } = require('bullmq');
const redis = require('../config/redis');

let sgMail;
try {
  sgMail = require('@sendgrid/mail');
  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }
} catch (err) {
  console.log('SendGrid not available, emails will be logged to console');
}

let emailWorker = null;

if (redis && typeof redis.isConnected === 'function' && redis.isConnected()) {
  emailWorker = new Worker('email-notifications', async (job) => {
  try {
    const { type, ...data } = job.data;

    switch (type) {
      case 'send-application-confirmation':
        await sendApplicationConfirmation(data);
        break;
      case 'send-new-application-notification':
        await sendNewApplicationNotification(data);
        break;
      case 'send-stage-change-notification':
        await sendStageChangeNotification(data);
        break;
      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    console.log(`✓ Email sent successfully: ${job.id}`);
  } catch (error) {
    console.error(`✗ Email job failed: ${job.id}`, error.message);
    throw error;
  }
  }, {
    connection: redis.client,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY) || 5,
  });
} else {
  console.warn('Email worker not started: Redis unavailable (degraded mode).');
  // Provide minimal no-op event handlers to avoid null checks elsewhere
  emailWorker = {
    on: () => {},
  };
}

async function sendApplicationConfirmation({ candidateEmail, candidateName, jobTitle }) {
  const msg = {
    to: candidateEmail,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@ats-system.com',
    subject: `Application Confirmation - ${jobTitle}`,
    html: `
      <h2>Application Received</h2>
      <p>Hi ${candidateName},</p>
      <p>Thank you for applying to the <strong>${jobTitle}</strong> position. We have received your application and will review it shortly.</p>
      <p>Best regards,<br>The Hiring Team</p>
    `,
  };
  
  console.log(`[EMAIL] Confirmation: ${candidateEmail} for job ${jobTitle}`);
  
  if (sgMail && process.env.SENDGRID_API_KEY && !process.env.SENDGRID_API_KEY.includes('test')) {
    await sgMail.send(msg);
  }
}

async function sendNewApplicationNotification({ recruiterEmail, recruiterName, candidateName, jobTitle }) {
  const msg = {
    to: recruiterEmail,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@ats-system.com',
    subject: `New Application - ${jobTitle}`,
    html: `
      <h2>New Application Received</h2>
      <p>Hi ${recruiterName},</p>
      <p><strong>${candidateName}</strong> has applied for the <strong>${jobTitle}</strong> position.</p>
      <p>Please review their application in the ATS system.</p>
      <p>Best regards,<br>The ATS System</p>
    `,
  };
  
  console.log(`[EMAIL] New Application: ${recruiterEmail} - ${candidateName} applied for ${jobTitle}`);
  
  if (sgMail && process.env.SENDGRID_API_KEY && !process.env.SENDGRID_API_KEY.includes('test')) {
    await sgMail.send(msg);
  }
}

async function sendStageChangeNotification({ candidateEmail, candidateName, jobTitle, newStage, previousStage }) {
  const msg = {
    to: candidateEmail,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@ats-system.com',
    subject: `Application Status Update - ${jobTitle}`,
    html: `
      <h2>Application Status Update</h2>
      <p>Hi ${candidateName},</p>
      <p>Your application for the <strong>${jobTitle}</strong> position has been updated.</p>
      <p><strong>Previous Status:</strong> ${previousStage}</p>
      <p><strong>New Status:</strong> ${newStage}</p>
      <p>Thank you for your interest in our company.</p>
      <p>Best regards,<br>The Hiring Team</p>
    `,
  };
  
  console.log(`[EMAIL] Stage Update: ${candidateEmail} - Status changed from ${previousStage} to ${newStage}`);
  
  if (sgMail && process.env.SENDGRID_API_KEY && !process.env.SENDGRID_API_KEY.includes('test')) {
    await sgMail.send(msg);
  }
}

if (emailWorker && typeof emailWorker.on === 'function') {
  emailWorker.on('completed', (job) => {
    console.log(`✓ Job ${job.id} completed successfully`);
  });

  emailWorker.on('failed', (job, err) => {
    console.error(`✗ Job ${job.id} failed with error:`, err.message);
  });
}

module.exports = emailWorker;
