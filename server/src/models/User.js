import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['student', 'faculty', 'hod', 'admin'],
    default: 'student'
  },
  department: { type: String, default: 'Computer Science & Engineering' },
  // Student Specific Fields
  rollNumber: { type: String },
  semester: { type: Number },
  section: { type: String },
  // Faculty Specific Fields
  designation: { type: String },
  specialization: { type: String },
  workloadHours: { type: Number, default: 0 },
  avatar: { type: String }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
