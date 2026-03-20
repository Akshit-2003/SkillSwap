import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { apiRoutes } from '../routes/apiRoutes';
import { getHomeRouteForUser, getStoredUser } from '../utils/auth';

const SuperAdminRegister = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      navigate(getHomeRouteForUser(user));
    }
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    // Simple check for secret key to allow registration
    if (secretKey !== 'Skillswap_SUPER_SECRET') {
      alert('Invalid Secret Key! You are not authorized to create a Main Admin account.');
      return;
    }

    try {
      await API.post(apiRoutes.auth.registerSuperAdmin, { name, email, password, secretKey });
      alert('Main Admin Registered Successfully!');
      navigate('/admin/login');
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Registration Failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="shape shape-1" style={{ background: 'radial-gradient(circle, #646cff 0%, transparent 70%)' }}></div>
        <div className="shape shape-2" style={{ background: 'radial-gradient(circle, #bc13fe 0%, transparent 70%)', top: '20%', right: '20%' }}></div>
      </div>
      <div className="login-card" style={{ borderColor: 'rgba(100, 108, 255, 0.3)' }}>
        <h2 style={{ color: '#646cff' }}>Main Admin Register</h2>
        <p>Create the root administrative account.</p>
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="input-group">
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="input-group">
            <input type="password" placeholder="Secret Key" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary btn-block">Create Main Admin</button>
        </form>
        <p className="register-link" style={{ marginTop: '1rem' }}>
          Already have an account? <Link to="/admin/login" style={{ color: '#646cff' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default SuperAdminRegister;
