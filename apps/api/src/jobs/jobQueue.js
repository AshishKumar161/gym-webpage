import logger from '../utils/logger.js';
import { sendOTPEmail, sendPasswordResetEmail } from '../config/mailer.js';

class BackgroundJobQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  enqueue(jobType, payload) {
    this.queue.push({ jobType, payload, createdAt: new Date() });
    logger.info(`[JOB_QUEUE] Enqueued job: ${jobType}`);
    this.processQueue();
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const job = this.queue.shift();
      try {
        await this.executeJob(job);
      } catch (err) {
        logger.error(`[JOB_QUEUE] Job execution failed (${job.jobType}): ${err.message}`);
      }
    }

    this.isProcessing = false;
  }

  async executeJob({ jobType, payload }) {
    switch (jobType) {
      case 'SEND_OTP':
        await sendOTPEmail(payload.email, payload.otp);
        break;
      case 'SEND_PASSWORD_RESET':
        await sendPasswordResetEmail(payload.email, payload.name, payload.resetUrl);
        break;
      default:
        logger.warn(`[JOB_QUEUE] Unknown job type: ${jobType}`);
    }
  }
}

export const jobQueue = new BackgroundJobQueue();
