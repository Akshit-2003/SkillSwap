import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../api';
import { apiRoutes } from '../routes/apiRoutes';
import { getStoredUser, storeUser } from '../utils/auth';

const StatCounter = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = currentTime - startTime;

      if (progress < duration) {
        // Ease out quart for smooth animation
        const percentage = 1 - Math.pow(1 - progress / duration, 4);
        setCount(Math.floor(percentage * end));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count}{suffix}</span>;
};

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState('learning');
  const [showModal, setShowModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSession, setRatingSession] = useState(null);
  const [modalType, setModalType] = useState('offered'); // 'offered' or 'wanted'
  const [skillForm, setSkillForm] = useState({
    name: '',
    category: 'Development',
    proficiency: 'Beginner',
    description: '',
    proofs: [],
    certificateFile: null
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const parsedUser = getStoredUser();
      if (parsedUser) {
        try {
          const response = await fetch(buildApiUrl(`${apiRoutes.user.profile}?email=${encodeURIComponent(parsedUser.email)}`));
          if (response.ok) {
            const data = await response.json();
            if (data.rating === undefined) data.rating = 4.8;
            if (data.ratingCount === undefined) data.ratingCount = 12;
            setUser(data);
            storeUser(data);
          } else {
            setUser(parsedUser);
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          setUser(parsedUser);
        }
      } else {
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleOpenModal = (type) => {
    setModalType(type);
    setSkillForm({
      name: '',
      category: 'Development',
      proficiency: 'Beginner',
      description: '',
      proofs: [],
      certificateFile: null
    });
    setIsVerifying(false);
    setShowModal(true);
  };

  const handleProofToggle = (proof) => {
    setSkillForm(prev => {
      const newProofs = prev.proofs.includes(proof)
        ? prev.proofs.filter(p => p !== proof)
        : [...prev.proofs, proof];
      
      return { ...prev, proofs: newProofs };
    });
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();

    if (skillForm.proofs.length < 2) {
      alert("Please select at least 2 verification methods.");
      return;
    }

    if (skillForm.proofs.includes('Certificate') && !skillForm.certificateFile) {
      alert("Please upload a certificate file.");
      return;
    }

    setIsVerifying(true);

    try {
      // Simulate sending verification request to admin/teacher
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Formatting the skill string to include details (since backend expects string)
      const skillString = `${skillForm.name} (${skillForm.proficiency}) [Pending Approval: ${skillForm.proofs.join(', ')}]`;

      const formData = new FormData();
      formData.append('email', user.email);
      formData.append('skill', skillString);
      formData.append('type', modalType);
      if (skillForm.certificateFile) {
        formData.append('certificateFile', skillForm.certificateFile);
      }

      const response = await fetch(buildApiUrl(apiRoutes.user.skills), {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        storeUser(data.user);
        setShowModal(false);
        alert("Verification request sent to Admin! Your skill is pending approval.");
      }
    } catch (error) {
      console.error('Error adding skill:', error);
      alert("Failed to verify or add skill.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCompleteSession = (session) => {
    setRatingValue(0);
    setRatingComment('');
    setRatingSession(session);
    setShowRatingModal(true);
  };

  const submitRating = async () => {
    if (ratingValue === 0) {
      alert("Rating is mandatory! Please select a star rating to complete the session.");
      return;
    }
    try {
      const response = await fetch(buildApiUrl(apiRoutes.user.sessionFeedback), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submittedByEmail: user.email,
          teacherName: ratingSession?.teacherName || 'Community Mentor',
          teacherEmail: ratingSession?.teacherEmail || '',
          skillTaught: ratingSession?.skillTaught || user.skillsWanted?.[0] || 'General Session',
          rating: ratingValue,
          complaint: ratingComment
        })
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || data.error || 'Failed to submit rating.');
        return;
      }
      if (data.teacher && data.teacher.email === user.email) {
        setUser(data.teacher);
        storeUser(data.teacher);
      }
      alert(`Session completed! You rated it ${ratingValue} stars.`);
      setShowRatingModal(false);
    } catch (error) {
      console.error('Session feedback error:', error);
      alert('Could not connect to backend to submit the rating.');
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <div className="dashboard-header">
        <div style={{ textAlign: 'left' }}>
          <h2>Welcome back, <span style={{ color: '#646cff' }}>{user.name}</span>! 👋</h2>
          <p style={{ opacity: 0.7 }}>Here's what's happening with your skills today.</p>
        </div>
        <div className="view-toggle">
          <button 
            className={viewMode === 'learning' ? 'active' : ''} 
            onClick={() => setViewMode('learning')}
          >
            Learning
          </button>
          <button 
            className={viewMode === 'teaching' ? 'active' : ''} 
            onClick={() => setViewMode('teaching')}
          >
            Teaching
          </button>
          <button 
            className={viewMode === 'certificates' ? 'active' : ''} 
            onClick={() => setViewMode('certificates')}
          >
            Certificates
          </button>
        </div>
      </div>

      {viewMode === 'learning' ? (
        <>
          {/* Learning Stats */}
          <div className="dashboard-stats">
            <div className="stat-card">
              <h4><StatCounter end={user.credits !== undefined ? user.credits : 5} /></h4>
              <p>Learning Credits</p>
            </div>
            <div className="stat-card">
              <h4><StatCounter end={user.skillsWanted?.length || 0} /></h4>
              <p>Skills Wanted</p>
            </div>
            <div className="stat-card">
              <h4><StatCounter end={12} /></h4>
              <p>Total Swaps</p>
            </div>
            <div className="stat-card">
              <h4><StatCounter end={45} suffix="h" /></h4>
              <p>Hours Learned</p>
            </div>
            <div className="stat-card">
              <h4>{user.rating} ⭐</h4>
              <p>My Rating</p>
            </div>
          </div>

          {/* Learning Journey Section */}
          <div className="dashboard-grid" style={{ marginTop: '0', marginBottom: '2rem' }}>
            <div className="skill-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🚀 Your Learning Journey</h3>
              <div className="progress-container">
                <div className="progress-item">
                  <div className="progress-header">
                    <span>Advanced React Patterns</span>
                    <span>75%</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: '75%' }}></div></div>
                </div>
                <div className="progress-item">
                  <div className="progress-header">
                    <span>UI/UX Design Fundamentals</span>
                    <span>40%</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: '40%', background: '#bc13fe' }}></div></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="dashboard-grid">
            <div className="skill-card">
              <h3>Skills I Want to Learn</h3>
              <ul className="skill-list">
                {user.skillsWanted && user.skillsWanted.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
              <div className="add-skill-box">
                <button className="btn-primary" style={{ width: '100%' }} onClick={() => handleOpenModal('wanted')}>
                  + Add New Skill
                </button>
              </div>
            </div>

            <div className="skill-card">
              <h3>📅 Upcoming Sessions</h3>
              <div className="session-list">
                <div className="session-item">
                  <div className="session-date">
                    <span className="day">15</span>
                    <span className="month">OCT</span>
                  </div>
                  <div className="session-details">
                    <strong>React Hooks Deep Dive</strong>
                    <small>with Sarah Jenkins • 10:00 AM</small>
                  </div>
                  <button className="btn-primary" style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={() => handleCompleteSession({ teacherName: 'Sarah Jenkins', teacherEmail: '', skillTaught: 'React Hooks Deep Dive' })}>Complete</button>
                </div>
                <div className="session-item">
                  <div className="session-date">
                    <span className="day">18</span>
                    <span className="month">OCT</span>
                  </div>
                  <div className="session-details">
                    <strong>Guitar Basics</strong>
                    <small>with Mike Taylor • 2:00 PM</small>
                  </div>
                  <button className="btn-outline" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>Join</button>
                </div>
              </div>
            </div>
          </div>

          {/* New Learning Content */}
          <div className="dashboard-grid">
            <div className="skill-card">
              <h3>🏆 Top Mentors</h3>
              <div className="mentors-list">
                <div className="mentor-item">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="avatar" style={{ background: '#4f46e5' }}>JD</div>
                    <div>
                      <strong>John Doe</strong>
                      <small style={{ display: 'block', color: '#aaa', fontSize: '0.8rem' }}>React Expert</small>
                    </div>
                  </div>
                  <button className="btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Follow</button>
                </div>
                <div className="mentor-item">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="avatar" style={{ background: '#10b981' }}>AS</div>
                    <div>
                      <strong>Anna Smith</strong>
                      <small style={{ display: 'block', color: '#aaa', fontSize: '0.8rem' }}>UX Designer</small>
                    </div>
                  </div>
                  <button className="btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Follow</button>
                </div>
              </div>
            </div>
            <div className="skill-card">
              <h3>⚡ Daily Challenges</h3>
              <div className="challenges-list">
                <div className="challenge-item">
                  <strong>Build a To-Do App</strong>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>Easy</span>
                </div>
                <div className="challenge-item">
                  <strong>API Integration</strong>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>Medium</span>
                </div>
                <div className="challenge-item">
                  <strong>Optimize Algorithms</strong>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>Hard</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : viewMode === 'teaching' ? (
        <>
          {/* Teaching Stats */}
          <div className="dashboard-stats">
            <div className="stat-card">
              <h4><StatCounter end={user.skillsOffered?.length || 0} /></h4>
              <p>Skills Offered</p>
            </div>
            <div className="stat-card">
              <h4><StatCounter end={3} /></h4>
              <p>Pending Requests</p>
            </div>
            <div className="stat-card">
              <h4><StatCounter end={15} suffix="h" /></h4>
              <p>Hours Taught</p>
            </div>
            <div className="stat-card">
              <h4>{user.rating} ⭐</h4>
              <p>My Rating</p>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="skill-card">
              <h3>Skills I Can Teach</h3>
              <ul className="skill-list">
                {user.skillsOffered && user.skillsOffered.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
              <div className="add-skill-box">
                <button className="btn-primary" style={{ width: '100%' }} onClick={() => handleOpenModal('offered')}>
                  + Add New Skill
                </button>
              </div>
            </div>

            <div className="skill-card">
              <h3>🔥 Recommended Matches</h3>
              <div className="matches-list">
                <div className="match-item">
                  <div className="avatar" style={{ background: '#ff6b6b' }}>SJ</div>
                  <div className="match-info">
                    <strong>Sarah Jenkins</strong>
                    <small>Wants to learn: {user.skillsOffered?.[0] || 'Coding'}</small>
                  </div>
                  <button className="btn-outline" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>Connect</button>
                </div>
                <div className="match-item">
                  <div className="avatar" style={{ background: '#f9cb28' }}>MT</div>
                  <div className="match-info">
                    <strong>Mike Taylor</strong>
                    <small>Wants to learn: {user.skillsOffered?.[0] || 'Coding'}</small>
                  </div>
                  <button className="btn-outline" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>Connect</button>
                </div>
              </div>
            </div>
          </div>

          {/* New Teaching Content */}
          <div className="dashboard-grid">
            <div className="skill-card">
              <h3>🌟 Student Reviews</h3>
              <div className="reviews-list">
                <div className="review-item">
                  <p>"Great teacher! Explained concepts clearly and helped me debug my code."</p>
                  <small>- Alice (Python)</small>
                </div>
                <div className="review-item">
                  <p>"Very patient and knowledgeable. Highly recommended!"</p>
                  <small>- Bob (JavaScript)</small>
                </div>
              </div>
            </div>

            <div className="skill-card">
              <h3>📅 My Teaching Schedule</h3>
              <div className="session-list">
                <div className="session-item">
                  <div className="session-date">
                    <span className="day">20</span>
                    <span className="month">OCT</span>
                  </div>
                  <div className="session-details">
                    <strong>Intro to Python</strong>
                    <small>Student: Alice • 4:00 PM</small>
                  </div>
                  <button className="btn-primary" style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={() => handleCompleteSession({ teacherName: user.name, teacherEmail: user.email, skillTaught: 'Intro to Python' })}>Complete</button>
                </div>
                <div className="session-item">
                  <div className="session-date">
                    <span className="day">22</span>
                    <span className="month">OCT</span>
                  </div>
                  <div className="session-details">
                    <strong>Advanced JS Patterns</strong>
                    <small>Student: Bob • 2:00 PM</small>
                  </div>
                  <button className="btn-outline" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>Start</button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Certificates Stats */}
          <div className="dashboard-stats">
            <div className="stat-card">
              <h4><StatCounter end={5} /></h4>
              <p>Certificates Earned</p>
            </div>
            <div className="stat-card">
              <h4><StatCounter end={2} /></h4>
              <p>In Progress</p>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="skill-card">
              <h3>🎓 My Certificates</h3>
              <div className="session-list">
                <div className="session-item">
                  <div className="session-date" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
                    <span className="day" style={{ color: '#10b981' }}>✔</span>
                  </div>
                  <div className="session-details">
                    <strong>Advanced React Patterns</strong>
                    <small>Issued by SkillSwap • Oct 2023</small>
                  </div>
                  <button className="btn-outline" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>Download</button>
                </div>
                <div className="session-item">
                  <div className="session-date" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
                    <span className="day" style={{ color: '#10b981' }}>✔</span>
                  </div>
                  <div className="session-details">
                    <strong>UI/UX Fundamentals</strong>
                    <small>Issued by SkillSwap • Sep 2023</small>
                  </div>
                  <button className="btn-outline" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>Download</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Shared Activity Section */}
      <div className="dashboard-grid">
        <div className="skill-card">
          <h3>📢 Recent Activity</h3>
          <ul className="activity-list">
            <li>
              <span className="activity-icon">✅</span>
              <div>
                <strong>Profile Updated</strong>
                <small>You added new skills to your profile.</small>
              </div>
            </li>
            <li>
              <span className="activity-icon">📩</span>
              <div>
                <strong>New Message</strong>
                <small>Alex wants to swap skills with you.</small>
              </div>
            </li>
            <li>
              <span className="activity-icon">🌟</span>
              <div>
                <strong>New Review</strong>
                <small>You received 5 stars from Elena.</small>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Add Skill Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add {modalType === 'offered' ? 'Teaching' : 'Learning'} Skill</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddSkill} style={{ marginTop: 0 }}>
              <div className="form-group">
                <label>Skill Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. React, Guitar, Spanish" 
                  value={skillForm.name}
                  onChange={(e) => setSkillForm({...skillForm, name: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={skillForm.category} onChange={(e) => setSkillForm({...skillForm, category: e.target.value})}>
                  <option>Development</option>
                  <option>Design</option>
                  <option>Music</option>
                  <option>Language</option>
                  <option>Lifestyle</option>
                </select>
              </div>
              <div className="form-group">
                <label>Proficiency Level</label>
                <select value={skillForm.proficiency} onChange={(e) => setSkillForm({...skillForm, proficiency: e.target.value, proofs: [], certificateFile: null})}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>Expert</option>
                </select>
              </div>
              <div className="form-group">
                <label>Proficiency Proof (Select at least 2)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input 
                      type="checkbox" 
                      checked={skillForm.proofs.includes('Certificate')}
                      onChange={() => handleProofToggle('Certificate')}
                      style={{ width: 'auto' }}
                    />
                    Upload Certificate
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input 
                      type="checkbox" 
                      checked={skillForm.proofs.includes(skillForm.proficiency === 'Beginner' ? 'Basic Test' : 'Assessment')}
                      onChange={() => handleProofToggle(skillForm.proficiency === 'Beginner' ? 'Basic Test' : 'Assessment')}
                      style={{ width: 'auto' }}
                    />
                    {skillForm.proficiency === 'Beginner' ? 'Basic Skill Quiz' : 'Standard Assessment Test'}
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input 
                      type="checkbox" 
                      checked={skillForm.proofs.includes('Live Interaction')}
                      onChange={() => handleProofToggle('Live Interaction')}
                      style={{ width: 'auto' }}
                    />
                    5-min Live Video Interaction
                  </label>
                </div>
              </div>
              {skillForm.proofs.includes('Certificate') && (
                <div className="form-group">
                  <label>Upload Certificate</label>
                  <input 
                    type="file" 
                    style={{ padding: '8px' }} 
                    onChange={(e) => setSkillForm({...skillForm, certificateFile: e.target.files[0]})}
                  />
                </div>
              )}
              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea placeholder="Briefly describe your experience or goals..." value={skillForm.description} onChange={(e) => setSkillForm({...skillForm, description: e.target.value})}></textarea>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isVerifying}>
                {isVerifying ? 'Sending Request...' : 'Send Verification Request'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mandatory Rating Modal */}
      {showRatingModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center', maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Rate Session</h3>
            <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>Session complete! Please rate your experience to continue.</p>
            <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '10px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star} 
                  onClick={() => setRatingValue(star)}
                  style={{ color: star <= ratingValue ? '#fbbf24' : '#444', transition: 'color 0.2s' }}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea 
              placeholder="Write a brief review (optional)..." 
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #333', background: '#222', color: '#fff', marginBottom: '1.5rem', minHeight: '80px' }}
            ></textarea>
            <button className="btn-primary" onClick={submitRating} style={{ width: '100%' }}>Submit Rating</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
