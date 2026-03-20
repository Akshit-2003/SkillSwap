import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { apiRoutes } from '../routes/apiRoutes';
import { getHomeRouteForUser, getStoredUser, storeUser } from '../utils/auth';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      navigate(getHomeRouteForUser(user));
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post(apiRoutes.auth.login, { email, password });
      const user = response.data.user;

      if (user) {
        if (user.role === 'Main Admin' || user.role === 'Super Admin') {
          storeUser(user);
          alert('Welcome Main Admin!');
          navigate('/super-admin');
        } else if (user.role === 'Teacher Admin') {
          storeUser(user);
          alert('Welcome Teacher Admin!');
          navigate('/admin');
        } else {
          alert('Access Denied: You do not have admin privileges.');
        }
      }
    } catch (error) {
      console.error('Login Error:', error);
      alert(error.response?.data?.message || 'Invalid Admin Credentials');
    }
  };

  return (
    <div className="login-container">
      {/* Background & Card similar to Login.jsx but with different colors/branding */}
      <div className="login-background">
        <div className="shape shape-1" style={{ background: 'radial-gradient(circle, #646cff 0%, transparent 70%)' }}></div>
        <div className="shape shape-2" style={{ background: 'radial-gradient(circle, #bc13fe 0%, transparent 70%)' }}></div>
      </div>
      <div className="login-card" style={{ borderColor: 'rgba(100, 108, 255, 0.3)' }}>
        <h2 style={{ color: '#646cff' }}>Admin Portal</h2>
        <p>Restricted Access. Authorized Personnel Only.</p>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary btn-block">Access Dashboard</button>
        </form>
        <div className="divider"></div>
        <p className="register-link">
          Main Admin? <Link to="/super-admin/register" style={{ color: '#646cff' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
