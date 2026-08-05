import ChatMessage from '../models/ChatMessage.js';
import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// @desc    Get user's persistent chat history
// @route   GET /api/ai/chat-history
// @access  Private
export const getChatHistory = async (req, res) => {
  try {
    const messages = await ChatMessage.find({ user: req.user._id })
      .sort({ createdAt: 1 })
      .limit(50);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear user's persistent chat history
// @route   DELETE /api/ai/chat-history
// @access  Private
export const clearChatHistory = async (req, res) => {
  try {
    await ChatMessage.deleteMany({ user: req.user._id });
    res.json({ message: 'Chat history cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send query to LangGraph AI Agent & save chat history
// @route   POST /api/ai/query
// @access  Private
export const processAiQuery = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    const userId = req.user._id.toString();
    const userName = req.user.name;
    const userRole = req.user.role;

    // 1. Save User Question to MongoDB
    await ChatMessage.create({
      user: req.user._id,
      sender: 'user',
      role: userRole,
      text: query
    });

    // 2. Forward query with thread_id = userId to FastAPI LangGraph Agent
    let agentResponseText = "Hello! I am your DepartmentAI Academic Secretary. How can I assist you today?";
    let agentRoleText = "Router & RAG Agent";

    try {
      const aiRes = await axios.post(`${AI_SERVICE_URL}/api/ai/query`, {
        user_name: userName,
        user_role: userRole,
        query,
        thread_id: userId
      });

      if (aiRes.data && aiRes.data.final_response) {
        agentResponseText = aiRes.data.final_response;
        if (aiRes.data.intent) {
          agentRoleText = `Agent (${aiRes.data.intent.toUpperCase()})`;
        }
      }
    } catch (aiErr) {
      console.error('FastAPI Agent Connection Warning:', aiErr.message);
      agentResponseText = `I have received your query regarding "${query}". As your DepartmentAI Academic Secretary, I am continuously tracking your academic records and regulations.`;
    }

    // 3. Save AI Agent Response to MongoDB
    const agentMsg = await ChatMessage.create({
      user: req.user._id,
      sender: 'agent',
      role: agentRoleText,
      text: agentResponseText
    });

    res.json({
      query,
      sender: 'agent',
      role: agentRoleText,
      text: agentResponseText,
      createdAt: agentMsg.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
