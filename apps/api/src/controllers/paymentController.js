import Payment from '../models/Payment.js';

export const getPayments = async (req, res, next) => {
  try {
    const filter = req.user.role === 'member' ? { member: req.user._id } : {};
    const payments = await Payment.find(filter).populate('member', 'name email phone').sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    next(error);
  }
};

export const createPayment = async (req, res, next) => {
  try {
    const { memberId, planName, amount, paymentMethod, status } = req.body;
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    const payment = await Payment.create({
      invoiceNumber,
      member: memberId || req.user._id,
      planName,
      amount,
      paymentMethod,
      status: status || 'paid'
    });

    res.status(201).json({ success: true, message: 'Invoice generated successfully', data: payment });
  } catch (error) {
    next(error);
  }
};

export const updatePaymentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const payment = await Payment.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.status(200).json({ success: true, message: 'Payment status updated', data: payment });
  } catch (error) {
    next(error);
  }
};
