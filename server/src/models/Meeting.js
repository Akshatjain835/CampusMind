import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String
    },
    meetingDate: {
      type: Date,
      required: true
    },
    timeSlot: {
      type: String,
      required: true // e.g. "11:00 AM - 12:00 PM"
    },
    durationMinutes: {
      type: Number,
      default: 60
    },
    room: {
      type: String,
      required: true,
      default: 'Conference Room 1'
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    organizerName: {
      type: String
    },
    department: {
      type: String,
      required: true,
      default: 'Computer Science & Engineering'
    },
    participants: [
      {
        email: String,
        name: String,
        role: String
      }
    ],
    agenda: {
      type: String,
      required: true
    },
    invitationText: {
      type: String
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Rescheduled', 'Cancelled', 'Completed'],
      default: 'Scheduled'
    }
  },
  {
    timestamps: true
  }
);

const Meeting = mongoose.model('Meeting', meetingSchema);
export default Meeting;
