import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    required: true
  },
  timeSlot: {
    type: String,
    required: true // e.g. "09:00 AM - 10:00 AM" or "02:00 PM - 04:00 PM"
  },
  courseName: {
    type: String,
    required: true
  },
  courseCode: {
    type: String,
    required: true
  },
  facultyName: {
    type: String,
    required: true
  },
  room: {
    type: String,
    required: true // e.g. "Lab 101" or "LH-204"
  },
  type: {
    type: String,
    enum: ['Lecture', 'Lab', 'Tutorial'],
    default: 'Lecture'
  }
});

const timetableSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      required: true,
      default: 'Computer Science & Engineering'
    },
    semester: {
      type: String,
      required: true,
      default: '6th Semester'
    },
    section: {
      type: String,
      required: true,
      default: 'Section A'
    },
    academicYear: {
      type: String,
      default: '2025-2026'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    slots: [slotSchema]
  },
  {
    timestamps: true
  }
);

const Timetable = mongoose.model('Timetable', timetableSchema);
export default Timetable;
