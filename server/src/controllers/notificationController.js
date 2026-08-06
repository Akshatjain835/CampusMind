import Notification from '../models/Notification.js';

// @desc    Get user's department/role notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const department = req.user.department || 'Computer Science & Engineering';
    const userRole = req.user.role || 'student';
    const userId = req.user._id;

    // Strict Notification Isolation Filter:
    // 1. If recipient is set, MUST match the logged-in user's ID.
    // 2. If recipient is null (broadcast), matches department and targetRole ('all' or userRole).
    const notifications = await Notification.find({
      department,
      $or: [
        { recipient: userId },
        {
          recipient: null,
          $or: [
            { targetRole: 'all' },
            { targetRole: userRole }
          ]
        }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(25);

    // Compute read status per user
    const formatted = notifications.map(n => ({
      _id: n._id,
      title: n.title,
      message: n.message,
      type: n.type,
      createdAt: n.createdAt,
      isRead: n.isRead || (n.readBy && n.readBy.some(id => id.toString() === userId.toString()))
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all notifications as read for user
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role || 'student';
    const department = req.user.department || 'Computer Science & Engineering';

    await Notification.updateMany(
      {
        department,
        $or: [
          { recipient: userId },
          { recipient: null, targetRole: { $in: ['all', userRole] } }
        ]
      },
      { $addToSet: { readBy: userId }, $set: { isRead: true } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Helper to create a notification broadcast
export const createNotificationHelper = async ({ department, targetRole = 'all', title, message, type = 'system', recipient = null }) => {
  try {
    await Notification.create({
      department,
      targetRole,
      title,
      message,
      type,
      recipient
    });
  } catch (err) {
    console.error('Failed to create notification helper:', err.message);
  }
};
