import mongoose from 'mongoose';

/**
 * Session Model — Tracks active user sessions.
 * One document per active refresh token.
 * Allows users to view and revoke active sessions.
 */
const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    // Unique identifier for the refresh token
    refreshTokenId: {
      type: String,
      required: true,
      index: true
    },
    // Hashed version of the refresh token (sha256)
    refreshTokenHash: {
      type: String,
      required: true,
      select: false
    },
    // Device & environment fingerprint
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
    // Session lifecycle tracking
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
      index: { expireAfterSeconds: 0 } // TTL index — auto-purged by MongoDB
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound index for fast session lookup by user & status
sessionSchema.index({ userId: 1, isRevoked: 1 });

const Session = mongoose.model('Session', sessionSchema);
export default Session;
