import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    planName: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['UPI', 'Card', 'Cash', 'NetBanking'], default: 'UPI' },
    status: { type: String, enum: ['paid', 'pending', 'failed'], default: 'paid', index: true },
    paidAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
