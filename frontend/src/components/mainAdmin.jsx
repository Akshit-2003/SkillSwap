import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';

// --- Styled Components for Dashboard ---
const SidebarItem = ({ icon, label, to, active, badgeCount = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Link
      to={to}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', margin: '4px 12px',
        textDecoration: 'none', color: active ? '#fff' : (isHovered ? '#e5e7eb' : '#9ca3af'),
        background: active ? 'linear-gradient(135deg, #646cff 0%, #bc13fe 100%)' : (isHovered ? 'rgba(255,255,255,0.05)' : 'transparent'),
        borderRadius: '8px',
        transition: 'all 0.2s ease', fontSize: '0.95rem', fontWeight: active ? '600' : '500',
        position: 'relative',
        boxShadow: active ? '0 4px 10px rgba(100,108,255,0.3)' : 'none'
      }}
    >
      <span style={{ fontSize: '1.2rem', width: '24px', textAlign: 'center', transition: 'transform 0.2s ease', transform: isHovered || active ? 'scale(1.1)' : 'scale(1)' }}>{icon}</span>
      <span>{label}</span>
      {badgeCount > 0 && (
        <span style={{
          marginLeft: 'auto', background: active ? 'rgba(255,255,255,0.2)' : '#ef4444', color: '#fff',
          borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold',
          padding: '2px 8px', lineHeight: '1.2'
        }}>
          {badgeCount}
        </span>
      )}
    </Link>
  );
};

const StatCounter = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = currentTime - startTime;

      if (progress < duration) {
        const percentage = 1 - Math.pow(1 - Math.min(1, progress / duration), 4);
        setCount(Math.floor(percentage * end));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <>{count.toLocaleString()}{suffix}</>;
};

const StatCard = ({ title, value, icon, color }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: '#1f2937', padding: '24px', borderRadius: '12px',
        boxShadow: isHovered ? '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.3s ease', transform: isHovered ? 'translateY(-4px)' : 'none', cursor: 'default'
      }}
    >
      <div style={{
        width: '40px', height: '40px', borderRadius: '8px',
        background: `${color}20`, color: color, display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', marginBottom: '1rem',
        transition: 'transform 0.3s ease', transform: isHovered ? 'scale(1.1)' : 'scale(1)'
      }}>
        {icon}
      </div>
      <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: '0 0 4px 0', fontWeight: '500' }}>{title}</p>
      <h3 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#fff', margin: 0 }}>
        {typeof value === 'number' ? <StatCounter end={value} /> : value}
      </h3>
    </div>
  );
};

const SimpleLineChart = ({ data, color }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '2%', padding: '10px 0' }}>
      {data.map((val, idx) => (
        <div key={idx} style={{
          width: '100%',
          height: show ? `${val}%` : '0%',
          background: `linear-gradient(to top, ${color}40, ${color})`,
          borderRadius: '4px 4px 0 0',
          transition: `height 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${idx * 0.05}s`
        }}></div>
      ))}
    </div>
  );
};

const PieChart = ({ data, title }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;
    const duration = 1500;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const p = currentTime - startTime;
      if (p < duration) {
        setProgress(1 - Math.pow(1 - Math.min(1, p / duration), 4));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setProgress(1);
      }
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const backgroundGradient = data.map((item, index) => {
    let start = data.slice(0, index).reduce((sum, i) => sum + i.percentage, 0) * progress;
    let end = start + item.percentage * progress;
    return `${item.color} ${start}% ${end}%`;
  }).join(', ');

  const gradientString = `conic-gradient(${backgroundGradient}, transparent ${100 * progress}%)`;

  return (
    <div style={{ background: '#1f2937', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <h3 style={{ margin: '0 0 1.5rem 0', color: '#e5e7eb', fontSize: '1.2rem' }}>{title}</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{
          width: '150px', height: '150px', borderRadius: '50%',
          background: gradientString,
          transform: `scale(${0.8 + 0.2 * progress})`,
          transition: 'transform 0.1s',
          opacity: progress
        }}></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', opacity: progress, transition: 'opacity 1s ease' }}>
          {data.map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: item.color }}></div>
              <span style={{ color: '#d1d5db', fontSize: '0.9rem' }}>{item.label} ({item.percentage}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PlaceholderPage = ({ title, icon }) => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#6b7280', animation: 'fadeInUp 0.5s ease' }}>
    <div style={{ textAlign: 'center', background: '#1f2937', padding: '4rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem', filter: 'grayscale(80%)', opacity: 0.6 }}>{icon}</div>
      <h2 style={{ color: '#e5e7eb', margin: '0 0 0.5rem 0' }}>{title} Page</h2>
      <p>This feature is currently under construction. Check back soon!</p>
    </div>
  </div>
);

const ActionButton = ({ onClick, title, icon, color = '#9ca3af' }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      background: 'transparent', border: 'none', cursor: 'pointer',
      color: color, padding: '6px', borderRadius: '50%',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background 0.2s ease, transform 0.2s ease'
    }}
    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
  >
    {icon}
  </button>
);

