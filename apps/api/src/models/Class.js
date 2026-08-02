import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, enum: ['Yoga', 'HIIT', 'Spinning', 'Zumba', 'Boxing', 'CrossFit'], default: 'HIIT' },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    days: [{ type: String }],
    maxCapacity: { type: Number, default: 20 },
    bookedMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

const ClassModel = mongoose.model('Class', classSchema);
export default ClassModel;
