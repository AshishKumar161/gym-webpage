import DietPlan from '../models/DietPlan.js';

export const getDietPlans = async (req, res, next) => {
  try {
    const filter = req.user.role === 'member' ? { member: req.user._id } : {};
    const plans = await DietPlan.find(filter)
      .populate('member', 'name email')
      .populate('trainer', 'name email');

    res.status(200).json({ success: true, count: plans.length, data: plans });
  } catch (error) {
    next(error);
  }
};

export const createDietPlan = async (req, res, next) => {
  try {
    const { title, memberId, dailyCaloriesTarget, meals, waterIntakeLiters, instructions } = req.body;
    const plan = await DietPlan.create({
      title,
      member: memberId,
      trainer: req.user._id,
      dailyCaloriesTarget,
      meals,
      waterIntakeLiters,
      instructions
    });

    res.status(201).json({ success: true, message: 'Diet plan created', data: plan });
  } catch (error) {
    next(error);
  }
};

export const updateDietPlan = async (req, res, next) => {
  try {
    const plan = await DietPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, message: 'Diet plan updated', data: plan });
  } catch (error) {
    next(error);
  }
};

export const deleteDietPlan = async (req, res, next) => {
  try {
    await DietPlan.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Diet plan deleted' });
  } catch (error) {
    next(error);
  }
};
