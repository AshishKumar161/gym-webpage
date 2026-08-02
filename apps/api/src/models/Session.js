import mongoose from 'mongoose';

/**
 * Session Model — Tracks every active user session.
 * One document per refresh token issued.
 * Allows users to view and revoke individual device sessions.
 */
const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    // Hashed version of the refresh token (never store plain tokens)
    refreshTokenHash: {
      type: String,
      required: true,
      select: false
    },
    // Device fingerprint
    device: {
      type: String,
      default: 'Unknown Device'
    },
    browser: {
      type: String,
      default: 'Unknown Browser'
    },
    os: {
      type: String,
      default: 'Unknown OS'
    },
    ipAddress: {
      type: String,
      default: ''
    },
    userAgent: {
      type: String,
      default: '',
      select: false
    },
    // Session lifecycle
    loginTime: {
      type: Date,
      default: Date.now
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 } // TTL index — auto-deleted by MongoDB
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true }
);

// Compound index for fast session lookup by user
sessionSchema.index({ userId: 1, isRevoked: 1 });

const Session = mongoose.model('Session', sessionSchema);
export default Session;
