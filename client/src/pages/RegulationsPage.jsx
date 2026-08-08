import React, { useState } from 'react';
import { Search, BookOpen, FileText, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export const RegulationsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, top_k: 4 })
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (err) {
      console.error('Qdrant Search Error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{
        padding: '32px',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Sparkles size={20} color="#38bdf8" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Qdrant Vector Database RAG Engine
          </span>
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
          Academic Regulations & Compliance Knowledge Base
        </h1>
        <p style={{ fontSize: '0.92rem', color: '#cbd5e1', marginTop: '6px', maxWidth: '650px' }}>
          Perform direct semantic vector search against university ordinances, examination rules, NAAC/NBA accreditation criteria, and GPU compute policies.
        </p>

        {/* Search Input Bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="e.g. What is the attendance requirement for mid-sem exams? Or GPU cluster allocation rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '48px', fontSize: '0.95rem' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isSearching} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 24px' }}>
            <Search size={18} /> {isSearching ? 'Searching Vectors...' : 'Search Regulations'}
          </button>
        </form>
      </div>

      {/* Results Display */}
      {results && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} color="#38bdf8" /> Retrieved Policy Contexts ({results.results_count} Vector Hits)
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 700 }}>
              Vector Engine: {results.vector_store || 'Qdrant Cloud'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {results.contexts?.map((hit, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #38bdf8' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', padding: '2px 8px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.12)' }}>
                    📄 {hit.source} (Chunk #{hit.chunk_index})
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 700 }}>
                    Relevance Score: {(hit.similarity_score * 100).toFixed(1)}%
                  </span>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                  "{hit.chunk.trim()}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
