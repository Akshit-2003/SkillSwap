import React, { useState, useEffect } from 'react';

// Reusing PageContainer style for consistency
const PageContainer = ({ title, children }) => (
  <div className="page-content admin-page-container teacher-admin-page" style={{ textAlign: 'left', animation: 'fadeInUp 0.5s ease-out', maxWidth: '1200px', margin: '0 auto' }}>
    <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', background: 'linear-gradient(to right, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>{title}</h1>
    {children}
  </div>
);

const TeacherAdmin = () => {
  const [pendingSkills, setPendingSkills] = useState([]);
  const [topTeachers, setTopTeachers] = useState([]);

  useEffect(() => {
    // In a real application, fetch from backend: fetch('http://localhost:5000/admin/pending-skills')
    // Mock data for demonstration
    setPendingSkills([
      { id: 1, user: 'John Doe', email: 'john@example.com', skill: 'React (Advanced)', proof: 'Certificate.pdf', date: '2023-10-25' },
      { id: 2, user: 'Alice Smith', email: 'alice@example.com', skill: 'Guitar (Beginner)', proof: 'Video Link', date: '2023-10-24' },
      { id: 3, user: 'Bob Jones', email: 'bob@example.com', skill: 'French (Intermediate)', proof: 'Quiz Result', date: '2023-10-23' },
    ]);

    // Mock Top Teachers Data
    setTopTeachers([
      { id: 101, name: 'Sarah Wilson', skill: 'Python', students: 45, rating: 4.9 },
      { id: 102, name: 'Mike Ross', skill: 'Legal Studies', students: 32, rating: 4.8 },
      { id: 103, name: 'Jessica Pearson', skill: 'Public Speaking', students: 28, rating: 5.0 },
      { id: 104, name: 'Harvey Specter', skill: 'Negotiation', students: 40, rating: 4.7 },
    ]);
  }, []);

  const handleApprove = (id) => {
    // Logic to approve skill (e.g., API call)
    alert(`Skill request ${id} approved!`);
    setPendingSkills(pendingSkills.filter(skill => skill.id !== id));
  };

  const handleReject = (id) => {
    // Logic to reject skill (e.g., API call)
    alert(`Skill request ${id} rejected.`);
    setPendingSkills(pendingSkills.filter(skill => skill.id !== id));
  };

  return (
    <PageContainer title="Teacher Admin Dashboard">
      <div id="overview" className="dashboard-stats">
        <div className="stat-card">
          <h4 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', background: 'linear-gradient(135deg, #646cff 0%, #bc13fe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{pendingSkills.length}</h4>
          <p style={{ color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>Pending Requests</p>
        </div>
        <div className="stat-card">
          <h4 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', background: 'linear-gradient(135deg, #646cff 0%, #bc13fe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>150</h4>
          <p style={{ color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>Total Verified Skills</p>
        </div>
        <div className="stat-card">
          <h4 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', background: 'linear-gradient(135deg, #646cff 0%, #bc13fe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>45</h4>
          <p style={{ color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>Active Teachers</p>
        </div>
      </div>

      <div className="dashboard-grid teacher-admin-grid" style={{ marginTop: '2rem', gridTemplateColumns: '1fr' }}>
        {/* Pending Requests Section */}
        <div id="requests" className="skill-card">
          <h3>Pending Skill Verifications</h3>
          {pendingSkills.length === 0 ? (
            <p style={{ color: '#aaa', padding: '1rem' }}>No pending requests.</p>
          ) : (
            <div className="session-list">
              {pendingSkills.map(request => (
                <div key={request.id} className="session-item admin-request-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div className="admin-request-meta" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="avatar" style={{ background: '#646cff' }}>{request.user.charAt(0)}</div>
                    <div>
                      <strong style={{ color: '#fff', fontSize: '1rem' }}>{request.user}</strong>
                      <div style={{ fontSize: '0.85rem', color: '#aaa' }}>{request.email}</div>
                      <div style={{ color: '#fff', marginTop: '4px' }}>Wants to teach: <span style={{ color: '#bc13fe' }}>{request.skill}</span></div>
                      <div style={{ fontSize: '0.8rem', color: '#888' }}>Proof: {request.proof}</div>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>Submitted: {request.date}</div>
                    </div>
                  </div>
                  <div className="admin-request-actions" style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-outline" onClick={() => window.open('#', '_blank')} style={{ fontSize: '0.8rem' }}>View Proof</button>
                    <button className="btn-primary" onClick={() => handleApprove(request.id)} style={{ fontSize: '0.8rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' }}>Approve</button>
                    <button className="btn-danger" onClick={() => handleReject(request.id)} style={{ fontSize: '0.8rem' }}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Performing Teachers Section */}
        <div id="instructors" className="skill-card" style={{ marginTop: '2rem' }}>
          <h3>Top Performing Instructors</h3>
          <div className="table-container responsive-table" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e0e0e0', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem' }}>Instructor</th>
                  <th style={{ padding: '1rem' }}>Primary Skill</th>
                  <th style={{ padding: '1rem' }}>Active Students</th>
                  <th style={{ padding: '1rem' }}>Rating</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {topTeachers.map(teacher => (
                  <tr key={teacher.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{teacher.name}</td>
                    <td style={{ padding: '1rem', color: '#aaa' }}>{teacher.skill}</td>
                    <td style={{ padding: '1rem' }}>{teacher.students}</td>
                    <td style={{ padding: '1rem', color: '#f9cb28' }}>★ {teacher.rating}</td>
                    <td style={{ padding: '1rem' }}><span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default TeacherAdmin;
