import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // null if broadcast to department/role
    },
    department: {
      type: String,
      required: true,
      default: 'Computer Science & Engineering'
    },
    targetRole: {
      type: String,
      enum: ['all', 'student', 'faculty', 'hod', 'admin'],
      default: 'all'
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['meeting', 'notice', 'timetable', 'leave', 'system'],
      default: 'system'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  {
    timestamps: true
  }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
