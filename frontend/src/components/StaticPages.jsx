import React from 'react';
import { Link } from 'react-router-dom';


// Helper for page container to ensure consistent spacing
const PageContainer = ({ children, title, subtitle, action }) => (
  <div className="page-content static-page-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '4rem 2rem', textAlign: 'center', animation: 'fadeInUp 0.5s ease-out' }}>
    <div className="static-page-hero" style={{ marginBottom: '5rem', position: 'relative', padding: '2rem 0' }}>
      <div className="static-page-glow" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60%', height: '150%', background: 'radial-gradient(ellipse at center, rgba(100,108,255,0.15) 0%, rgba(0,0,0,0) 70%)', zIndex: -1, pointerEvents: 'none' }}></div>
      {title && <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1.5rem', letterSpacing: '-0.02em', background: 'linear-gradient(to bottom right, #ffffff, #a5a5a5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>{title}</h1>}
      {subtitle && <p style={{ fontSize: '1.25rem', color: '#aaa', maxWidth: '700px', margin: '0 auto', lineHeight: '1.7' }}>{subtitle}</p>}
      {action && <div style={{ marginTop: '2.5rem' }}>{action}</div>}
    </div>
    {children}
  </div>
);

// --- Product Section ---

export const Product = () => (
  <PageContainer
    title="Our Product"
    subtitle="The ultimate platform for skill exchange. Connect, learn, and grow with a global community."
    action={<Link to="/register" className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', textDecoration: 'none' }}>Start Swapping Now</Link>}
  >
    <div className="features-grid">
      <div className="feature-item" style={{ background: 'linear-gradient(145deg, #1e1e1e, #141414)' }}>
        <div className="feature-icon" style={{ background: 'rgba(100, 108, 255, 0.1)', color: '#646cff', border: 'none' }}>🎓</div>
        <h3>For Learners</h3>
        <p>Access a world of knowledge for free. Find mentors who match your learning style and pace.</p>
      </div>
      <div className="feature-item" style={{ background: 'linear-gradient(145deg, #1e1e1e, #141414)' }}>
        <div className="feature-icon" style={{ background: 'rgba(188, 19, 254, 0.1)', color: '#bc13fe', border: 'none' }}>👩‍🏫</div>
        <h3>For Teachers</h3>
        <p>Share your passion and build a reputation. Teaching is the best way to master a subject.</p>
      </div>
      <div className="feature-item" style={{ background: 'linear-gradient(145deg, #1e1e1e, #141414)' }}>
        <div className="feature-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'none' }}>🌐</div>
        <h3>Global Network</h3>
        <p>Connect with people from different cultures and backgrounds through the language of skills.</p>
      </div>
    </div>
  </PageContainer>
);

export const Features = () => (
  <PageContainer title="Platform Features" subtitle="Everything you need to facilitate seamless learning experiences.">
    <div className="features-grid">
      <div className="feature-item">
        <div className="feature-icon" style={{ fontSize: '2.5rem' }}>🔍</div>
        <h3>Smart Matching</h3>
        <p>Our algorithm pairs you with the perfect learning partner based on skills, proficiency, and availability.</p>
      </div>
      <div className="feature-item">
        <div className="feature-icon" style={{ fontSize: '2.5rem' }}>🎥</div>
        <h3>Integrated Video</h3>
        <p>High-quality video calls built right into the platform for seamless lessons without external tools.</p>
      </div>
      <div className="feature-item">
        <div className="feature-icon" style={{ fontSize: '2.5rem' }}>📅</div>
        <h3>Smart Scheduling</h3>
        <p>Easy calendar integration to manage your sessions automatically across time zones.</p>
      </div>
      <div className="feature-item">
        <div className="feature-icon" style={{ fontSize: '2.5rem' }}>💬</div>
        <h3>Real-time Chat</h3>
        <p>Stay connected with your mentors and students with instant messaging and file sharing.</p>
      </div>
      <div className="feature-item">
        <div className="feature-icon" style={{ fontSize: '2.5rem' }}>🏆</div>
        <h3>Gamification</h3>
        <p>Earn badges and certificates as you learn and teach, showcasing your progress.</p>
      </div>
      <div className="feature-item">
        <div className="feature-icon" style={{ fontSize: '2.5rem' }}>🔒</div>
        <h3>Secure Platform</h3>
        <p>Your data and privacy are our top priority. Learn in a safe and verified environment.</p>
      </div>
    </div>
  </PageContainer>
);

export const Pricing = () => (
  <PageContainer title="Simple, Transparent Pricing" subtitle="Education should be accessible to everyone.">
    <div className="stats-grid pricing-grid" style={{ marginTop: '2rem', alignItems: 'stretch', justifyContent: 'center', gap: '3rem' }}>
      <div className="card pricing-card pricing-card-featured" style={{ border: '2px solid var(--primary, #646cff)', transform: 'scale(1.05)', position: 'relative', padding: '3rem 2rem', background: 'linear-gradient(180deg, rgba(30,30,30,1) 0%, rgba(20,20,20,1) 100%)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
        <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary, #646cff)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(100,108,255,0.4)' }}>MOST POPULAR</div>
        <h2>Free Forever</h2>
        <h1 style={{ fontSize: '4rem', color: '#fff', margin: '1rem 0', fontWeight: '800' }}>$0</h1>
        <p style={{ opacity: 0.8 }}>For everyone, everywhere.</p>
        <ul className="pricing-list" style={{ listStyle: 'none', padding: 0, textAlign: 'left', margin: '2.5rem 0', display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '1.05rem' }}>
          <li className="pricing-list-item" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#646cff' }}>✓</span> Unlimited Skill Swaps</li>
          <li className="pricing-list-item" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#646cff' }}>✓</span> Access to Community Forum</li>
          <li className="pricing-list-item" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#646cff' }}>✓</span> Basic Profile Customization</li>
          <li className="pricing-list-item" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#646cff' }}>✓</span> 1-on-1 Video Calls</li>
        </ul>
        <Link to="/register" className="btn-primary" style={{ width: '100%', padding: '1rem', display: 'block', boxSizing: 'border-box', textDecoration: 'none' }}>Get Started Now</Link>
      </div>
      <div className="card pricing-card" style={{ padding: '3rem 2rem', opacity: 0.8, background: 'var(--bg-card)' }}>
        <h2>Pro (Supporter)</h2>
        <h1 style={{ fontSize: '4rem', margin: '1rem 0', fontWeight: '800' }}>$9</h1>
        <p style={{ opacity: 0.8 }}>/month</p>
        <ul className="pricing-list" style={{ listStyle: 'none', padding: 0, textAlign: 'left', margin: '2.5rem 0', display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '1.05rem' }}>
          <li className="pricing-list-item" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#bc13fe' }}>✓</span> Verified "Supporter" Badge</li>
          <li className="pricing-list-item" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#bc13fe' }}>✓</span> Priority Customer Support</li>
          <li className="pricing-list-item" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#bc13fe' }}>✓</span> Advanced Learning Analytics</li>
          <li className="pricing-list-item" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: '#bc13fe' }}>✓</span> Support the Platform</li>
        </ul>
        <button className="btn-outline" style={{ width: '100%', padding: '1rem' }}>Coming Soon</button>
      </div>
    </div>
  </PageContainer>
);

export const Reviews = () => (
  <PageContainer title="Community Reviews" subtitle="Hear from our community of learners and teachers.">
    <div className="testimonial-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
      <div className="card" style={{ textAlign: 'left', background: '#1a1a1a', border: '1px solid #333' }}>
        <div style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#fbbf24' }}>★★★★★</div>
        <p style={{ fontStyle: 'italic', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>"Changed my career path completely. I learned Python here from a senior dev in exchange for teaching him Spanish. The quality of mentorship was insane!"</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="avatar" style={{ background: '#ff6b6b', width: '48px', height: '48px', fontSize: '1rem' }}>JD</div>
          <div>
            <h4 style={{ margin: 0 }}>Jane Doe</h4>
            <small style={{ color: '#888' }}>Learned Python</small>
          </div>
        </div>
      </div>
      <div className="card" style={{ textAlign: 'left', background: '#1a1a1a', border: '1px solid #333' }}>
        <div style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#fbbf24' }}>★★★★★</div>
        <p style={{ fontStyle: 'italic', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>"The best way to learn a language is by speaking it. Skillswap made that possible. I've made friends from all over the world."</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="avatar" style={{ background: '#10b981', width: '48px', height: '48px', fontSize: '1rem' }}>CR</div>
          <div>
            <h4 style={{ margin: 0 }}>Carlos R.</h4>
            <small style={{ color: '#888' }}>Learned English</small>
          </div>
        </div>
      </div>
      <div className="card" style={{ textAlign: 'left', background: '#1a1a1a', border: '1px solid #333' }}>
        <div style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#fbbf24' }}>★★★★★</div>
        <p style={{ fontStyle: 'italic', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>"I was skeptical at first, but the community is so welcoming. I taught guitar and learned how to cook Italian food. Win-win!"</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="avatar" style={{ background: '#bc13fe', width: '48px', height: '48px', fontSize: '1rem' }}>SM</div>
          <div>
            <h4 style={{ margin: 0 }}>Sarah M.</h4>
            <small style={{ color: '#888' }}>Learned Cooking</small>
          </div>
        </div>
      </div>
    </div>
  </PageContainer>
);

// --- Company Section ---

export const Company = () => (
  <PageContainer title="About Skillswap" subtitle="Building the future of peer-to-peer learning.">
    <div className="text-content-card" style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.8', fontSize: '1.15rem', textAlign: 'left', color: '#e0e0e0' }}>
      <p style={{ marginBottom: '1.5rem' }}>
        We believe that education should be accessible to everyone. By connecting people who want to learn with people who can teach, we're building a global community of lifelong learners.
      </p>
      <p style={{ marginBottom: '1.5rem' }}>
        Skillswap was founded on the idea that everyone is an expert at something. Whether it's coding, cooking, playing an instrument, or speaking a language, your knowledge has value.
      </p>
      <p>
        Our platform removes the financial barrier to education by allowing users to trade their skills directly. No money changes hands—just knowledge.
      </p>
    </div>
  </PageContainer>
);

export const About = () => (
  <PageContainer title="Our Mission" subtitle="To democratize education by creating a peer-to-peer network where knowledge is the currency.">
    <div className="values-grid" style={{ marginTop: '3rem' }}>
      <div className="value-item" style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '16px' }}>
        <span className="value-icon" style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1.5rem' }}>🔓</span>
        <h3>Accessibility</h3>
        <p>Learning shouldn't be expensive. We make it free for everyone.</p>
      </div>
      <div className="value-item" style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '16px' }}>
        <span className="value-icon" style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1.5rem' }}>🌱</span>
        <h3>Growth</h3>
        <p>We believe in continuous improvement and lifelong learning.</p>
      </div>
      <div className="value-item" style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '16px' }}>
        <span className="value-icon" style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1.5rem' }}>🌍</span>
        <h3>Community</h3>
        <p>We grow faster when we grow together. Collaboration over competition.</p>
      </div>
    </div>
  </PageContainer>
);

export const Team = () => (
  <PageContainer title="Meet the Team" subtitle="The passionate people behind Skillswap.">
    <div className="features-grid">
      <div className="card" style={{ padding: '3rem 2rem' }}>
        <div className="avatar" style={{ width: '120px', height: '120px', margin: '0 auto 1.5rem', fontSize: '3.5rem', background: '#646cff', boxShadow: '0 10px 20px rgba(100, 108, 255, 0.3)' }}>👨‍💻</div>
        <h3>Akshit Kansal</h3>
        <p style={{ color: '#646cff', fontWeight: 'bold' }}>Co-Founder & Developer</p>
        <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>Driving the technical vision and building the core infrastructure of Skillswap.</p>
      </div>
      <div className="card" style={{ padding: '3rem 2rem' }}>
        <div className="avatar" style={{ width: '120px', height: '120px', margin: '0 auto 1.5rem', fontSize: '3.5rem', background: '#bc13fe', boxShadow: '0 10px 20px rgba(188, 19, 254, 0.3)' }}>🚀</div>
        <h3>Anmol Amoli</h3>
        <p style={{ color: '#bc13fe', fontWeight: 'bold' }}>Co-Founder & Developer</p>
        <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>Crafting intuitive user experiences and shaping the product strategy.</p>
      </div>
    </div>
  </PageContainer>
);

export const Careers = () => (
  <PageContainer title="Join Us" subtitle="Help us shape the future of learning. We are always looking for talent.">
    <div className="careers-list" style={{ marginTop: '2rem', textAlign: 'left', maxWidth: '800px', margin: '2rem auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card career-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2.5rem', flexDirection: 'row', textAlign: 'left' }}>
        <div>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.4rem' }}>Frontend Developer</h3>
          <p style={{ color: '#aaa', margin: 0 }}>Remote • React, CSS, WebRTC</p>
        </div>
        <button className="btn-primary">Apply Now</button>
      </div>
      <div className="card career-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2.5rem', flexDirection: 'row', textAlign: 'left' }}>
        <div>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.4rem' }}>Community Manager</h3>
          <p style={{ color: '#aaa', margin: 0 }}>Remote • Social Media, Support</p>
        </div>
        <button className="btn-primary">Apply Now</button>
      </div>
      <div className="card career-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2.5rem', flexDirection: 'row', textAlign: 'left' }}>
        <div>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.4rem' }}>Backend Engineer</h3>
          <p style={{ color: '#aaa', margin: 0 }}>Remote • Node.js, MongoDB</p>
        </div>
        <button className="btn-primary">Apply Now</button>
      </div>
    </div>
  </PageContainer>
);

// --- Resources Section ---

export const Resources = () => (
  <PageContainer title="Resources" subtitle="Everything you need to succeed on Skillswap.">
    <div className="features-grid">
      <Link to="/resources/blog" className="card" style={{ textDecoration: 'none', color: 'inherit', transition: 'all 0.3s', padding: '3rem 2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📰</div>
        <h3>Blog</h3>
        <p>Latest news, success stories, and tips for learning.</p>
      </Link>
      <Link to="/resources/guides" className="card" style={{ textDecoration: 'none', color: 'inherit', transition: 'all 0.3s', padding: '3rem 2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📚</div>
        <h3>Guides</h3>
        <p>Step-by-step tutorials on how to be a great mentor.</p>
      </Link>
      <Link to="/resources/community" className="card" style={{ textDecoration: 'none', color: 'inherit', transition: 'all 0.3s', padding: '3rem 2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>👥</div>
        <h3>Community</h3>
        <p>Join discussions and connect with other learners.</p>
      </Link>
    </div>
  </PageContainer>
);

export const Blog = () => (
  <PageContainer title="Skillswap Blog" subtitle="Insights and stories from the community.">
    <div className="features-grid">
      <div className="card" style={{ textAlign: 'left', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: '150px', background: 'linear-gradient(45deg, #646cff, #bc13fe)', borderRadius: '8px', marginBottom: '1rem' }}></div>
        <div style={{ padding: '1.5rem' }}>
          <small style={{ color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>Oct 12, 2023</small>
          <h3 style={{ margin: '0.5rem 0', fontSize: '1.4rem' }}>Top 10 Skills in Demand for 2024</h3>
          <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem' }}>Discover what everyone is learning this year and how you can get ahead...</p>
          <a href="#" style={{ color: 'var(--primary, #646cff)', fontWeight: 'bold', textDecoration: 'none' }}>Read More →</a>
        </div>
      </div>
      <div className="card" style={{ textAlign: 'left', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: '150px', background: 'linear-gradient(45deg, #ff6b6b, #f9cb28)', borderRadius: '8px', marginBottom: '1rem' }}></div>
        <div style={{ padding: '1.5rem' }}>
          <small style={{ color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>Sep 28, 2023</small>
          <h3 style={{ margin: '0.5rem 0', fontSize: '1.4rem' }}>How to Structure Your First Lesson</h3>
          <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem' }}>Teaching for the first time? Here is a simple guide to planning your session...</p>
          <a href="#" style={{ color: 'var(--primary, #646cff)', fontWeight: 'bold', textDecoration: 'none' }}>Read More →</a>
        </div>
      </div>
      <div className="card" style={{ textAlign: 'left', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: '150px', background: 'linear-gradient(45deg, #10b981, #3b82f6)', borderRadius: '8px', marginBottom: '1rem' }}></div>
        <div style={{ padding: '1.5rem' }}>
          <small style={{ color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>Sep 15, 2023</small>
          <h3 style={{ margin: '0.5rem 0', fontSize: '1.4rem' }}>The Power of Peer Learning</h3>
          <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem' }}>Why learning from a peer can be more effective than traditional methods...</p>
          <a href="#" style={{ color: 'var(--primary, #646cff)', fontWeight: 'bold', textDecoration: 'none' }}>Read More →</a>
        </div>
      </div>
    </div>
  </PageContainer>
);

export const Guides = () => (
  <PageContainer title="Learning Guides" subtitle="Master the platform and your skills.">
    <div className="faq-list text-content-card" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="faq-item" style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '12px', textAlign: 'left', border: '1px solid #333' }}>
        <h3 style={{ marginBottom: '0.5rem', color: '#646cff' }}>Getting Started</h3>
        <p>Create your profile, list your skills, and browse the marketplace. Make sure to add a clear profile picture and bio.</p>
      </div>
      <div className="faq-item" style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '12px', textAlign: 'left', border: '1px solid #333' }}>
        <h3 style={{ marginBottom: '0.5rem', color: '#646cff' }}>Safety Tips</h3>
        <p>Always keep communication within the platform. Never share financial info. Report any suspicious behavior immediately.</p>
      </div>
      <div className="faq-item" style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '12px', textAlign: 'left', border: '1px solid #333' }}>
        <h3 style={{ marginBottom: '0.5rem', color: '#646cff' }}>How to Swap</h3>
        <p>Find a user with a skill you want. Check if you have a skill they want (or offer "General Help"). Send a request and schedule a time.</p>
      </div>
    </div>
  </PageContainer>
);

export const Community = () => (
  <PageContainer title="Community Forum" subtitle="Connect with other learners outside of sessions.">
    <div className="card" style={{ padding: '4rem', border: '2px dashed #444', background: 'transparent' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚧</div>
      <h3>Discussion Board Coming Soon!</h3>
      <p>We are building a place for you to ask questions, share resources, and chat with the community.</p>
      <button className="btn-primary" style={{ marginTop: '2rem' }}>Join Waitlist</button>
    </div>
  </PageContainer>
);

// --- Legal Section ---

export const Legal = () => (
  <PageContainer title="Legal Information" subtitle="Transparency is key to our relationship with you.">
    <div className="legal-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
      <Link to="/legal/privacy" className="card" style={{ textDecoration: 'none', color: 'inherit', padding: '3rem 2rem' }}>
        <h3>🔒 Privacy Policy</h3>
        <p>How we handle your data.</p>
      </Link>
      <Link to="/legal/terms" className="card" style={{ textDecoration: 'none', color: 'inherit', padding: '3rem 2rem' }}>
        <h3>⚖️ Terms of Service</h3>
        <p>Rules for using our platform.</p>
      </Link>
      <Link to="/legal/guidelines" className="card" style={{ textDecoration: 'none', color: 'inherit', padding: '3rem 2rem' }}>
        <h3>📜 Community Guidelines</h3>
        <p>Standards for behavior.</p>
      </Link>
    </div>
  </PageContainer>
);

export const Privacy = () => (
  <PageContainer title="Privacy Policy" subtitle="Last updated: October 2023">
    <div className="legal-content-card" style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto', background: '#1a1a1a', padding: '3rem', borderRadius: '16px' }}>
      <h3 style={{ color: '#646cff' }}>1. Information We Collect</h3>
      <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us.</p>
      <h3 style={{ color: '#646cff' }}>2. How We Use Your Information</h3>
      <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>We use the information we collect to provide, maintain, and improve our services, such as to facilitate payments, send receipts, provide products and services you request (and send related information), develop new features, provide customer support to Users and Drivers, develop safety features, authenticate users, and send product updates and administrative messages.</p>
      <h3 style={{ color: '#646cff' }}>3. Data Security</h3>
      <p style={{ lineHeight: '1.6' }}>We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage.</p>
    </div>
  </PageContainer>
);

export const Terms = () => (
  <PageContainer title="Terms of Service" subtitle="Last updated: October 2023">
    <div className="legal-content-card" style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto', background: '#1a1a1a', padding: '3rem', borderRadius: '16px' }}>
      <h3 style={{ color: '#646cff' }}>1. Acceptance of Terms</h3>
      <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Services.</p>
      <h3 style={{ color: '#646cff' }}>2. User Conduct</h3>
      <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>You agree to use the Services only for lawful purposes and in accordance with these Terms. You agree not to use the Services: In any way that violates any applicable federal, state, local, or international law or regulation.</p>
      <h3 style={{ color: '#646cff' }}>3. Termination</h3>
      <p style={{ lineHeight: '1.6' }}>We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.</p>
    </div>
  </PageContainer>
);
