import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../api';
import { apiRoutes } from '../routes/apiRoutes';
import { getStoredUser, storeUser } from '../utils/auth';

// Helper for page container to ensure consistent spacing and animation
const PageContainer = ({ title, children }) => (
  <div className="page-content dashboard-page-container" style={{ textAlign: 'left', animation: 'fadeInUp 0.5s ease-out', maxWidth: '1200px', margin: '0 auto' }}>
    <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', background: 'linear-gradient(to right, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>{title}</h1>
    {children}
  </div>
);

export const FindSkills = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [skills, setSkills] = useState([
    { id: 1, name: 'React Development', mentor: 'Sarah J.', level: 'Advanced', rating: 4.9, image: '⚛️' },
    { id: 2, name: 'Guitar Basics', mentor: 'Mike T.', level: 'Beginner', rating: 4.8, image: '🎸' },
    { id: 3, name: 'Spanish Conversation', mentor: 'Elena R.', level: 'Intermediate', rating: 5.0, image: '🇪🇸' },
    { id: 4, name: 'Digital Marketing', mentor: 'Alex B.', level: 'Expert', rating: 4.7, image: '📈' },
    { id: 5, name: 'Python for Data Science', mentor: 'David K.', level: 'Intermediate', rating: 4.9, image: '🐍' },
    { id: 6, name: 'Photography Masterclass', mentor: 'Lisa M.', level: 'All Levels', rating: 4.8, image: '📸' },
  ]);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }

    // Fetch global skills from backend
    const fetchSkills = async () => {
      try {
        const response = await fetch(buildApiUrl(apiRoutes.platform.skills));
        if (response.ok) {
          const data = await response.json();
          // Assuming data is an array of { name: "User Name", skill: "Skill String", ... }
          if (Array.isArray(data)) {
            const globalSkills = data.map((item, index) => {
              // Parse the skill string format: "Name (Proficiency) [Proof...]"
              let skillName = item.skill;
              let level = 'Unknown';
              
              // Try to extract name and proficiency
              const match = item.skill.match(/^(.*?) \((.*?)\)/);
              if (match) {
                skillName = match[1];
                level = match[2];
              }

              return {
                id: `global-${index}`,
                name: skillName,
                mentor: item.name || item.email || 'Community Member',
                level: level,
                rating: 'New',
                image: '🆕'
              };
            });
            setSkills(prevSkills => [...prevSkills, ...globalSkills]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch global skills:", error);
      }
    };

    fetchSkills();
  }, []);

  const filteredSkills = skills.filter(skill => skill.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleRequestSwap = async (skillName) => {
    if (!user) return;

    try {
      const response = await fetch(buildApiUrl(apiRoutes.user.swapRequests), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, skillName }),
      });

      const data = await response.json();

      if (response.ok) {
        const updatedUser = data.user;
        setUser(updatedUser);
        storeUser(updatedUser);
        alert(`Swap requested for ${skillName}! 1 credit deducted. Remaining credits: ${updatedUser.credits}`);
      } else {
        alert(data.message || "Insufficient credits! You need at least 1 credit to learn a new skill.");
      }
    } catch (error) {
      console.error("Error requesting swap:", error);
      alert("Failed to connect to server.");
    }
  };

  return (
    <PageContainer title="Find Skills">
      <div style={{ marginBottom: '2rem' }}>
        <input 
          type="text" 
          placeholder="Search for a skill (e.g., React, Guitar)..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
        />
      </div>
      <div className="dashboard-grid" style={{ marginTop: 0 }}>
        {filteredSkills.map(skill => (
          <div key={skill.id} className="card" style={{ textAlign: 'left', padding: '1.5rem', margin: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{skill.image}</div>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>{skill.name}</h3>
            <p style={{ color: '#aaa', marginBottom: '1rem' }}>by {skill.mentor}</p>
            <div className="skill-meta-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', marginTop: 'auto' }}>
              <span style={{ background: 'rgba(100, 108, 255, 0.2)', color: '#646cff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem' }}>{skill.level}</span>
              <span style={{ color: '#fbbf24' }}>★ {skill.rating}</span>
            </div>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => handleRequestSwap(skill.name)}>Request Swap</button>
          </div>
        ))}
      </div>
    </PageContainer>
  );
};

export const MySkills = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserSkills = async () => {
      const storedUser = getStoredUser();
      if (storedUser) {
        try {
          const response = await fetch(buildApiUrl(`${apiRoutes.user.profile}?email=${encodeURIComponent(storedUser.email)}`));
          if (response.ok) {
            const data = await response.json();
            setUser(data);
          } else {
            setUser(storedUser);
          }
        } catch (e) {
          setUser(storedUser);
        }
      }
    };
    fetchUserSkills();
  }, []);

  if (!user) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Skills...</div>;

  return (
    <PageContainer title="My Skills">
      <div className="dashboard-grid" style={{ marginTop: 0 }}>
        <div className="skill-card">
          <h3>🎓 Learning</h3>
          <ul className="skill-list">
            {user.skillsWanted && user.skillsWanted.length > 0 ? (
              user.skillsWanted.map((skill, idx) => (
                <li key={idx}>
                  <span>{skill}</span>
                  <span style={{ fontSize: '0.8rem', color: '#aaa' }}>In Progress</span>
                </li>
              ))
            ) : (
              <li style={{ justifyContent: 'center', color: '#aaa' }}>No skills added yet.</li>
            )}
          </ul>
          <button className="btn-outline" style={{ width: '100%', marginTop: '1rem' }} onClick={() => navigate('/dashboard/find-skills')}>Find More Skills</button>
        </div>
        <div className="skill-card">
          <h3>👨‍🏫 Teaching</h3>
          <ul className="skill-list">
            {user.skillsOffered && user.skillsOffered.length > 0 ? (
              user.skillsOffered.map((skill, idx) => (
                <li key={idx}>
                  <span>{skill}</span>
                  <span style={{ fontSize: '0.8rem', color: '#10b981' }}>Active</span>
                </li>
              ))
            ) : (
              <li style={{ justifyContent: 'center', color: '#aaa' }}>No teaching skills yet.</li>
            )}
          </ul>
          <button className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => navigate('/dashboard')}>Add New Skill</button>
        </div>
      </div>
    </PageContainer>
  );
};

