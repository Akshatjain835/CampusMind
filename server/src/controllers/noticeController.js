import Notice from '../models/Notice.js';
import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

// @desc    Generate AI draft circular text from prompt
// @route   POST /api/notices/generate-ai
// @access  Private (HOD/Admin)
export const generateAiNotice = async (req, res) => {
  try {
    const { prompt, category, targetAudience } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Please provide a prompt for notice generation' });
    }

    const department = req.user.department || 'Computer Science & Engineering';
    const authorName = req.user.name;
    const authorRole = req.user.role;

    // Call FastAPI AI Notice Generator Agent
    const aiRes = await axios.post(`${AI_SERVICE_URL}/api/ai/generate-notice`, {
      prompt,
      category: category || 'Academic',
      target_audience: targetAudience || 'All',
      department,
      author_name: authorName,
      author_role: authorRole
    });

    res.json(aiRes.data);
  } catch (error) {
    console.error('AI Notice Generation error:', error.message);
    // Fallback if AI microservice is offline
    const dept = req.user.department || 'Computer Science & Engineering';
    const circNo = `Ref: DEPT/${dept.substring(0, 3).toUpperCase()}/2026/CIRC-${Math.floor(100 + Math.random() * 900)}`;
    res.json({
      title: req.body.prompt || 'Department Circular',
      circularNumber: circNo,
      content: `OFFICIAL CIRCULAR\n${circNo}\nDate: ${new Date().toLocaleDateString()}\n\nSubject: ${req.body.prompt}\n\nThis is an official departmental announcement regarding ${req.body.prompt}. All concerned students and faculty members are requested to take note.\n\nBy Order,\n${req.user.name}\n${req.user.role?.toUpperCase() || 'HOD'}, ${dept}`,
      category: req.body.category || 'Academic',
      targetAudience: req.body.targetAudience || 'All'
    });
  }
};

// @desc    Publish a new notice to MongoDB
// @route   POST /api/notices
// @access  Private (HOD/Admin/Faculty)
export const createNotice = async (req, res) => {
  try {
    const { title, circularNumber, category, content, targetAudience } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Please provide notice title and content' });
    }

    const dept = req.user.department || 'Computer Science & Engineering';
    const generatedCircNo = circularNumber || `Ref: DEPT/${dept.substring(0, 3).toUpperCase()}/2026/CIRC-${Math.floor(100 + Math.random() * 900)}`;

    const notice = await Notice.create({
      title,
      circularNumber: generatedCircNo,
      category: category || 'Academic',
      content,
      targetAudience: targetAudience || 'All',
      department: dept,
      author: req.user._id,
      authorName: req.user.name,
      authorRole: req.user.role
    });

    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all notices for user's department
// @route   GET /api/notices
// @access  Private
export const getNotices = async (req, res) => {
  try {
    const userDept = req.user.department || 'Computer Science & Engineering';
    const notices = await Notice.find({
      $or: [
        { department: userDept },
        { department: 'All' }
      ]
    })
      .populate('author', 'name role designation')
      .sort({ createdAt: -1 });

    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a notice
// @route   DELETE /api/notices/:id
// @access  Private (HOD/Admin or Notice Author)
export const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'hod' && notice.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this notice' });
    }

    await notice.deleteOne();
    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
