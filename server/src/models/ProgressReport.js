import mongoose from 'mongoose';

const progressReportSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    weightKg: { type: Number, required: true },
    heightCm: { type: Number, required: true },
    bodyFatPercentage: { type: Number, default: 0 },
    muscleMassKg: { type: Number, default: 0 },
    bmi: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    recordedDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const ProgressReport = mongoose.model('ProgressReport', progressReportSchema);
export default ProgressReport;