const NotificationsDropdown = () => (
  <div className="admin-hover-dropdown" style={{
    position: 'absolute', top: '40px', right: '-10px',
    background: '#1f2937', borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    width: '320px', zIndex: 20, border: '1px solid #374151',
    animation: 'fadeInUp 0.2s ease-out', cursor: 'default', color: '#fff', textAlign: 'left'
  }} onClick={e => e.stopPropagation()}>
    <div style={{ padding: '16px', borderBottom: '1px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Notifications</h4>
      <span style={{ fontSize: '0.8rem', color: '#646cff', cursor: 'pointer' }}>Mark all read</span>
    </div>
    <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
      {[
        { title: 'New User Registered', desc: 'Alice joined the platform', time: '5m ago', color: '#10b981' },
        { title: 'Swap Request Pending', desc: 'Bob wants to learn React', time: '1h ago', color: '#f59e0b' },
        { title: 'System Alert', desc: 'High CPU usage detected', time: '2h ago', color: '#ef4444' }
      ].map((notif, i) => (
        <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '12px', transition: 'background 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: notif.color, marginTop: '6px', flexShrink: 0 }}></div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#e5e7eb', fontWeight: '500' }}>{notif.title}</p>
            <p style={{ margin: '0 0 4px 0', fontSize: '0.8rem', color: '#9ca3af' }}>{notif.desc}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>{notif.time}</p>
          </div>
        </div>
      ))}
    </div>
    <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid #374151' }}>
      <Link to="/super-admin/logs" style={{ color: '#d1d5db', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '500' }}>View all activities</Link>
    </div>
  </div>
);

const MessagesDropdown = () => (
  <div className="admin-hover-dropdown" style={{
    position: 'absolute', top: '40px', right: '-10px',
    background: '#1f2937', borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    width: '320px', zIndex: 20, border: '1px solid #374151',
    animation: 'fadeInUp 0.2s ease-out', cursor: 'default', color: '#fff', textAlign: 'left'
  }} onClick={e => e.stopPropagation()}>
    <div style={{ padding: '16px', borderBottom: '1px solid #374151' }}>
      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Recent Messages</h4>
    </div>
    <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
      {[
        { initials: 'SJ', name: 'Sarah Jenkins', msg: 'The new dashboard looks great!', time: '10m', bg: '#646cff' },
        { initials: 'MT', name: 'Mike Taylor', msg: 'Could you approve my skill request?', time: '2h', bg: '#10b981' },
        { initials: 'AD', name: 'Admin Support', msg: 'Server maintenance scheduled.', time: '1d', bg: '#ef4444' }
      ].map((msg, i) => (
        <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '12px', transition: 'background 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: msg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 'bold', flexShrink: 0 }}>{msg.initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#e5e7eb', fontWeight: '500' }}>{msg.name}</p>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{msg.time}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.msg}</p>
          </div>
        </div>
      ))}
    </div>
    <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid #374151' }}>
      <a href="#" onClick={e => e.preventDefault()} style={{ color: '#d1d5db', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '500' }}>Open Messages App</a>
    </div>
  </div>
);

