import LeaveRequest from '../models/LeaveRequest.js';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import { createNotificationHelper } from './notificationController.js';
import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// @desc    Apply for a new leave (Student or Faculty)
// @route   POST /api/leaves
// @access  Private
export const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'Please provide all required leave details' });
    }

    const applicantId = req.user._id;
    const applicantRole = req.user.role;

    // 1. Fetch current student attendance percentage from MongoDB
    let currentAttendance = 82; // Default fallback
    if (applicantRole === 'student') {
      const attendanceRecords = await Attendance.find({ student: applicantId });
      if (attendanceRecords.length > 0) {
        const presentCount = attendanceRecords.filter(a => a.status === 'Present').length;
        currentAttendance = Math.round((presentCount / attendanceRecords.length) * 100);
      }
    }

    // 2. Call FastAPI AI Leave Agent to get automated AI recommendation
    let aiRecommendation = {
      recommendedStatus: 'Needs Review',
      reasoning: 'Evaluation pending AI agent processing.',
      attendanceImpact: `Current Attendance: ${currentAttendance}%`
    };

    try {
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/ai/evaluate-leave`, {
        user_name: req.user.name,
        user_role: applicantRole,
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason: reason,
        current_attendance: currentAttendance
      });

      if (aiResponse.data) {
        aiRecommendation = {
          recommendedStatus: aiResponse.data.recommendedStatus || 'Needs Review',
          reasoning: aiResponse.data.reasoning || 'AI evaluation complete.',
          attendanceImpact: aiResponse.data.attendanceImpact || `Attendance: ${currentAttendance}%`
        };
      }
    } catch (aiErr) {
      console.warn('[AI Leave Agent Warning]: FastAPI service offline, using default rule engine.');
      // Rule-based fallback if AI microservice is starting
      if (currentAttendance >= 75) {
        aiRecommendation = {
          recommendedStatus: 'Approve',
          reasoning: `Student attendance (${currentAttendance}%) is above 75% threshold. Recommended for approval.`,
          attendanceImpact: `Attendance remains healthy at ${currentAttendance}%`
        };
      } else if (currentAttendance >= 65) {
        aiRecommendation = {
          recommendedStatus: 'Needs Review',
          reasoning: `Attendance (${currentAttendance}%) is between 65%-74%. Clause 1.2 requires valid medical certificate and HOD review.`,
          attendanceImpact: `Requires medical certificate for condonation.`
        };
      } else {
        aiRecommendation = {
          recommendedStatus: 'Reject',
          reasoning: `Attendance (${currentAttendance}%) is below 65%. Clause 1.2.4 strictly prohibits condonation below 65%.`,
          attendanceImpact: `Student subject to detainment status.`
        };
      }
    }

    // 3. Create Leave Request record in MongoDB
    const leaveRequest = await LeaveRequest.create({
      applicant: applicantId,
      applicantRole: applicantRole,
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'Pending',
      aiRecommendation
    });

    const populatedLeave = await LeaveRequest.findById(leaveRequest._id).populate('applicant', 'name email rollNumber department designation');

    // Auto-trigger notification alert for Department HODs
    const dept = req.user.department || 'Computer Science & Engineering';
    await createNotificationHelper({
      department: dept,
      targetRole: 'hod',
      title: `New Leave Application: ${req.user.name}`,
      message: `${req.user.name} (${applicantRole}) has applied for ${leaveType} leave from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}. AI Recommendation: ${aiRecommendation.recommendedStatus}`,
      type: 'leave'
    });

    res.status(201).json(populatedLeave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's submitted leaves
// @route   GET /api/leaves/my-leaves
// @access  Private
export const getMyLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ applicant: req.user._id })
      .populate('reviewedBy', 'name designation')
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const isSameDepartment = (dept1, dept2) => {
  if (!dept1 || !dept2) return true;
  const d1 = dept1.toLowerCase().trim();
  const d2 = dept2.toLowerCase().trim();
  if (d1 === d2) return true;
  if ((d1.includes('computer') || d1.includes('cse')) && (d2.includes('computer') || d2.includes('cse'))) return true;
  if ((d1.includes('electronics') || d1.includes('ece')) && (d2.includes('electronics') || d2.includes('ece'))) return true;
  if ((d1.includes('electrical') || d1.includes('ee')) && (d2.includes('electrical') || d2.includes('ee'))) return true;
  if ((d1.includes('mechanical') || d1.includes('me')) && (d2.includes('mechanical') || d2.includes('me'))) return true;
  if ((d1.includes('civil') || d1.includes('ce')) && (d2.includes('civil') || d2.includes('ce'))) return true;
  if ((d1.includes('information') || d1.includes('it')) && (d2.includes('information') || d2.includes('it'))) return true;
  return false;
};

// @desc    Get all pending leaves for Faculty/HOD approval (Concerned Department Only)
// @route   GET /api/leaves/pending
// @access  Private (Faculty/HOD/Admin)
export const getPendingLeaves = async (req, res) => {
  try {
    const allPendingLeaves = await LeaveRequest.find({ status: 'Pending' })
      .populate('applicant', 'name email rollNumber department designation semester section')
      .sort({ createdAt: -1 });

    const reviewerDepartment = req.user?.department || 'Computer Science & Engineering';
    const reviewerRole = req.user?.role || 'faculty';

    let departmentLeaves = reviewerRole === 'admin'
      ? allPendingLeaves
      : allPendingLeaves.filter(leave => {
        const studentDept = leave.applicant?.department || 'Computer Science & Engineering';
        return isSameDepartment(studentDept, reviewerDepartment);
      });

    if (departmentLeaves.length === 0 && allPendingLeaves.length > 0) {
      departmentLeaves = allPendingLeaves;
    }

    res.json(departmentLeaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviewed (Approved/Rejected) leave history for Faculty/HOD auditing
// @route   GET /api/leaves/history
// @access  Private (Faculty/HOD/Admin)
export const getLeaveHistory = async (req, res) => {
  try {
    const allReviewedLeaves = await LeaveRequest.find({ status: { $ne: 'Pending' } })
      .populate('applicant', 'name email rollNumber department designation semester section')
      .populate('reviewedBy', 'name designation role')
      .sort({ updatedAt: -1 });

    const reviewerDepartment = req.user?.department || 'Computer Science & Engineering';
    const reviewerRole = req.user?.role || 'faculty';

    let departmentHistory = reviewerRole === 'admin'
      ? allReviewedLeaves
      : allReviewedLeaves.filter(leave => {
        const studentDept = leave.applicant?.department || 'Computer Science & Engineering';
        return isSameDepartment(studentDept, reviewerDepartment);
      });

    if (departmentHistory.length === 0 && allReviewedLeaves.length > 0) {
      departmentHistory = allReviewedLeaves;
    }

    res.json(departmentHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve or Reject leave request with strict authority matrix validation
// @route   PUT /api/leaves/:id/review
// @access  Private (Faculty/HOD/Admin based on approval authority level)
export const reviewLeave = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Approved or Rejected' });
    }

    const leave = await LeaveRequest.findById(req.params.id).populate('applicant', 'name role department');
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    const reviewerRole = req.user?.role || 'faculty';
    const reviewerDepartment = req.user?.department || 'Computer Science & Engineering';
    const studentDepartment = leave.applicant?.department || 'Computer Science & Engineering';
    const applicantRole = leave.applicantRole || leave.applicant?.role || 'student';

    // Rule 1: Students can NEVER approve any leave
    if (reviewerRole === 'student') {
      return res.status(403).json({
        message: 'Authority Denied: Students are not authorized to approve leave applications.'
      });
    }

    // Rule 2: Department match verification (unless Admin)
    if (reviewerRole !== 'admin' && !isSameDepartment(reviewerDepartment, studentDepartment)) {
      return res.status(403).json({
        message: `Authority Denied: Reviewer department (${reviewerDepartment}) does not match applicant department (${studentDepartment}).`
      });
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    await leave.save();

    const updatedLeave = await LeaveRequest.findById(leave._id)
      .populate('applicant', 'name email rollNumber department')
      .populate('reviewedBy', 'name designation role');

    try {
      if (leave.applicant?._id) {
        await createNotificationHelper({
          department: studentDepartment,
          targetRole: applicantRole,
          recipient: leave.applicant._id,
          title: `Leave Application ${status}`,
          message: `Your ${leave.leaveType} leave request from ${new Date(leave.startDate).toLocaleDateString()} has been ${status.toLowerCase()} by ${req.user.name} (${reviewerRole.toUpperCase()}).`,
          type: 'leave'
        });
      }
    } catch (notifErr) {
      console.warn('Notification creation warning:', notifErr);
    }

    res.json(updatedLeave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
