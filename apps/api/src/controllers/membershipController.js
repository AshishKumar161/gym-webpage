import Membership from '../models/Membership.js';

/**
 * @desc    Get all Membership Plans
 * @route   GET /api/v1/memberships
 * @access  Public
 */
export const getMemberships = async (req, res, next) => {
  try {
    const plans = await Membership.find().select('-subscriptions');
    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new Membership Plan (Admin only)
 * @route   POST /api/v1/memberships
 * @access  Private/Admin
 */
export const createMembership = async (req, res, next) => {
  try {
    const { title, price, durationMonths, features, isPopular } = req.body;
    const slug = title.toLowerCase().replace(/\s+/g, '-');

    const plan = await Membership.create({
      title,
      slug,
      price,
      durationMonths,
      features,
      isPopular
    });

    res.status(201).json({
      success: true,
      message: 'Membership plan created successfully',
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Subscribe User to a Membership Plan
 * @route   POST /api/v1/memberships/:id/subscribe
 * @access  Private
 */
export const subscribePlan = async (req, res, next) => {
  try {
    const plan = await Membership.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Membership plan not found' });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);

    plan.subscriptions.push({
      user: req.user._id,
      startDate,
      endDate,
      status: 'active',
      paymentReference: `PAY-${Date.now()}`
    });

    await plan.save();

    res.status(200).json({
      success: true,
      message: `Successfully subscribed to ${plan.title}`,
      subscription: {
        planTitle: plan.title,
        startDate,
        endDate,
        status: 'active'
      }
    });
  } catch (error) {
    next(error);
  }
};
