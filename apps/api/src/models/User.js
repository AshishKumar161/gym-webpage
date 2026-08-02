import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const auditLogSchema = new mongoose.Schema({
  event: { type: String, required: true },
  ipAddress: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    role: {
      type: String,
      enum: ['member', 'trainer', 'admin'],
      default: 'member',
      index: true
    },
    avatar: {
      type: String,
      default: ''
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true
    },

    // Email OTP Verification
    otpCode: { type: String, default: null, select: false },
    otpExpires: { type: Date, default: null, select: false },

    // Password Reset
    resetPasswordToken: { type: String, default: null, select: false, index: true },
    resetPasswordExpires: { type: Date, default: null, select: false },

    // Account Lockout (5 failed login attempts)
    loginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, default: null, select: false },

    // Session tracking
    lastLogin: { type: Date, default: null },
    lastLoginIp: { type: String, default: '' },

    // Refresh Tokens (HttpOnly Cookie)
    refreshTokens: [
      {
        token: { type: String, required: true },
        userAgent: { type: String, default: '' },
        ipAddress: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now }
      }
    ],

    // Security Audit Log
    auditLog: {
      type: [auditLogSchema],
      default: [],
      select: false
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password helper
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if account is locked
userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Increment failed login attempts (lock after 5)
userSchema.methods.incrementLoginAttempts = async function () {
  // Reset if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockUntil = null;
  } else {
    this.loginAttempts += 1;
    if (this.loginAttempts >= 5) {
      // Lock for 30 minutes
      this.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
    }
  }
  return this.save();
};

// Reset login attempts on successful login
userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockUntil = null;
  return this.save();
};

// Add audit log entry (cap at last 100 entries)
userSchema.methods.addAuditLog = async function (event, ipAddress = '', userAgent = '') {
  this.auditLog.push({ event, ipAddress, userAgent });
  if (this.auditLog.length > 100) {
    this.auditLog = this.auditLog.slice(-100);
  }
  return this.save();
};

const User = mongoose.model('User', userSchema);
export default User;
