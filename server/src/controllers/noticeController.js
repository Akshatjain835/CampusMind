import Notice from '../models/Notice.js';
import axios from 'axios';
import { createNotificationHelper } from './notificationController.js';

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
    console.error('AI Notice Generation fallback:', error.message);
    const dept = req.user.department || 'Computer Science & Engineering';
    const userPrompt = (req.body.prompt || 'Departmental Announcement').trim();
    const circNo = `Ref: ${dept.split(' ').map(w => w[0]).join('').substring(0, 4).toUpperCase()}/2026/CIRC-${Math.floor(100 + Math.random() * 900)}`;
    const category = req.body.category || 'Academic';
    const targetAudience = req.body.targetAudience || 'All';
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const promptSentences = userPrompt.split('.').map(s => s.trim()).filter(Boolean);
    const mainTitle = promptSentences[0] || userPrompt;
    const directives = promptSentences.length > 1 ? promptSentences.slice(1) : [
      'All concerned individuals are requested to strictly adhere to the schedule/instructions specified above.',
      'Attendance and active participation are mandatory under departmental academic regulations.',
      'For any queries, please reach out to the Departmental Coordination Committee.'
    ];

    const directivesText = directives.map((d, i) => `  ${i + 1}. ${d.endsWith('.') ? d : d + '.'}`).join('\n');

    const formattedContent =
      `🏛️ OFFICIAL ACADEMIC CIRCULAR & NOTICE\n` +
      `${circNo}\n` +
      `Date: ${todayStr}\n\n` +
      `DEPARTMENT OF ${dept.toUpperCase()}\n` +
      `Category: ${category} | Target Audience: ${targetAudience}\n\n` +
      `📌 SUBJECT: ${mainTitle.toUpperCase()}\n\n` +
      `Dear ${targetAudience},\n\n` +
      `This is an official departmental communication regarding: ${mainTitle}.\n\n` +
      `📋 KEY DIRECTIVES & ACTION REQUIRED:\n` +
      `${directivesText}\n\n` +
      `⚠️ COMPLIANCE NOTE:\n` +
      `Strict compliance with the guidelines above is mandatory for all ${targetAudience.toLowerCase()} as per NAAC/NBA academic governance rules.\n\n` +
      `By Order & Authorization,\n\n` +
      `✍️ ${req.user.name}\n` +
      `${(req.user.role || 'HOD').toUpperCase()} | Department of ${dept}\n` +
      `CampusMind AI Administrative Governance Portal`;

    res.json({
      title: mainTitle.length > 75 ? mainTitle.substring(0, 75) + '...' : mainTitle,
      circularNumber: circNo,
      content: formattedContent,
      category,
      targetAudience
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

    // Auto-create notification for department
    await createNotificationHelper({
      department: dept,
      targetRole: (targetAudience || 'all').toLowerCase(),
      title: `Notice Circular: ${title}`,
      message: `Official circular ${generatedCircNo} has been published for ${targetAudience} under ${category}.`,
      type: 'notice'
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
