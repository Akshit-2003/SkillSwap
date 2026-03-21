import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Register from './components/Register';
import {
  Product, Features, Pricing, Reviews,
  Company, About, Team, Careers,
  Resources, Blog, Guides, Community,
  Legal, Privacy, Terms
} from './components/StaticPages';
import { FindSkills, MySkills, Messages, Profile } from './components/DashboardPages';
import TeacherAdmin from './components/TeacherAdmin';
import SuperAdmin from './components/mainAdmin';
import AdminLogin from './components/AdminLogin';
import SuperAdminRegister from './components/SuperAdminRegister';
import VerifierApplicationForm from './components/VerifierApplicationForm';
import ProtectedRoute from './components/ProtectedRoute';
import { clearStoredUser, getStoredUser } from './utils/auth';
import { buildApiUrl } from './api';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [credits, setCredits] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const notificationRef = useRef(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const updateCredits = () => {
      const parsedUser = getStoredUser();
      if (parsedUser) {
        setCredits(parsedUser.credits !== undefined ? parsedUser.credits : 5);
      }
    };
    updateCredits();
    window.addEventListener('user_updated', updateCredits);
    return () => window.removeEventListener('user_updated', updateCredits);
  }, [location]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowNotifications(false);
    setShowProfileMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('pointerdown', handleOutsideClick, true);
    return () => document.removeEventListener('pointerdown', handleOutsideClick, true);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      const parsedUser = getStoredUser();
      if (parsedUser) {
        try {
          const response = await fetch(buildApiUrl(`/api/user/notifications?email=${encodeURIComponent(parsedUser.email)}`));
          if (response.ok) {
            const data = await response.json();
            setNotifications(data);
          }
        } catch (e) {
          console.error("Failed to fetch notifications", e);
        }
      }
    };
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 5000); // 5 sec real-time polling
    return () => clearInterval(intervalId);
  }, [location.pathname]);

  const isHome = location.pathname === '/';
  const isProduct = location.pathname.startsWith('/product');
  const isCompany = location.pathname.startsWith('/company');
  const isResources = location.pathname.startsWith('/resources');
  const isLegal = location.pathname.startsWith('/legal');

  // Agar path login ya register hai to navbar mat dikhao
  if (['/login', '/register', '/admin/login', '/super-admin/register', '/main-admin/register'].includes(location.pathname) || location.pathname.startsWith('/super-admin') || location.pathname.startsWith('/admin')) {
    return null;
  }

  // Dashboard Navbar (Logged in view)
  if (location.pathname.startsWith('/dashboard')) {
    return (
      <nav>
        <button
          type="button"
          className="nav-toggle"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className="nav-group nav-group-primary">
          <Link to="/dashboard" className="logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/vite.svg" alt="SkillSwap Logo" width="30" height="30" />
            SkillSwap
          </Link>
          <div className={`nav-links ${isMobileMenuOpen ? 'nav-links-open' : ''}`}>
            <Link to="/dashboard" className="nav-link">Overview</Link>
            <Link to="/dashboard/find-skills" className="nav-link">Find Skills</Link>
            <Link to="/dashboard/my-skills" className="nav-link">My Skills</Link>
            <Link to="/dashboard/messages" className="nav-link">Messages</Link>
            <Link to="/dashboard/profile" className="nav-link">Profile</Link>
          </div>
        </div>
        <div className={`nav-group nav-group-secondary ${isMobileMenuOpen ? 'nav-group-open' : ''}`}>
          <div style={{ background: 'rgba(100, 108, 255, 0.15)', padding: '6px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(100, 108, 255, 0.3)' }}>
            <span style={{ fontSize: '1.1rem' }}>⚡</span>
            <span style={{ fontWeight: '600', color: '#fff', fontSize: '0.95rem' }}>{credits} Credits</span>
          </div>
          <div
            ref={notificationRef}
            className="notification-wrapper"
            onMouseEnter={() => setShowNotifications(true)}
            onMouseLeave={() => setShowNotifications(false)}
          >
            <div className="notification-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            </div>
            {notifications.length > 0 && notifications[0].title !== 'All caught up! ✨' && (
              <span className="notification-badge">{notifications.length}</span>
            )}
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">Notifications</div>
                {notifications.map((notif, idx) => (
                  <div className="notification-item" key={idx}>
                    <strong>{notif.title}</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#9ca3af' }}>{notif.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div
            className="profile-wrapper"
            onMouseEnter={() => setShowProfileMenu(true)}
            onMouseLeave={() => setShowProfileMenu(false)}
            style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
          >
            <div
              className="avatar"
              style={{ width: '35px', height: '35px', background: getStoredUser()?.avatar ? `url(${buildApiUrl(getStoredUser().avatar.replace(/\\/g, '/'))}) center/cover` : 'linear-gradient(135deg, #646cff, #bc13fe)', fontSize: '0.9rem', cursor: 'pointer', marginRight: 0 }}
            >
              {!getStoredUser()?.avatar && (getStoredUser()?.name ? getStoredUser().name.charAt(0).toUpperCase() : 'U')}
            </div>
            {showProfileMenu && (
              <div className="notification-dropdown" style={{ width: '220px' }}>
                <div className="notification-header" style={{ padding: '15px' }}>
                  <strong style={{ display: 'block', color: '#fff', fontSize: '1rem' }}>{getStoredUser()?.name || 'User'}</strong>
                  <span style={{ color: '#aaa', fontSize: '0.8rem', fontWeight: 'normal' }}>{getStoredUser()?.email}</span>
                </div>
                <div className="notification-item" onClick={() => navigate('/dashboard/profile')}>
                  <strong>⚙️ Profile Settings</strong>
                </div>
                <div className="notification-item" onClick={() => { clearStoredUser(); navigate('/'); }}>
                  <strong style={{ color: '#ff4d4d' }}>🚪 Logout</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    );
  }


  return (
    <nav>
      <button
        type="button"
        className="nav-toggle"
        onClick={() => setIsMobileMenuOpen((open) => !open)}
        aria-label="Toggle navigation menu"
        aria-expanded={isMobileMenuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div className="nav-group nav-group-primary nav-group-home">
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/vite.svg" alt="SkillSwap Logo" width="30" height="30" />
          Skillswap
        </div>
        <div className={`nav-links ${isMobileMenuOpen ? 'nav-links-open' : ''}`}>
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink>

          <div className="nav-item">
            <NavLink to="/product" className={`nav-link ${isProduct ? 'active' : ''}`}>Product</NavLink>
            <div className="dropdown">
              <Link to="/product/features">Features</Link>
              <Link to="/product/pricing">Pricing</Link>
              <Link to="/product/reviews">Reviews</Link>
            </div>
          </div>

          <div className="nav-item">
            <NavLink to="/company" className={`nav-link ${isCompany ? 'active' : ''}`}>Company</NavLink>
            <div className="dropdown">
              <Link to="/company/about">About Us</Link>
              <Link to="/company/team">Our Team</Link>
              <Link to="/company/careers">Careers</Link>
            </div>
          </div>

          <div className="nav-item">
            <NavLink to="/resources" className={`nav-link ${isResources ? 'active' : ''}`}>Resources</NavLink>
            <div className="dropdown">
              <Link to="/resources/blog">Blog</Link>
              <Link to="/resources/guides">Guides</Link>
              <Link to="/resources/community">Community</Link>
            </div>
          </div>

          <div className="nav-item">
            <NavLink to="/legal" className={`nav-link ${isLegal ? 'active' : ''}`}>Legal</NavLink>
            <div className="dropdown">
              <Link to="/legal/privacy">Privacy Policy</Link>
              <Link to="/legal/terms">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
      <div className={`nav-group nav-group-secondary ${isMobileMenuOpen ? 'nav-group-open' : ''}`} style={{ alignItems: 'center' }}>
        <Link to="/apply-verifier" style={{ textDecoration: 'none', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.5)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem 1.2rem', borderRadius: '30px', fontSize: '0.9rem', marginRight: '15px', fontWeight: '600', transition: 'all 0.2s' }}>
          🛡️ Become a Verifier
        </Link>
        <Link to="/admin/login" style={{ textDecoration: 'none', color: '#9ca3af', fontSize: '0.85rem', marginRight: '15px' }}>
          Admin
        </Link>
        <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '0.6rem 1.5rem', borderRadius: '30px', fontSize: '0.95rem', fontWeight: '600' }}>
          Get Started
        </Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['User']}><div className="page-content"><Dashboard /></div></ProtectedRoute>} />
        <Route path="/dashboard/my-skills" element={<ProtectedRoute allowedRoles={['User']}><MySkills /></ProtectedRoute>} />
        <Route path="/dashboard/messages" element={<ProtectedRoute allowedRoles={['User']}><Messages /></ProtectedRoute>} />
        <Route path="/dashboard/profile" element={<ProtectedRoute allowedRoles={['User']}><Profile /></ProtectedRoute>} />
        <Route path="/dashboard/find-skills" element={<ProtectedRoute allowedRoles={['User']}><FindSkills /></ProtectedRoute>} />
        <Route path="/apply-verifier" element={<VerifierApplicationForm />} />
        <Route path="/community" element={<Community />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/super-admin/register" element={<SuperAdminRegister />} />
        <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['Teacher Admin', 'Main Admin', 'Super Admin']}><TeacherAdmin /></ProtectedRoute>} />
        <Route path="/super-admin/*" element={<ProtectedRoute allowedRoles={['Main Admin', 'Super Admin']}><SuperAdmin /></ProtectedRoute>} />
        {/* Main Admin Route alias */}
        <Route path="/main-admin/register" element={<SuperAdminRegister />} />

        {/* Product Routes */}
        <Route path="/product" element={<Product />} />
        <Route path="/product/features" element={<Features />} />
        <Route path="/product/pricing" element={<Pricing />} />
        <Route path="/product/reviews" element={<Reviews />} />

        {/* Company Routes */}
        <Route path="/company" element={<Company />} />
        <Route path="/company/about" element={<About />} />
        <Route path="/company/team" element={<Team />} />
        <Route path="/company/careers" element={<Careers />} />

        {/* Resources Routes */}
        <Route path="/resources" element={<Resources />} />
        <Route path="/resources/blog" element={<Blog />} />
        <Route path="/resources/guides" element={<Guides />} />
        <Route path="/resources/community" element={<Community />} />

        {/* Legal Routes */}
        <Route path="/legal" element={<Legal />} />
        <Route path="/legal/privacy" element={<Privacy />} />
        <Route path="/legal/terms" element={<Terms />} />
        <Route path="/legal/guidelines" element={<Terms />} />
      </Routes>
    </Router>
  );
}

export default App;
