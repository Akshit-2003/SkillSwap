import React, { useState, useEffect } from 'react';
import { buildApiUrl } from '../api';

// Reusing PageContainer style for consistency
const PageContainer = ({ title, children }) => (
    <div className="page-content admin-page-container super-admin-page" style={{ textAlign: 'left', animation: 'fadeInUp 0.5s ease-out', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', background: 'linear-gradient(to right, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>{title}</h1>
        {children}
    </div>
);

const SuperAdmin = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [admins, setAdmins] = useState([]);

    // Function to fetch admins from backend
    const fetchAdmins = async () => {
        try {
            const response = await fetch(buildApiUrl('get-teacher-admins'));
            const data = await response.json();
            if (response.ok) {
                setAdmins(data);
            }
        } catch (error) {
            console.error('Failed to fetch admins:', error);
        }
    };

    // Fetch admins on component mount
    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(buildApiUrl('register-teacher-admin'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            alert(data.message || 'An error occurred.');
            if (response.ok) {
                fetchAdmins(); // Refresh admin list
                setFormData({ name: '', email: '', password: '' }); // Clear form
            }
        } catch (error) {
            alert('Failed to register admin. Is the server running?');
        }
    };

    const handleRemove = async (id) => {
        if (window.confirm('Are you sure you want to remove this admin?')) {
            try {
                const response = await fetch(buildApiUrl(`remove-admin/${id}`), { method: 'DELETE' });
                const data = await response.json();
                alert(data.message);
                if (response.ok) {
                    fetchAdmins(); // Refresh admin list
                }
            } catch (error) {
                alert('Failed to remove admin.');
            }
        }
    };

    return (
        <PageContainer title="Main Admin Dashboard">
            <div className="dashboard-stats">
                <div className="stat-card">
                    <h4 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', background: 'linear-gradient(135deg, #646cff 0%, #bc13fe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{admins.length}</h4>
                    <p style={{ color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>Active Admins</p>
                </div>
                <div className="stat-card">
                    <h4 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', background: 'linear-gradient(135deg, #646cff 0%, #bc13fe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Main</h4>
                    <p style={{ color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>Your Role</p>
                </div>
            </div>

            <div className="dashboard-grid super-admin-grid" style={{ marginTop: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
                {/* Registration Form */}
                <div className="card" style={{ margin: 0, textAlign: 'left' }}>
                    <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>Register Teacher Admin</h3>
                    <form onSubmit={handleRegister} style={{ marginTop: 0 }}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                placeholder="Admin Name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                placeholder="admin@Skillswap.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                        <button className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Create Admin Account</button>
                    </form>
                </div>

                {/* Admin List */}
                <div className="card" style={{ margin: 0, textAlign: 'left' }}>
                    <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>Manage Admins</h3>
                    <div className="session-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {admins.length === 0 ? (
                            <p style={{ color: '#aaa', textAlign: 'center' }}>No admins found.</p>
                        ) : (
                            admins.map(admin => (
                                <div key={admin._id} className="session-item super-admin-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div className="super-admin-meta" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div className="avatar" style={{ background: '#bc13fe', fontSize: '1rem', width: '40px', height: '40px' }}>{admin.name.charAt(0)}</div>
                                        <div>
                                            <strong style={{ display: 'block', color: '#fff', fontSize: '0.95rem' }}>{admin.name}</strong>
                                            <small style={{ color: '#aaa', fontSize: '0.8rem' }}>{admin.email}</small>
                                        </div>
                                    </div>
                                    <button
                                        className="btn-danger"
                                        onClick={() => handleRemove(admin._id)}
                                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

export default SuperAdmin;
