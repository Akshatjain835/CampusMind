import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'department_ai_super_secret_jwt_key_2026', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, department, rollNumber, semester, designation, specialization } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      department: department || 'Computer Science & Engineering',
      rollNumber,
      semester,
      designation,
      specialization
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      rollNumber: user.rollNumber,
      designation: user.designation,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      rollNumber: user.rollNumber,
      semester: user.semester,
      designation: user.designation,
      workloadHours: user.workloadHours,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const {
      name, email, password, phone, bio, profilePic,
      resumeUrl, githubUrl, linkedinUrl, department,
      rollNumber, section, semester, designation, specialization
    } = req.body;

    // Normal Editable Details for All Users
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (profilePic !== undefined) user.profilePic = profilePic;
    if (resumeUrl !== undefined) user.resumeUrl = resumeUrl;
    if (githubUrl !== undefined) user.githubUrl = githubUrl;
    if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl;

    // Password Update
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Critical Academic Governance Details (ONLY editable by Faculty/HOD/Admin, NOT students)
    if (user.role !== 'student') {
      if (department) user.department = department;
      if (rollNumber) user.rollNumber = rollNumber;
      if (section) user.section = section;
      if (semester) user.semester = semester;
      if (designation) user.designation = designation;
      if (specialization) user.specialization = specialization;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      department: updatedUser.department,
      rollNumber: updatedUser.rollNumber,
      section: updatedUser.section,
      semester: updatedUser.semester,
      designation: updatedUser.designation,
      specialization: updatedUser.specialization,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
      profilePic: updatedUser.profilePic,
      resumeUrl: updatedUser.resumeUrl,
      githubUrl: updatedUser.githubUrl,
      linkedinUrl: updatedUser.linkedinUrl,
      token: generateToken(updatedUser._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed default accounts for testing (Student, Faculty, HOD, Admin)
// @route   POST /api/auth/seed
export const seedUsers = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('password123', salt);

    const demoUsers = [
      {
        name: 'Rahul Sharma',
        email: 'student@department.ai',
        password: defaultPassword,
        role: 'student',
        department: 'Computer Science & Engineering',
        rollNumber: 'CS2024-042',
        semester: 6,
        section: 'A'
      },
      {
        name: 'Dr. Anita Verma',
        email: 'faculty@department.ai',
        password: defaultPassword,
        role: 'faculty',
        department: 'Computer Science & Engineering',
        designation: 'Associate Professor',
        specialization: 'Artificial Intelligence & Machine Learning',
        workloadHours: 18
      },
      {
        name: 'Prof. Rajesh K. Gupta',
        email: 'hod@department.ai',
        password: defaultPassword,
        role: 'hod',
        department: 'Computer Science & Engineering',
        designation: 'Head of Department',
        specialization: 'Distributed Systems'
      },
      {
        name: 'System Admin',
        email: 'admin@department.ai',
        password: defaultPassword,
        role: 'admin',
        department: 'Academic Administration',
        designation: 'Department Administrator'
      }
    ];

    for (const demoUser of demoUsers) {
      await User.findOneAndUpdate(
        { email: demoUser.email },
        demoUser,
        { upsert: true, new: true }
      );
    }

    res.json({ message: 'Demo users seeded successfully!', defaultPassword: 'password123' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
