import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema({
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicantRole: { type: String, enum: ['student', 'faculty'], required: true },
  leaveType: { type: String, enum: ['Medical', 'Casual', 'Duty', 'Academic'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  aiRecommendation: {
    recommendedStatus: { type: String, enum: ['Approve', 'Reject', 'Needs Review'] },
    reasoning: { type: String },
    attendanceImpact: { type: String }
  }
}, { timestamps: true });

export default mongoose.model('LeaveRequest', leaveRequestSchema);
