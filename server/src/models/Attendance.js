import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'On Leave'], required: true },
  remarks: { type: String }
}, { timestamps: true });

// Compound index to ensure uniqueness per student, course, date
attendanceSchema.index({ student: 1, course: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
