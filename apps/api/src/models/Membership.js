import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active',
    index: true
  },
  paymentReference: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const membershipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Membership title is required'],
      trim: true,
      unique: true
    },
    slug: {
      type: String,
      required: true,
      lowercase: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    durationMonths: {
      type: Number,
      required: [true, 'Duration in months is required'],
      min: [1, 'Duration must be at least 1 month']
    },
    features: [
      {
        type: String,
        trim: true
      }
    ],
    isPopular: {
      type: Boolean,
      default: false
    },
    subscriptions: [subscriptionSchema]
  },
  {
    timestamps: true
  }
);

const Membership = mongoose.model('Membership', membershipSchema);
export default Membership;