const ProfileDropdown = ({ onLogout }) => (
  <div className="admin-hover-dropdown" style={{
    position: 'absolute', top: '60px', right: 0,
    background: '#1f2937', borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    width: '220px', zIndex: 20, border: '1px solid #374151',
    animation: 'fadeInUp 0.2s ease-out', cursor: 'default', textAlign: 'left'
  }} onClick={e => e.stopPropagation()}>
    <div style={{ padding: '1rem', borderBottom: '1px solid #374151' }}>
      <p style={{ margin: 0, fontWeight: '600', color: '#fff' }}>Akshit Kansal</p>
      <p style={{ margin: 0, fontSize: '0.8rem', color: '#9ca3af' }}>Super Admin</p>
    </div>
    <div style={{ padding: '0.5rem' }}>
      <Link
        to="/super-admin/settings"
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        style={{ textDecoration: 'none', color: '#d1d5db', display: 'block', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.9rem', transition: 'background 0.2s ease' }}
      >
        Profile Settings
      </Link>
      <a
        href="#" onClick={e => { e.preventDefault(); onLogout(); }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        style={{ textDecoration: 'none', color: '#ef4444', display: 'block', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.9rem', transition: 'background 0.2s ease' }}
      >
        Logout
      </a>
    </div>
  </div>
);

// --- Main Component ---
const SuperAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({ totalUsers: 0, totalSkills: 0, totalSwaps: 0, activeSwaps: 154 });
  const [allUsers, setAllUsers] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherForm, setTeacherForm] = useState({ name: '', email: '', password: '' });
  const [adminAvatar, setAdminAvatar] = useState(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAdminAvatar(imageUrl);
    }
  };

  const [showSkillModal, setShowSkillModal] = useState(false);
  const [skillForm, setSkillForm] = useState({ skillName: '', providerName: 'System' });
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '' });
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Mock Data for Tables
  const recentRequests = [
    { id: 1, userA: 'Sarah Jenkins', userB: 'Mike Taylor', skill: 'React for Guitar', status: 'Pending' },
    { id: 2, userA: 'John Doe', userB: 'Elena R.', skill: 'Python for Spanish', status: 'Active' },
  ];
  const mockReviews = [
    { id: 1, user: 'Alice', teacher: 'Sarah Wilson', rating: 5, comment: 'Amazing teacher, very patient!' },
    { id: 2, user: 'Bob', teacher: 'Mike Ross', rating: 4, comment: 'Good session, learned a lot.' },
  ];

  const mockTickets = [
    { id: 'T-1001', user: 'User_120', subject: 'Video call issue', status: 'Urgent', date: '2023-10-25', description: 'My video call disconnected after 5 minutes and I lost my learning credit. Please refund it.' },
    { id: 'T-1002', user: 'User_121', subject: 'Cannot update profile', status: 'Pending', date: '2023-10-24', description: 'Every time I try to save my new bio, it throws a 500 server error.' },
    { id: 'T-1003', user: 'User_122', subject: 'Refund request', status: 'Resolved', date: '2023-10-22', description: 'The mentor never showed up to the session.' },
    { id: 'T-1004', user: 'User_123', subject: 'Bug report', status: 'Resolved', date: '2023-10-20', description: 'Profile picture upload gets stuck at 99%.' }
  ];

  // Mock Data for Chart
  const userGrowthData = [20, 35, 45, 50, 65, 75, 85, 90, 80, 95];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes, skillsRes, teachersRes] = await Promise.all([
        fetch('http://localhost:5000/get-all-users'),
        fetch('http://localhost:5000/get-platform-stats'),
        fetch('http://localhost:5000/get-all-skills'),
        fetch('http://localhost:5000/get-teacher-admins')
      ]);

      const usersData = await usersRes.json();
      if (usersRes.ok) setAllUsers(usersData);

      const statsData = await statsRes.json();
      if (statsRes.ok) setStats(prev => ({ ...prev, ...statsData, activeSwaps: 154, completedSessions: 1205 }));

      const skillsData = await skillsRes.json();
      if (skillsRes.ok) setAllSkills(skillsData);

      const teachersData = await teachersRes.json();
      if (teachersRes.ok) setAllTeachers(teachersData);

    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  const handleRemoveUser = async (userId) => {
    if (window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
      try {
        const response = await fetch(`http://localhost:5000/remove-user/${userId}`, { method: 'DELETE' });
        if (response.ok) {
          alert('User removed successfully.');
          fetchData(); // Re-fetch all data to update lists and stats
        } else {
          const data = await response.json();
          alert(`Failed to remove user: ${data.message || 'Unknown error'}`);
        }
      } catch (err) {
        console.error("Remove user error:", err);
        alert('Could not connect to the server to remove user.');
      }
    }
  };

  const handleRegisterTeacher = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/register-teacher-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherForm),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Teacher Admin Registered Successfully!');
        setShowTeacherModal(false);
        setTeacherForm({ name: '', email: '', password: '' });
        fetchData(); // Refresh the lists to show new admin
      } else {
        alert(data.message || 'Registration Failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong! Ensure server is running.');
    }
  };

  const handleAddGlobalSkill = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/add-global-skill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skillForm),
      });
      if (response.ok) {
        alert('Global Skill Added Successfully!');
        setShowSkillModal(false);
        setSkillForm({ skillName: '', providerName: 'System' });
        fetchData(); // Refresh list
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to add skill');
      }
    } catch (error) {
      console.error('Error:', error);
      // Fallback update if backend endpoint doesn't exist yet
      setAllSkills(prev => [...prev, { skillName: skillForm.skillName, providerName: skillForm.providerName }]);
      setShowSkillModal(false);
      setSkillForm({ skillName: '', providerName: 'System' });
      alert('Skill added locally (Server might not have this endpoint yet).');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      // Using the existing standard user registration route
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm),
      });
      const data = await response.json();
      if (response.ok) {
        alert('User Added Successfully!');
        setShowUserModal(false);
        setUserForm({ name: '', email: '', password: '' });
        fetchData(); // Refresh list
      } else {
        alert(data.message || data.error || 'Failed to add user');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong while adding the user!');
    }
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowTicketModal(true);
  };

  // Filter logic for Users
  const filteredUsers = allUsers.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));

  // Filter logic for Skills
  const filteredSkills = allSkills.filter(s => s.skillName.toLowerCase().includes(searchTerm.toLowerCase()) || s.providerName.toLowerCase().includes(searchTerm.toLowerCase()));

  // Filter logic for Teachers
  const filteredTeachers = allTeachers.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.email.toLowerCase().includes(searchTerm.toLowerCase()));

  // --- Page Components ---

  const DashboardOverview = () => {
    const skillCategoryData = [
      { label: 'Development', percentage: 45, color: '#646cff' },
      { label: 'Design', percentage: 25, color: '#10b981' },
      { label: 'Music', percentage: 15, color: '#f59e0b' },
      { label: 'Lifestyle', percentage: 10, color: '#ef4444' },
      { label: 'Other', percentage: 5, color: '#6b7280' },
    ];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeInUp 0.5s ease' }}>
        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
          <StatCard title="Total Users" value={stats.totalUsers || 0} icon="👥" color="#646cff" />
          <StatCard title="Active Teachers" value={stats.totalTeacherAdmins || 0} icon="🎓" color="#34d399" />
          <StatCard title="Total Skills" value={stats.totalSkills || 0} icon="⚡" color="#f59e0b" />
          <StatCard title="Active Swaps" value={stats.activeSwaps || 0} icon="🔄" color="#10b981" />
          <StatCard title="Pending Requests" value={recentRequests.filter(r => r.status === 'Pending').length} icon="🔔" color="#ef4444" />
          <StatCard title="Completed Sessions" value={1205} icon="✅" color="#bc13fe" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          {/* Chart Section */}
          <div style={{ background: '#1f2937', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#e5e7eb', fontSize: '1.2rem' }}>User Growth</h3>
            <SimpleLineChart data={userGrowthData} color="#646cff" />
          </div>
          <PieChart data={skillCategoryData} title="Skill Category Distribution" />
        </div>

        {/* Tables Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          {/* Recent Users Table */}
          <div style={{ background: '#1f2937', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: '#e5e7eb', fontSize: '1.2rem' }}>Recent Users</h3>
              <button onClick={() => navigate('/super-admin/user-management')} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af'; }} style={{ background: 'transparent', border: '1px solid #374151', color: '#9ca3af', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s ease' }}>View All</button>
            </div>
            {/* Table content here */}
          </div>

          {/* Swap Requests Table */}
          <div style={{ background: '#1f2937', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#e5e7eb', fontSize: '1.2rem' }}>Recent Swap Requests</h3>
            {/* Table content here */}
          </div>

          {/* Teacher Management Table */}
          <div style={{ background: '#1f2937', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#e5e7eb', fontSize: '1.2rem' }}>Top Teachers</h3>
            {/* Table content here */}
          </div>

          {/* Reviews Table */}
          <div style={{ background: '#1f2937', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#e5e7eb', fontSize: '1.2rem' }}>Recent Reviews</h3>
            {/* Table content here */}
          </div>
        </div>
      </div>
    );
  };

  const UserManagementPage = () => (
    <div style={{ animation: 'fadeInUp 0.5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#e5e7eb', margin: 0 }}>User Management</h2>
        <button onClick={() => setShowUserModal(true)} style={{ padding: '8px 16px', background: '#646cff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#535bf2'} onMouseLeave={e => e.currentTarget.style.background = '#646cff'}>+ Add User</button>
      </div>
      <div style={{ background: '#1f2937', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#d1d5db' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid #374151' }}>
              <th style={{ padding: '16px' }}>Name</th>
              <th style={{ padding: '16px' }}>Email</th>
              <th style={{ padding: '16px' }}>Role</th>
              <th style={{ padding: '16px' }}>Status</th>
              <th style={{ padding: '16px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #374151', transition: 'background 0.2s', ':hover': { background: 'rgba(255,255,255,0.02)' } }}>
                <td style={{ padding: '16px' }}>{u.name}</td>
                <td style={{ padding: '16px' }}>{u.email}</td>
                <td style={{ padding: '16px' }}>{u.role || 'User'}</td>
                <td style={{ padding: '16px' }}><span style={{ padding: '4px 8px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderRadius: '4px', fontSize: '0.8rem' }}>Active</span></td>
                <td style={{ padding: '16px' }}>
                  <button style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }} onClick={() => handleRemoveUser(u._id)}>Remove</button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>No users found matching your search.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const TeacherManagementPage = () => (
    <div style={{ animation: 'fadeInUp 0.5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#e5e7eb', margin: 0 }}>Teacher Management</h2>
        <button onClick={() => setShowTeacherModal(true)} style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ Add Teacher Admin</button>
      </div>
      <div style={{ background: '#1f2937', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#d1d5db' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid #374151' }}>
              <th style={{ padding: '16px' }}>Teacher Name</th>
              <th style={{ padding: '16px' }}>Email</th>
              <th style={{ padding: '16px' }}>Approved Skills</th>
              <th style={{ padding: '16px' }}>Rating</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.map((t, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #374151' }}>
                <td style={{ padding: '16px' }}>{t.name}</td>
                <td style={{ padding: '16px' }}>{t.email}</td>
                <td style={{ padding: '16px' }}>{t.skillsOffered?.length || 0}</td>
                <td style={{ padding: '16px', color: '#fbbf24', fontWeight: 'bold' }}>★ {t.rating || '4.8'}</td>
              </tr>
            ))}
            {filteredTeachers.length === 0 && <tr><td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>No teachers found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const SkillManagementPage = () => (
    <div style={{ animation: 'fadeInUp 0.5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#e5e7eb', margin: 0 }}>Skill Management</h2>
        <button onClick={() => setShowSkillModal(true)} style={{ padding: '8px 16px', background: '#646cff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ Add Global Skill</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {filteredSkills.map((s, i) => (
          <div key={i} style={{ background: '#1f2937', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '1.1rem' }}>{s.skillName || s.skill}</h3>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.9rem' }}>Provider: {s.providerName || s.name || 'Community'}</p>
            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ padding: '4px 10px', background: 'rgba(100,108,255,0.15)', color: '#646cff', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>Active</span>
              <button style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem' }}>Delete</button>
            </div>
          </div>
        ))}
        {filteredSkills.length === 0 && <p style={{ color: '#9ca3af', gridColumn: '1 / -1', textAlign: 'center', marginTop: '2rem' }}>No skills match your criteria.</p>}
      </div>
    </div>
  );

  const SwapRequestsPage = () => (
    <div style={{ animation: 'fadeInUp 0.5s ease' }}>
      <h2 style={{ color: '#e5e7eb', marginBottom: '1.5rem' }}>Active Swap Requests</h2>
      <div style={{ background: '#1f2937', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#d1d5db' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid #374151' }}>
              <th style={{ padding: '16px' }}>Request ID</th>
              <th style={{ padding: '16px' }}>User A (Learner)</th>
              <th style={{ padding: '16px' }}>User B (Mentor)</th>
              <th style={{ padding: '16px' }}>Target Skill</th>
              <th style={{ padding: '16px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentRequests.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #374151' }}>
                <td style={{ padding: '16px', color: '#646cff' }}>#REQ-00{r.id}</td>
                <td style={{ padding: '16px' }}>{r.userA}</td>
                <td style={{ padding: '16px' }}>{r.userB}</td>
                <td style={{ padding: '16px', fontWeight: '500' }}>{r.skill}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ padding: '4px 8px', background: r.status === 'Pending' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)', color: r.status === 'Pending' ? '#f59e0b' : '#10b981', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600' }}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const SessionsPage = () => (
    <div style={{ animation: 'fadeInUp 0.5s ease' }}>
      <h2 style={{ color: '#e5e7eb', marginBottom: '1.5rem' }}>Sessions / Meetings</h2>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ background: '#1f2937', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '50px', height: '50px', background: 'rgba(100,108,255,0.1)', color: '#646cff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📅</div>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#fff', fontSize: '1.1rem' }}>React Deep Dive Session {i}</h4>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.9rem' }}>Mentor: Sarah J. | Learner: Mike T.</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 5px 0', color: '#e5e7eb', fontWeight: '600' }}>Oct {20 + i}, 2023 • 10:00 AM</p>
              <span style={{ color: i > 2 ? '#f59e0b' : '#10b981', fontSize: '0.85rem', fontWeight: 'bold' }}>{i > 2 ? 'Upcoming' : 'Completed'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const CreditManagementPage = () => (
    <div style={{ animation: 'fadeInUp 0.5s ease' }}>
      <h2 style={{ color: '#e5e7eb', marginBottom: '1.5rem' }}>Credit Management</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard title="Total Credits Issued" value={12540} icon="💰" color="#f59e0b" />
        <StatCard title="Credits Used Today" value={342} icon="📉" color="#ef4444" />
        <StatCard title="New Credits Earned" value={350} icon="📈" color="#10b981" />
      </div>
      <div style={{ background: '#1f2937', borderRadius: '12px', padding: '24px' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff' }}>Recent System Transactions</h3>
        <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>Detailed transaction logs sync is currently in progress...</p>
      </div>
    </div>
  );

  const SupportTicketsPage = () => (
    <div style={{ animation: 'fadeInUp 0.5s ease' }}>
      <h2 style={{ color: '#e5e7eb', marginBottom: '1.5rem' }}>Support Tickets</h2>
      <div style={{ background: '#1f2937', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#d1d5db' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid #374151' }}>
              <th style={{ padding: '16px' }}>Ticket ID</th>
              <th style={{ padding: '16px' }}>User</th>
              <th style={{ padding: '16px' }}>Subject</th>
              <th style={{ padding: '16px' }}>Status</th>
              <th style={{ padding: '16px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {mockTickets.map((ticket, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #374151' }}>
                <td style={{ padding: '16px', fontWeight: '500' }}>{ticket.id}</td>
                <td style={{ padding: '16px' }}>{ticket.user}</td>
                <td style={{ padding: '16px' }}>{ticket.subject}</td>
                <td style={{ padding: '16px' }}><span style={{ color: ticket.status === 'Urgent' ? '#ef4444' : (ticket.status === 'Pending' ? '#f59e0b' : '#10b981'), fontWeight: 'bold' }}>{ticket.status}</span></td>
                <td style={{ padding: '16px' }}><button onClick={() => handleViewTicket(ticket)} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const DisputesPage = () => (
    <div style={{ animation: 'fadeInUp 0.5s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ fontSize: '5rem', marginBottom: '1rem', opacity: 0.8 }}>⚖️</div>
      <h2 style={{ color: '#10b981', margin: '0 0 10px 0' }}>No Active Disputes</h2>
      <p style={{ color: '#9ca3af', maxWidth: '400px', textAlign: 'center' }}>Great job! The community is running smoothly and there are no reported conflicts between users.</p>
    </div>
  );

  const ContentManagementPage = () => (
    <div style={{ animation: 'fadeInUp 0.5s ease' }}>
      <h2 style={{ color: '#e5e7eb', marginBottom: '1.5rem' }}>Content Management</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {['Terms of Service', 'Privacy Policy', 'Community Guidelines', 'Landing Page Hero Copy', 'Email Templates'].map((item, i) => (
          <div key={i} style={{ background: '#1f2937', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ color: '#fff', fontWeight: '600', fontSize: '1.1rem', display: 'block' }}>{item}</span>
              <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Last updated: 2 weeks ago</span>
            </div>
            <button style={{ background: 'rgba(100,108,255,0.15)', color: '#646cff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Edit</button>
          </div>
        ))}
      </div>
    </div>
  );

  const AnnouncementsPage = () => (
    <div style={{ animation: 'fadeInUp 0.5s ease' }}>
      <h2 style={{ color: '#e5e7eb', marginBottom: '1.5rem' }}>Platform Announcements</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div style={{ background: '#1f2937', padding: '24px', borderRadius: '12px', height: 'fit-content' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#fff' }}>Create New Broadcast</h3>
          <input type="text" placeholder="Announcement Title" style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: '#fff' }} />
          <textarea placeholder="Message body..." rows="5" style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #374151', background: '#111827', color: '#fff', resize: 'vertical' }}></textarea>
          <button style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>Publish Now</button>
        </div>
        <div style={{ background: '#1f2937', padding: '24px', borderRadius: '12px' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff' }}>Recent Broadcasts</h3>
          {[1, 2].map((i) => (
            <div key={i} style={{ padding: '20px', borderLeft: '4px solid #646cff', background: 'rgba(100,108,255,0.05)', marginBottom: '15px', borderRadius: '0 8px 8px 0' }}>
              <strong style={{ color: '#fff', display: 'block', fontSize: '1.1rem', marginBottom: '5px' }}>{i === 1 ? 'Scheduled Maintenance Notice' : 'Welcome to the New UI'}</strong>
              <p style={{ color: '#d1d5db', margin: '0 0 10px 0', fontSize: '0.95rem' }}>This is a placeholder for the actual announcement text sent out to all active users...</p>
              <small style={{ color: '#9ca3af', fontWeight: 'bold' }}>Published on: Oct {20 - i}, 2023</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ReportsPage = () => (
    <div style={{ animation: 'fadeInUp 0.5s ease' }}>
      <h2 style={{ color: '#e5e7eb', marginBottom: '1.5rem' }}>Reports & Analytics</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <div style={{ background: '#1f2937', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#fff', margin: '0 0 1.5rem 0' }}>Monthly Engagement</h3>
          <SimpleLineChart data={[20, 30, 45, 60, 55, 80, 95]} color="#10b981" />
        </div>
        <div style={{ background: '#1f2937', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#fff', margin: '0 0 1.5rem 0' }}>Signups vs Churn</h3>
          <SimpleLineChart data={[90, 85, 80, 85, 90, 95, 100]} color="#bc13fe" />
        </div>
      </div>
    </div>
  );

  const SettingsPage = () => (
    <div style={{ animation: 'fadeInUp 0.5s ease', paddingBottom: '2rem' }}>
      <h2 style={{ color: '#e5e7eb', marginBottom: '1.5rem' }}>Settings & Configurations</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* Admin Profile Settings */}
        <div style={{ background: '#1f2937', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff', borderBottom: '1px solid #374151', paddingBottom: '10px' }}>Admin Profile</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1.5rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: adminAvatar ? `url(${adminAvatar}) center/cover` : 'linear-gradient(135deg, #646cff, #bc13fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>
              {!adminAvatar && 'AK'}
            </div>
            <input type="file" id="avatarUpload" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            <label htmlFor="avatarUpload" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', transition: 'background 0.2s', display: 'inline-block' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>Change Avatar</label>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: '#9ca3af', marginBottom: '8px', fontSize: '0.9rem' }}>Full Name</label>
            <input type="text" defaultValue="Akshit Kansal" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#111827', color: '#fff', outline: 'none' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: '#9ca3af', marginBottom: '8px', fontSize: '0.9rem' }}>Email Address</label>
            <input type="email" defaultValue="admin@skillswap.com" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#111827', color: '#fff', outline: 'none' }} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: '#9ca3af', marginBottom: '8px', fontSize: '0.9rem' }}>New Password</label>
            <input type="password" placeholder="Leave blank to keep current" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#111827', color: '#fff', outline: 'none' }} />
          </div>
          <button style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Update Profile</button>
        </div>

        {/* Platform Configuration */}
        <div style={{ background: '#1f2937', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff', borderBottom: '1px solid #374151', paddingBottom: '10px' }}>Platform Configuration</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: '#9ca3af', marginBottom: '8px', fontSize: '0.9rem' }}>Platform Title</label>
            <input type="text" defaultValue="SkillSwap" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#111827', color: '#fff', outline: 'none' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: '#9ca3af', marginBottom: '8px', fontSize: '0.9rem' }}>Global Support Email</label>
            <input type="email" defaultValue="support@skillswap.com" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#111827', color: '#fff', outline: 'none' }} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: '#9ca3af', marginBottom: '8px', fontSize: '0.9rem' }}>Default New User Credits</label>
            <input type="number" defaultValue="5" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: '#111827', color: '#fff', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '10px 15px', borderRadius: '8px' }}>
              <input type="checkbox" id="reg" defaultChecked style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
              <label htmlFor="reg" style={{ color: '#e5e7eb', cursor: 'pointer', fontSize: '0.9rem' }}>Allow New User Registrations</label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(239, 68, 68, 0.1)', padding: '10px 15px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <input type="checkbox" id="maint" style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
              <label htmlFor="maint" style={{ color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}>Enable Maintenance Mode (Blocks Login)</label>
            </div>
          </div>
          <button style={{ background: 'linear-gradient(135deg, #646cff, #bc13fe)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>Save Configuration</button>
        </div>
      </div>
    </div>
  );

  const FeedbackPage = () => (
    <div style={{ animation: 'fadeInUp 0.5s ease' }}>
      <h2 style={{ color: '#e5e7eb', marginBottom: '1.5rem' }}>User Feedback & Reviews</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {mockReviews.map((r, i) => (
          <div key={i} style={{ background: '#1f2937', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <strong style={{ color: '#fff', display: 'block', fontSize: '1.1rem' }}>{r.user}</strong>
                <small style={{ color: '#9ca3af' }}>Reviewed: {r.teacher}</small>
              </div>
              <span style={{ color: '#fbbf24', fontSize: '1.2rem', letterSpacing: '2px' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
            </div>
            <p style={{ color: '#d1d5db', margin: 0, lineHeight: '1.6', fontStyle: 'italic' }}>"{r.comment}"</p>
          </div>
        ))}
      </div>
    </div>
  );

  const SystemLogsPage = () => (
    <div style={{ animation: 'fadeInUp 0.5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#e5e7eb', margin: 0 }}>System Activity Logs</h2>
        <button style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #374151', color: '#d1d5db', borderRadius: '6px', cursor: 'pointer' }}>Export Logs</button>
      </div>
      <div style={{ background: '#0a0f18', padding: '24px', borderRadius: '12px', fontFamily: "'Fira Code', monospace", color: '#10b981', height: '60vh', overflowY: 'auto', border: '1px solid #1f2937', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}>
        <p style={{ margin: '5px 0' }}>[INFO] 2023-10-25 10:00:01 - Server container booted successfully.</p>
        <p style={{ margin: '5px 0' }}>[INFO] 2023-10-25 10:05:22 - MongoDB connected.</p>
        <p style={{ margin: '5px 0', color: '#f59e0b' }}>[WARN] 2023-10-25 10:15:05 - API rate limit warning for IP 192.168.1.1</p>
        <p style={{ margin: '5px 0' }}>[INFO] 2023-10-25 10:30:11 - JWT Token issued for user "Akshit".</p>
        <p style={{ margin: '5px 0', color: '#ef4444' }}>[ERROR] 2023-10-25 10:45:33 - Node Fetch failed: ETIMEDOUT connect to external mail service.</p>
        <p style={{ margin: '5px 0' }}>[INFO] 2023-10-25 11:00:00 - Routine cron backup completed in 4.2s.</p>
        <p style={{ margin: '5px 0', opacity: 0.5 }}>Waiting for new logs...</p>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
      .admin-sidebar::-webkit-scrollbar { width: 6px; }
      .admin-sidebar::-webkit-scrollbar-track { background: transparent; }
      .admin-sidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      .admin-sidebar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      .admin-hover-trigger { position: relative; }
      .admin-hover-dropdown {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transform: translateY(8px);
        transition: opacity 0.18s ease, transform 0.18s ease, visibility 0.18s ease;
      }
      .admin-hover-trigger:hover .admin-hover-dropdown {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        transform: translateY(0);
      }
    `}</style>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#111827', fontFamily: "'Inter', sans-serif" }}>

        {/* --- Left Sidebar --- */}
        <div className="admin-sidebar" style={{
          width: '260px', background: '#1f2937', borderRight: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', flexDirection: 'column', position: 'fixed', height: '100%', zIndex: 10,
          overflowY: 'auto'
        }}>
          <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <img src="/vite.svg" alt="Logo" width="32" />
            <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', letterSpacing: '-0.5px' }}>SkillSwap<span style={{ color: '#646cff' }}>.Admin</span></span>
          </div>

          <div style={{ flex: 1, padding: '10px 0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <p style={{ padding: '0 20px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.5px' }}>Menu</p>
            <SidebarItem to="/super-admin/overview" label="Dashboard" icon="📊" active={location.pathname.includes('/overview') || location.pathname === '/super-admin' || location.pathname === '/super-admin/'} />
            <SidebarItem to="/super-admin/user-management" label="User Management" icon="👥" active={location.pathname.includes('/user-management')} />
            <SidebarItem to="/super-admin/teacher-management" label="Teacher Management" icon="🎓" active={location.pathname.includes('/teacher-management')} />
            <SidebarItem to="/super-admin/skill-management" label="Skill Management" icon="⚡" active={location.pathname.includes('/skill-management')} />
            <SidebarItem to="/super-admin/swap-requests" label="Swap Requests" icon="🔄" active={location.pathname.includes('/swap-requests')} badgeCount={recentRequests.filter(r => r.status === 'Pending').length} />
            <SidebarItem to="/super-admin/sessions" label="Sessions / Meetings" icon="📅" active={location.pathname.includes('/sessions')} />

            <p style={{ padding: '0 20px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600', margin: '20px 0 8px', letterSpacing: '0.5px' }}>Finance & Support</p>
            <SidebarItem to="/super-admin/credits" label="Credit Management" icon="💰" active={location.pathname.includes('/credits')} />
            <SidebarItem to="/super-admin/support" label="Support Tickets" icon="🎫" active={location.pathname.includes('/support')} badgeCount={5} />
            <SidebarItem to="/super-admin/disputes" label="Disputes Handling" icon="⚖️" active={location.pathname.includes('/disputes')} />

            <p style={{ padding: '0 20px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600', margin: '20px 0 8px', letterSpacing: '0.5px' }}>Content & Marketing</p>
            <SidebarItem to="/super-admin/content" label="Content Management" icon="📝" active={location.pathname.includes('/content')} />
            <SidebarItem to="/super-admin/announcements" label="Announcements" icon="📢" active={location.pathname.includes('/announcements')} />

            <p style={{ padding: '0 20px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600', margin: '20px 0 8px', letterSpacing: '0.5px' }}>System & Config</p>
            <SidebarItem to="/super-admin/reports" label="Reports & Analytics" icon="📑" active={location.pathname.includes('/reports')} />
            <SidebarItem to="/super-admin/settings" label="Platform Settings" icon="⚙️" active={location.pathname.includes('/settings')} />
            <SidebarItem to="/super-admin/feedback" label="Feedback & Reviews" icon="⭐" active={location.pathname.includes('/feedback')} />
            <SidebarItem to="/super-admin/logs" label="System Logs" icon="📜" active={location.pathname.includes('/logs')} />
          </div>

          <div style={{ padding: '20px', flexShrink: 0 }}>
            <button
              onClick={handleLogout}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              style={{
                width: '100%', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600', transition: 'all 0.2s ease'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Logout
            </button>
          </div>
        </div>

        {/* --- Main Content Area --- */}
        <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column' }}>

          {/* Top Navbar */}
          <div style={{
            height: '70px', background: '#1f2937', borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', position: 'sticky', top: 0, zIndex: 5
          }}>
            {/* Search Bar */}
            <div style={{ position: 'relative', width: '300px' }}>
              <input
                type="text"
                placeholder="Search anything..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={e => { e.currentTarget.style.borderColor = '#646cff'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(100,108,255,0.2)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                style={{
                  width: '100%', background: '#111827', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', padding: '10px 16px 10px 40px', color: '#fff', fontSize: '0.9rem', outline: 'none', transition: 'all 0.2s ease'
                }}
              />
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
            </div>

            {/* Right Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div className="admin-hover-trigger" title="Notifications" onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'} style={{ position: 'relative', cursor: 'pointer', color: '#9ca3af', transition: 'color 0.2s ease' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}></span>
                <NotificationsDropdown />
              </div>
              <div className="admin-hover-trigger" title="Messages" onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'} style={{ position: 'relative', cursor: 'pointer', color: '#9ca3af', transition: 'color 0.2s ease' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                <MessagesDropdown />
              </div>
              <div className="admin-hover-trigger" onMouseEnter={e => e.currentTarget.style.opacity = '0.8'} onMouseLeave={e => e.currentTarget.style.opacity = '1'} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid #374151', paddingLeft: '20px', cursor: 'pointer', transition: 'opacity 0.2s ease' }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', color: '#fff' }}>Akshit Kansal</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>Super Admin</p>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: adminAvatar ? `url(${adminAvatar}) center/cover` : 'linear-gradient(135deg, #646cff, #bc13fe)', border: '2px solid #1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>
                  {!adminAvatar && 'AK'}
                </div>
                <ProfileDropdown onLogout={handleLogout} />
              </div>
            </div>
          </div>

          {/* Dashboard Content Container */}
          <div style={{ padding: '30px', overflowY: 'auto' }}>
            <Routes>
              <Route path="/" element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<DashboardOverview />} />
              <Route path="user-management" element={<UserManagementPage />} />
              <Route path="teacher-management" element={<TeacherManagementPage />} />
              <Route path="skill-management" element={<SkillManagementPage />} />
              <Route path="swap-requests" element={<SwapRequestsPage />} />
              <Route path="sessions" element={<SessionsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="feedback" element={<FeedbackPage />} />
              <Route path="logs" element={<SystemLogsPage />} />
              <Route path="credits" element={<CreditManagementPage />} />
              <Route path="support" element={<SupportTicketsPage />} />
              <Route path="disputes" element={<DisputesPage />} />
              <Route path="content" element={<ContentManagementPage />} />
              <Route path="announcements" element={<AnnouncementsPage />} />
            </Routes>
          </div>

        </div>

        {/* Add Teacher Admin Modal */}
        {showTeacherModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, animation: 'fadeIn 0.2s ease' }}>
            <div style={{ background: '#1f2937', padding: '30px', borderRadius: '12px', width: '400px', border: '1px solid #374151', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff' }}>Register Teacher Admin</h3>
              <form onSubmit={handleRegisterTeacher}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af', fontSize: '0.9rem' }}>Full Name</label>
                  <input type="text" value={teacherForm.name} onChange={e => setTeacherForm({ ...teacherForm, name: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#111827', border: '1px solid #374151', color: '#fff', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af', fontSize: '0.9rem' }}>Email Address</label>
                  <input type="email" value={teacherForm.email} onChange={e => setTeacherForm({ ...teacherForm, email: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#111827', border: '1px solid #374151', color: '#fff', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af', fontSize: '0.9rem' }}>Password</label>
                  <input type="password" value={teacherForm.password} onChange={e => setTeacherForm({ ...teacherForm, password: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#111827', border: '1px solid #374151', color: '#fff', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowTeacherModal(false)} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid #374151', color: '#d1d5db', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '10px 16px', background: '#10b981', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Register</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Global Skill Modal */}
        {showSkillModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, animation: 'fadeIn 0.2s ease' }}>
            <div style={{ background: '#1f2937', padding: '30px', borderRadius: '12px', width: '400px', border: '1px solid #374151', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff' }}>Add Global Skill</h3>
              <form onSubmit={handleAddGlobalSkill}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af', fontSize: '0.9rem' }}>Skill Name</label>
                  <input type="text" value={skillForm.skillName} onChange={e => setSkillForm({ ...skillForm, skillName: e.target.value })} required placeholder="e.g. Advanced React" style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#111827', border: '1px solid #374151', color: '#fff', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af', fontSize: '0.9rem' }}>Provider Name</label>
                  <input type="text" value={skillForm.providerName} onChange={e => setSkillForm({ ...skillForm, providerName: e.target.value })} required placeholder="e.g. System, Community" style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#111827', border: '1px solid #374151', color: '#fff', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowSkillModal(false)} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid #374151', color: '#d1d5db', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '10px 16px', background: '#646cff', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Add Skill</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {showUserModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, animation: 'fadeIn 0.2s ease' }}>
            <div style={{ background: '#1f2937', padding: '30px', borderRadius: '12px', width: '400px', border: '1px solid #374151', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff' }}>Add New User</h3>
              <form onSubmit={handleAddUser}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af', fontSize: '0.9rem' }}>Full Name</label>
                  <input type="text" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#111827', border: '1px solid #374151', color: '#fff', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af', fontSize: '0.9rem' }}>Email Address</label>
                  <input type="email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#111827', border: '1px solid #374151', color: '#fff', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#9ca3af', fontSize: '0.9rem' }}>Password</label>
                  <input type="password" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#111827', border: '1px solid #374151', color: '#fff', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowUserModal(false)} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid #374151', color: '#d1d5db', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '10px 16px', background: '#646cff', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Create User</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Ticket Modal */}
        {showTicketModal && selectedTicket && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, animation: 'fadeIn 0.2s ease' }}>
            <div style={{ background: '#1f2937', padding: '30px', borderRadius: '12px', width: '500px', border: '1px solid #374151', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #374151', paddingBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: '#fff' }}>Ticket Details</h3>
                <span style={{ padding: '4px 10px', background: selectedTicket.status === 'Urgent' ? 'rgba(239,68,68,0.2)' : (selectedTicket.status === 'Pending' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'), color: selectedTicket.status === 'Urgent' ? '#ef4444' : (selectedTicket.status === 'Pending' ? '#f59e0b' : '#10b981'), borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>{selectedTicket.status}</span>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <p style={{ margin: '0 0 5px 0', color: '#9ca3af', fontSize: '0.85rem' }}>Ticket ID & Date</p>
                <p style={{ margin: 0, color: '#e5e7eb', fontWeight: '500' }}>{selectedTicket.id} • {selectedTicket.date}</p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ margin: '0 0 5px 0', color: '#9ca3af', fontSize: '0.85rem' }}>Reported By</p>
                <p style={{ margin: 0, color: '#e5e7eb', fontWeight: '500' }}>{selectedTicket.user}</p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ margin: '0 0 5px 0', color: '#9ca3af', fontSize: '0.85rem' }}>Subject</p>
                <p style={{ margin: 0, color: '#fff', fontWeight: '600' }}>{selectedTicket.subject}</p>
              </div>
              <div style={{ marginBottom: '2rem', background: '#111827', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ margin: '0 0 5px 0', color: '#9ca3af', fontSize: '0.85rem' }}>Description</p>
                <p style={{ margin: 0, color: '#d1d5db', lineHeight: '1.5', fontSize: '0.95rem' }}>{selectedTicket.description}</p>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowTicketModal(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #374151', color: '#d1d5db', borderRadius: '6px', cursor: 'pointer' }}>Close</button>
                {selectedTicket.status !== 'Resolved' && <button onClick={() => { alert('Marked as resolved!'); setShowTicketModal(false); }} style={{ padding: '10px 20px', background: '#10b981', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Mark as Resolved</button>}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SuperAdmin;
