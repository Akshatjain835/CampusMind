import Timetable from '../models/Timetable.js';
import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// @desc    Generate conflict-free weekly timetable using Python AI Agent
// @route   POST /api/timetable/generate-ai
// @access  Private (HOD/Admin/Faculty)
export const generateAiTimetable = async (req, res) => {
  try {
    const { semester, section, courses, labRooms } = req.body;

    const department = req.user.department || 'Computer Science & Engineering';

    // Call FastAPI Python Timetable Agent
    const aiRes = await axios.post(`${AI_SERVICE_URL}/api/ai/generate-timetable`, {
      department,
      semester: semester || '6th Semester',
      section: section || 'Section A',
      courses: courses || [
        { code: 'CS601', name: 'Compiler Design', faculty: 'Dr. R. K. Sharma', type: 'Lecture' },
        { code: 'CS602', name: 'Computer Networks', faculty: 'Prof. Anita Roy', type: 'Lecture' },
        { code: 'CS603', name: 'Artificial Intelligence', faculty: 'Dr. V. Patel', type: 'Lecture' },
        { code: 'CS604', name: 'AI & Data Lab', faculty: 'Dr. V. Patel', type: 'Lab', room: 'Lab 101' },
        { code: 'CS605', name: 'Networks Lab', faculty: 'Prof. Anita Roy', type: 'Lab', room: 'Lab 102' }
      ],
      lab_rooms: labRooms || ['Lab 101', 'Lab 102', 'LH-201', 'LH-202']
    });

    res.json(aiRes.data);
  } catch (error) {
    console.error('AI Timetable Generation error:', error.message);
    res.status(500).json({ message: 'Failed to generate AI timetable: ' + error.message });
  }
};

// @desc    Save/Publish generated timetable to MongoDB
// @route   POST /api/timetable
// @access  Private (HOD/Admin/Faculty)
export const saveTimetable = async (req, res) => {
  try {
    const { semester, section, academicYear, slots } = req.body;

    if (!slots || !Array.isArray(slots)) {
      return res.status(400).json({ message: 'Please provide valid timetable slots' });
    }

    const department = req.user.department || 'Computer Science & Engineering';

    // Replace existing active timetable for this dept/sem/sec
    await Timetable.deleteMany({ department, semester, section });

    const newTimetable = await Timetable.create({
      department,
      semester: semester || '6th Semester',
      section: section || 'Section A',
      academicYear: academicYear || '2025-2026',
      createdBy: req.user._id,
      slots
    });

    res.status(201).json(newTimetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active timetable for user's department
// @route   GET /api/timetable
// @access  Private
export const getTimetable = async (req, res) => {
  try {
    const department = req.user.department || 'Computer Science & Engineering';
    const semester = req.query.semester || '6th Semester';
    const section = req.query.section || 'Section A';

    let timetable = await Timetable.findOne({ department, semester, section }).sort({ createdAt: -1 });

    // Fallback if none exists yet
    if (!timetable) {
      timetable = await Timetable.findOne({ department }).sort({ createdAt: -1 });
    }

    res.json(timetable || { department, semester, section, slots: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
