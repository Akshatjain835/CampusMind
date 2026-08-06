import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, BookOpen, User, MapPin, Award, CheckCircle2, FileText, ChevronRight } from 'lucide-react';

const DEPARTMENT_COURSES_CATALOG = {
  'Computer Science & Engineering': [
    { code: 'CS601', name: 'Compiler Design', faculty: 'Dr. R. K. Sharma', credits: 4, type: 'Core Theory', room: 'LH-201', topics: 'Lexical Analysis, Parsing, Syntax Directed Translation, Code Gen' },
    { code: 'CS602', name: 'Computer Networks', faculty: 'Prof. Anita Roy', credits: 4, type: 'Core Theory', room: 'LH-201', topics: 'TCP/IP Model, Routing Algorithms, Transport Layer Protocols, Security' },
    { code: 'CS603', name: 'Artificial Intelligence', faculty: 'Dr. V. Patel', credits: 3, type: 'Elective', room: 'LH-204', topics: 'Search Algorithms, Knowledge Representation, Machine Learning, Neural Nets' },
    { code: 'CS604', name: 'AI & Data Science Lab', faculty: 'Dr. V. Patel', credits: 2, type: 'Practical Lab', room: 'AI Lab 101', topics: 'Python, PyTorch, Pandas, Scikit-Learn, Model Training' },
    { code: 'CS605', name: 'Networks & Security Lab', faculty: 'Prof. Anita Roy', credits: 2, type: 'Practical Lab', room: 'Net Lab 102', topics: 'Wireshark, Packet Sniffing, Socket Programming, Firewall Setup' },
    { code: 'CS606', name: 'Mini Project & Seminar', faculty: 'Dr. R. K. Sharma', credits: 2, type: 'Project Work', room: 'Seminar Hall', topics: 'Full Stack Development, AI Agent Systems, Technical Documentation' }
  ],
  'Electronics & Communication Engineering': [
    { code: 'EC601', name: 'Analog & Digital Signal Processing', faculty: 'Dr. A. Verma', credits: 4, type: 'Core Theory', room: 'LH-105', topics: 'Fourier Transforms, Z-Transforms, FIR/IIR Filter Design, DSP Chips' },
    { code: 'EC602', name: 'VLSI System Design', faculty: 'Prof. S. Gupta', credits: 4, type: 'Core Theory', room: 'LH-105', topics: 'CMOS Inverters, Layout Design Rules, Verilog HDL, Static Timing' },
    { code: 'EC603', name: 'Wireless Communication', faculty: 'Dr. M. Rao', credits: 3, type: 'Elective', room: 'LH-108', topics: 'Fading Channels, 4G/5G Cellular Systems, OFDM, MIMO Systems' },
    { code: 'EC604', name: 'VLSI Design Lab', faculty: 'Prof. S. Gupta', credits: 2, type: 'Practical Lab', room: 'VLSI Lab 201', topics: 'Cadence EDA Tools, Cadence Virtuoso, Circuit Simulation' },
    { code: 'EC605', name: 'Microwave & Antenna Lab', faculty: 'Dr. M. Rao', credits: 2, type: 'Practical Lab', room: 'Comm Lab 202', topics: 'Vector Network Analyzers, Horn Antennas, Microstrip Patch' }
  ]
};

export const EnrolledCoursesModal = ({ isOpen, onClose, user }) => {
  const department = user?.department || 'Computer Science & Engineering';
  const courses = DEPARTMENT_COURSES_CATALOG[department] || DEPARTMENT_COURSES_CATALOG['Computer Science & Engineering'];
  const [selectedCourse, setSelectedCourse] = useState(courses[0]);

  if (!isOpen) return null;

  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(10px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel animate-scale-in" style={{
        maxWidth: '840px',
        width: '100%',
        maxHeight: '88vh',
        overflowY: 'auto',
        padding: '30px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
        border: '1px solid rgba(56, 189, 248, 0.3)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              padding: '10px',
              borderRadius: '12px',
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)'
            }}>
              <BookOpen size={24} color="#38bdf8" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Enrolled Courses & Academic Curriculum</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {user?.department || 'CSE'} • {courses.length} Enrolled Courses • Total {totalCredits} Credits
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Master Details Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px' }}>
          
          {/* Left Course List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#a5b4fc', textTransform: 'uppercase' }}>
              Select Course
            </h4>
            {courses.map((c) => (
              <div 
                key={c.code}
                onClick={() => setSelectedCourse(c)}
                style={{
                  background: selectedCourse?.code === c.code ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${selectedCourse?.code === c.code ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}`,
                  borderRadius: '10px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.88rem', color: selectedCourse?.code === c.code ? '#38bdf8' : '#e5e7eb' }}>
                    {c.code}: {c.name}
                  </strong>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    👨‍🏫 {c.faculty} ({c.credits} Credits)
                  </div>
                </div>
                <ChevronRight size={16} color={selectedCourse?.code === c.code ? '#38bdf8' : '#6b7280'} />
              </div>
            ))}
          </div>

          {/* Right Selected Course Detail Panel */}
          {selectedCourse && (
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '14px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '10px',
                  background: selectedCourse.type.includes('Lab') ? 'rgba(192, 132, 252, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                  color: selectedCourse.type.includes('Lab') ? '#c084fc' : '#38bdf8',
                  border: `1px solid ${selectedCourse.type.includes('Lab') ? '#c084fc' : '#38bdf8'}`
                }}>
                  {selectedCourse.type}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginTop: '8px', color: '#fff' }}>
                  {selectedCourse.code}: {selectedCourse.name}
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Assigned Faculty</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e5e7eb', marginTop: '2px' }}>
                    👨‍🏫 {selectedCourse.faculty}
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Classroom / Lab Venue</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24', marginTop: '2px' }}>
                    🏫 {selectedCourse.room}
                  </div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  Curriculum & Key Syllabus Modules:
                </span>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  color: '#d1d5db',
                  marginTop: '6px',
                  lineHeight: 1.5
                }}>
                  {selectedCourse.topics}
                </div>
              </div>

              <div style={{
                background: 'rgba(52, 211, 153, 0.1)',
                border: '1px solid rgba(52, 211, 153, 0.2)',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={16} />
                <span>Enrolled & Verified under University Choice-Based Credit System (CBCS)</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
};
