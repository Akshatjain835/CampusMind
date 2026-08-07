import ChatMessage from '../models/ChatMessage.js';
import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

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

    const userId = req.user && req.user._id ? req.user._id.toString() : 'default_user';
    const userName = req.user && req.user.name ? String(req.user.name) : 'Student';
    const userRole = req.user && req.user.role ? String(req.user.role) : 'student';

    // 1. Save User Question to MongoDB
    await ChatMessage.create({
      user: req.user._id,
      sender: 'user',
      role: userRole,
      text: query
    });

    // 2. Forward query with thread_id = userId to FastAPI LangGraph Multi-Agent Engine
    let agentResponseText = "Hello! I am your DepartmentAI Academic Secretary. How can I assist you today?";
    let agentRoleText = "Autonomous Multi-Agent System";
    let agentChain = [];
    let goal = "";
    let needsHumanApproval = false;
    let humanApprovalContext = null;

    try {
      let aiRes;
      const payload = {
        user_name: String(userName),
        user_role: String(userRole),
        department: String(req.user?.department || 'Computer Science & Engineering'),
        semester: String(req.user?.semester || '6th Semester'),
        section: String(req.user?.section || 'Section A'),
        query: String(query),
        thread_id: String(userId)
      };

      try {
        aiRes = await axios.post(`${AI_SERVICE_URL}/api/ai/query`, payload, {
          timeout: 25000,
          family: 4
        });
      } catch (firstErr) {
        console.warn('[aiController] Primary endpoint failed, retrying http://127.0.0.1:8000...', firstErr.message);
        aiRes = await axios.post(`http://127.0.0.1:8000/api/ai/query`, payload, {
          timeout: 25000,
          family: 4
        });
      }

      if (aiRes && aiRes.data) {
        if (aiRes.data.final_response) {
          agentResponseText = aiRes.data.final_response;
        }
        if (aiRes.data.intent) {
          agentRoleText = aiRes.data.intent;
        }
        if (aiRes.data.agent_chain) {
          agentChain = aiRes.data.agent_chain;
        }
        goal = aiRes.data.goal || '';
        needsHumanApproval = !!aiRes.data.needs_human_approval;
        humanApprovalContext = aiRes.data.human_approval_context || null;
      }
    } catch (aiErr) {
      console.error('FastAPI Agent Connection Critical Error:', aiErr.response ? aiErr.response.data : aiErr.message);
      agentResponseText = `[Multi-Agent Error]: Unable to reach AI Service (${aiErr.message}). Please ensure uvicorn is running on port 8000.`;
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
      agent_chain: agentChain,
      goal,
      needs_human_approval: needsHumanApproval,
      human_approval_context: humanApprovalContext,
      text: agentResponseText,
      createdAt: agentMsg.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Stream response from LangGraph AI Agent & save chat history
// @route   POST /api/ai/stream-query
// @access  Private
export const streamAiQuery = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    const userId = req.user && req.user._id ? req.user._id.toString() : 'default_user';
    const userName = req.user && req.user.name ? String(req.user.name) : 'Student';
    const userRole = req.user && req.user.role ? String(req.user.role) : 'student';

    // 1. Save User Question to MongoDB
    await ChatMessage.create({
      user: req.user._id,
      sender: 'user',
      role: userRole,
      text: query
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const payload = {
      user_name: String(userName),
      user_role: String(userRole),
      department: String(req.user?.department || 'Computer Science & Engineering'),
      semester: String(req.user?.semester || '6th Semester'),
      section: String(req.user?.section || 'Section A'),
      query: String(query),
      thread_id: String(userId)
    };

    let fullFinalResponse = '';
    let lastChain = [];

    try {
      const response = await axios({
        method: 'post',
        url: `${AI_SERVICE_URL}/api/ai/stream-query`,
        data: payload,
        responseType: 'stream',
        timeout: 30000
      });

      response.data.on('data', chunk => {
        const textChunk = chunk.toString();
        res.write(textChunk);

        const lines = textChunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && !line.includes('[DONE]')) {
            try {
              const parsed = JSON.parse(line.slice(6));
              if (parsed.final_response) fullFinalResponse = parsed.final_response;
              if (parsed.chain) lastChain = parsed.chain;
            } catch (e) {}
          }
        }
      });

      response.data.on('end', async () => {
        if (fullFinalResponse) {
          const agentRoleText = lastChain.length > 0 ? `Multi-Agent System (${lastChain.join(' ➔ ')})` : 'Autonomous Agent';
          await ChatMessage.create({
            user: req.user._id,
            sender: 'agent',
            role: agentRoleText,
            text: fullFinalResponse
          });
        }
        res.end();
      });

      response.data.on('error', err => {
        console.error('Stream error from AI service:', err.message);
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
      });

    } catch (streamErr) {
      console.error('Failed to initiate stream with AI service:', streamErr.message);
      res.write(`data: ${JSON.stringify({ error: 'AI Service streaming unavailable' })}\n\n`);
      res.end();
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
