import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, default: Date.now, index: true },
    checkInTime: { type: String, required: true },
    checkOutTime: { type: String, default: '' },
    method: { type: String, enum: ['QR_CODE', 'MANUAL'], default: 'QR_CODE' },
    status: { type: String, enum: ['present', 'absent', 'late'], default: 'present' }
  },
  { timestamps: true }
);

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
