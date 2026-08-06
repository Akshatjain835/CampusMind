import Meeting from '../models/Meeting.js';
import axios from 'axios';
import { sendMeetingEmail } from '../utils/sendEmail.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// @desc    Schedule AI Meeting (calls LangGraph Meeting Agent)
// @route   POST /api/meetings/schedule-ai
// @access  Private (HOD/Admin/Faculty)
export const scheduleAiMeeting = async (req, res) => {
  try {
    const { title, date, timeSlot, participants, priority } = req.body;

    if (!title || !date) {
      return res.status(400).json({ message: 'Please provide meeting title and date' });
    }

    const department = req.user.department || 'Computer Science & Engineering';

    // Delegate to Python LangGraph Meeting Agent
    const aiRes = await axios.post(`${AI_SERVICE_URL}/api/ai/schedule-meeting`, {
      title,
      date,
      time_slot: timeSlot || '11:00 AM - 12:00 PM',
      department,
      priority: priority || 'Normal',
      organizer_name: req.user.name,
      organizer_role: req.user.role,
      participants: participants || [
        { name: 'Dr. R. K. Sharma', email: 'sharma@department.ai', role: 'Faculty' },
        { name: 'Prof. Anita Roy', email: 'roy@department.ai', role: 'Faculty' },
        { name: 'Dr. V. Patel', email: 'patel@department.ai', role: 'HOD' }
      ]
    });

    res.json(aiRes.data);
  } catch (error) {
    console.error('AI Meeting Scheduling error:', error.message);
    // Fallback if AI microservice is offline
    const dept = req.user.department || 'Computer Science & Engineering';
    res.json({
      title: req.body.title,
      meetingDate: req.body.date,
      timeSlot: req.body.timeSlot || '11:00 AM - 12:00 PM',
      room: 'Conference Room 1 (Main Block)',
      department: dept,
      organizerName: req.user.name,
      agenda: `1. Review departmental academic progress\n2. Discuss upcoming exam schedule\n3. Accreditation & lab resource allocation`,
      invitationText: `You are cordially invited to the ${req.body.title} on ${req.body.date} at Conference Room 1. Organized by ${req.user.name} (${dept}).`,
      status: 'Scheduled'
    });
  }
};

// @desc    Save scheduled meeting to MongoDB
// @route   POST /api/meetings
// @access  Private (HOD/Admin/Faculty)
export const createMeeting = async (req, res) => {
  try {
    const { title, description, meetingDate, timeSlot, durationMinutes, room, participants, agenda, invitationText } = req.body;

    if (!title || !meetingDate || !room || !agenda) {
      return res.status(400).json({ message: 'Please provide all required meeting fields' });
    }

    const department = req.user.department || 'Computer Science & Engineering';

    const meeting = await Meeting.create({
      title,
      description,
      meetingDate,
      timeSlot: timeSlot || '11:00 AM - 12:00 PM',
      durationMinutes: durationMinutes || 60,
      room,
      organizer: req.user._id,
      organizerName: req.user.name,
      department,
      participants: participants || [],
      agenda,
      invitationText,
      status: 'Scheduled'
    });

    // Extract emails from participants or fallback to department email distribution list
    const recipientEmails = (participants && participants.length > 0)
      ? participants.map(p => typeof p === 'string' ? p : p.email).filter(Boolean)
      : ['faculty@department.ai', 'hod@department.ai'];

    // Send meeting invitation email asynchronously via Nodemailer
    sendMeetingEmail({
      to: recipientEmails.length > 0 ? recipientEmails : ['faculty@department.ai'],
      title: meeting.title,
      date: meeting.meetingDate,
      timeSlot: meeting.timeSlot,
      room: meeting.room,
      agenda: meeting.agenda,
      invitationText: meeting.invitationText,
      organizerName: req.user.name
    });

    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get department meetings
// @route   GET /api/meetings
// @access  Private
export const getMeetings = async (req, res) => {
  try {
    const department = req.user.department || 'Computer Science & Engineering';
    const meetings = await Meeting.find({ department })
      .populate('organizer', 'name email designation role')
      .sort({ meetingDate: 1 });

    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reschedule meeting
// @route   PUT /api/meetings/:id/reschedule
// @access  Private (Organizer/HOD/Admin)
export const rescheduleMeeting = async (req, res) => {
  try {
    const { meetingDate, timeSlot, room } = req.body;
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    meeting.meetingDate = meetingDate || meeting.meetingDate;
    meeting.timeSlot = timeSlot || meeting.timeSlot;
    meeting.room = room || meeting.room;
    meeting.status = 'Rescheduled';

    await meeting.save();
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel meeting
// @route   DELETE /api/meetings/:id
// @access  Private (Organizer/HOD/Admin)
export const cancelMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    meeting.status = 'Cancelled';
    await meeting.save();

    res.json({ message: 'Meeting cancelled successfully', meeting });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
