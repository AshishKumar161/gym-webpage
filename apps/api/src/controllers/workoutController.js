import WorkoutPlan from '../models/WorkoutPlan.js';

export const getWorkoutPlans = async (req, res, next) => {
  try {
    const filter = req.user.role === 'member' ? { member: req.user._id } : {};
    const plans = await WorkoutPlan.find(filter)
      .populate('member', 'name email')
      .populate('trainer', 'name email');

    res.status(200).json({ success: true, count: plans.length, data: plans });
  } catch (error) {
    next(error);
  }
};

export const createWorkoutPlan = async (req, res, next) => {
  try {
    const { title, memberId, dayOfWeek, exercises, notes } = req.body;
    const plan = await WorkoutPlan.create({
      title,
      member: memberId,
      trainer: req.user._id,
      dayOfWeek,
      exercises,
      notes
    });

    res.status(201).json({ success: true, message: 'Workout plan created', data: plan });
  } catch (error) {
    next(error);
  }
};

export const updateWorkoutPlan = async (req, res, next) => {
  try {
    const plan = await WorkoutPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, message: 'Workout plan updated', data: plan });
  } catch (error) {
    next(error);
  }
};

export const deleteWorkoutPlan = async (req, res, next) => {
  try {
    await WorkoutPlan.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Workout plan deleted' });
  } catch (error) {
    next(error);
  }
};
