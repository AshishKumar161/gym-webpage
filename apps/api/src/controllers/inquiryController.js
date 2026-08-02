import Inquiry from '../models/Inquiry.js';

/**
 * @desc    Submit Contact Inquiry Form
 * @route   POST /api/v1/inquiries
 * @access  Public
 */
export const createInquiry = async (req, res, next) => {
  try {
    const { name, phone, message } = req.body;

    const inquiry = await Inquiry.create({ name, phone, message });

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully! Our team will contact you shortly.',
      data: inquiry
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get All Inquiries (Admin/Trainer)
 * @route   GET /api/v1/inquiries
 * @access  Private/Admin/Trainer
 */
export const getInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Inquiry Status (Admin/Trainer)
 * @route   PATCH /api/v1/inquiries/:id/status
 * @access  Private/Admin/Trainer
 */
export const updateInquiryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    inquiry.status = status;
    await inquiry.save();

    res.status(200).json({
      success: true,
      message: `Inquiry status updated to ${status}`,
      data: inquiry
    });
  } catch (error) {
    next(error);
  }
};
