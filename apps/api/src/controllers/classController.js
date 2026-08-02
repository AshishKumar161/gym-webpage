import ClassModel from '../models/Class.js';

export const getClasses = async (req, res, next) => {
  try {
    const classes = await ClassModel.find().populate('trainer', 'name email').populate('bookedMembers', 'name email');
    res.status(200).json({ success: true, count: classes.length, data: classes });
  } catch (error) {
    next(error);
  }
};

export const createClass = async (req, res, next) => {
  try {
    const { title, description, category, startTime, endTime, days, maxCapacity } = req.body;
    const newClass = await ClassModel.create({
      title,
      description,
      trainer: req.user._id,
      category,
      startTime,
      endTime,
      days,
      maxCapacity
    });

    res.status(201).json({ success: true, message: 'Class scheduled successfully', data: newClass });
  } catch (error) {
    next(error);
  }
};

export const bookClass = async (req, res, next) => {
  try {
    const targetClass = await ClassModel.findById(req.params.id);
    if (!targetClass) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    if (targetClass.bookedMembers.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You have already booked this class' });
    }

    if (targetClass.bookedMembers.length >= targetClass.maxCapacity) {
      return res.status(400).json({ success: false, message: 'Class is full' });
    }

    targetClass.bookedMembers.push(req.user._id);
    await targetClass.save();

    res.status(200).json({ success: true, message: 'Class booked successfully!', data: targetClass });
  } catch (error) {
    next(error);
  }
};

export const deleteClass = async (req, res, next) => {
  try {
    await ClassModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Class deleted successfully' });
  } catch (error) {
    next(error);
  }
};
