import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    circularNumber: {
      type: String,
      required: true,
      unique: true
    },
    category: {
      type: String,
      enum: ['Academic', 'Exam', 'Workshop', 'Event', 'Urgent', 'General'],
      default: 'Academic'
    },
    content: {
      type: String,
      required: true
    },
    targetAudience: {
      type: String,
      enum: ['All', 'Students', 'Faculty', '3rd Year CSE', '4th Year CSE'],
      default: 'All'
    },
    department: {
      type: String,
      required: true,
      default: 'Computer Science & Engineering'
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    authorName: {
      type: String
    },
    authorRole: {
      type: String
    },
    isPublished: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Notice = mongoose.model('Notice', noticeSchema);
export default Notice;