export const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      const storedUser = getStoredUser();
      if (storedUser) {
        try {
          const response = await fetch(buildApiUrl(`${apiRoutes.user.messages}?email=${encodeURIComponent(storedUser.email)}`));
          if (response.ok) {
            const data = await response.json();
            setConversations(data);
          } else {
            // Fallback mock data if backend endpoint not ready
            setConversations([
              { id: 1, name: 'Sarah Jenkins', lastMessage: 'Hey, are we still on for tomorrow?', time: '10:30 AM', unread: true, avatar: 'SJ', color: '#ff6b6b' },
              { id: 2, name: 'Mike Taylor', lastMessage: 'Thanks for the resources!', time: 'Yesterday', unread: false, avatar: 'MT', color: '#f9cb28' },
            ]);
          }
        } catch (e) {
          console.error("Fetch messages failed", e);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchMessages();
  }, []);

  return (
    <PageContainer title="Messages">
      <div className="messages-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', minHeight: '500px' }}>
        <div className="card" style={{ margin: 0, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: '600px' }}>
          {loading ? <p style={{textAlign: 'center', padding: '1rem'}}>Loading messages...</p> : conversations.length === 0 ? <p style={{textAlign: 'center', padding: '1rem'}}>No messages yet.</p> : conversations.map(conv => (
            <div key={conv.id} className="message-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '12px', borderRadius: '12px', background: conv.unread ? 'rgba(255,255,255,0.08)' : 'transparent', cursor: 'pointer', border: '1px solid transparent', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}>
              <div className="avatar" style={{ background: conv.color, width: '45px', height: '45px', fontSize: '1rem' }}>{conv.avatar}</div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div className="message-row-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '0.95rem', color: '#fff' }}>{conv.name}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#aaa' }}>{conv.time}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: conv.unread ? '#e0e0e0' : '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{conv.lastMessage}</p>
              </div>
              {conv.unread && <div style={{ width: '10px', height: '10px', background: '#646cff', borderRadius: '50%' }}></div>}
            </div>
          ))}
        </div>
        <div className="card" style={{ margin: 0, padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#aaa', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>💬</div>
          <h3>Select a conversation</h3>
          <p>Choose a contact from the list to start chatting.</p>
        </div>
      </div>
    </PageContainer>
  );
};

export const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', bio: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      const storedUser = getStoredUser();
      if (storedUser) {
        try {
          const response = await fetch(buildApiUrl(`${apiRoutes.user.profile}?email=${encodeURIComponent(storedUser.email)}`));
          if (response.ok) {
            const data = await response.json();
            setUser(data);
            setFormData({ name: data.name, bio: data.bio || '' });
          } else {
            setUser(storedUser);
            setFormData({ name: storedUser.name, bio: storedUser.bio || '' });
          }
        } catch (e) {
          setUser(storedUser);
        }
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(buildApiUrl(apiRoutes.user.updateProfile), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, ...formData }),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        storeUser(data.user);
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      console.error("Update failed:", error);
      alert("Server error.");
    }
  };

  if (!user) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Profile...</div>;

  return (
    <PageContainer title="Profile Settings">
      <div className="dashboard-grid" style={{ marginTop: 0, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className="card" style={{ margin: 0 }}>
          <div className="avatar" style={{ width: '120px', height: '120px', fontSize: '3rem', margin: '0 auto 1.5rem', background: 'linear-gradient(135deg, #646cff, #bc13fe)' }}>Me</div>
          <h3>{user.name}</h3>
          <p style={{ color: '#aaa' }}>{user.email}</p>
          <div style={{ margin: '1.5rem 0', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
            <div style={{ fontSize: '2rem', color: '#fbbf24', fontWeight: 'bold' }}>{user.rating || 4.8} ★</div>
            <div style={{ fontSize: '0.9rem', color: '#aaa' }}>Average Rating ({user.ratingCount || 12} reviews)</div>
          </div>
          <div className="profile-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '1.5rem' }}>
            <button className="btn-outline">Change Avatar</button>
            <button className="btn-danger">Delete Account</button>
          </div>
        </div>
        <div className="card" style={{ margin: 0, textAlign: 'left' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Personal Information</h3>
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" defaultValue={user.email} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea rows="4" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} placeholder="Tell us about yourself..."></textarea>
            </div>
            <div className="form-group">
                <label>Skills Interests</label>
                <div className="profile-tags" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <span className="skill-tag" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>React</span>
                    <span className="skill-tag" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>Node.js</span>
                    <span className="skill-tag" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>Guitar</span>
                </div>
            </div>
            <button className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '1rem' }}>Save Changes</button>
          </form>
        </div>
      </div>
    </PageContainer>
  );
};
