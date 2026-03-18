import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.role === 'Main Admin' || user.role === 'Super Admin') {
          navigate('/super-admin');
        } else if (user.role === 'Teacher Admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } catch (e) { }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const user = data.user;
        // Check for specific admin roles
        if (user.role === 'Main Admin' || user.role === 'Super Admin') {
          localStorage.setItem('user', JSON.stringify(user));
          alert('Welcome Main Admin!');
          navigate('/super-admin');
        } else if (user.role === 'Teacher Admin') {
          localStorage.setItem('user', JSON.stringify(user));
          alert('Welcome Teacher Admin!');
          navigate('/admin');
        } else {
          alert('Access Denied: You do not have admin privileges.');
        }
      } else {
        alert(data.message || 'Invalid Admin Credentials');
      }
    } catch (error) {
      console.error('Login Error:', error);
      // Fallback for development if backend is unreachable
      if (email === 'super@Skillswap.com' && password === 'super123') {
        alert('Welcome Main Admin (Dev Mode)!');
        navigate('/super-admin');
      } else if (email.includes('admin') && password === 'admin123') {
        alert('Welcome Teacher Admin (Dev Mode)!');
        navigate('/admin');
      } else {
        alert('Server unreachable and invalid credentials.');
      }
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