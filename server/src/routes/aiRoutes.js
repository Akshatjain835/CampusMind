import express from 'express';
import axios from 'axios';

const router = express.Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// @route  POST /api/ai/query
// @desc   Forward query to FastAPI LangGraph multi-agent service
router.post('/query', async (req, res) => {
  try {
    const { query, user_name, user_role } = req.body;
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/query`, {
      query,
      user_name: user_name || req.user?.name || 'User',
      user_role: user_role || req.user?.role || 'student'
    });
    res.json(response.data);
  } catch (error) {
    console.error('[AI Gateway Proxy Error]:', error.message);
    res.status(500).json({
      message: 'AI Service communication error',
      details: error.response?.data || error.message
    });
  }
});

// @route  POST /api/ai/search
// @desc   Forward document search query to ChromaDB RAG vector engine
router.post('/search', async (req, res) => {
  try {
    const { query, top_k } = req.body;
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/search`, {
      query,
      top_k: top_k || 3
    });
    res.json(response.data);
  } catch (error) {
    console.error('[RAG Search Proxy Error]:', error.message);
    res.status(500).json({
      message: 'RAG Search Service error',
      details: error.response?.data || error.message
    });
  }
});

// @route  POST /api/ai/ingest
// @desc   Trigger RAG document ingestion
router.post('/ingest', async (req, res) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/ingest`);
    res.json(response.data);
  } catch (error) {
    console.error('[RAG Ingestion Error]:', error.message);
    res.status(500).json({
      message: 'Document ingestion failed',
      details: error.response?.data || error.message
    });
  }
});

export default router;
