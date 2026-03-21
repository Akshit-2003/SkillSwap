import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../api';
import { getStoredUser } from '../utils/auth';

const PageContainer = ({ title, subtitle, children }) => (
    <div className="page-content" style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem', textAlign: 'center', animation: 'fadeInUp 0.5s ease-out' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(to right, #646cff, #bc13fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block', fontWeight: '800' }}>{title}</h1>
        {subtitle && <p style={{ color: '#9ca3af', marginBottom: '3rem', fontSize: '1.15rem', maxWidth: '650px', margin: '0 auto 3rem', lineHeight: '1.6' }}>{subtitle}</p>}
        {children}
    </div>
);

const VerifierApplicationForm = () => {
    const navigate = useNavigate();
    const user = getStoredUser();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        category: 'Tech',
        experience: '',
        summary: '',
        linkedinUrl: '',
        skills: '',
        proofFile: null
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'proofFile') {
            setFormData({ ...formData, proofFile: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.proofFile) {
            alert("Please upload a proof of expertise.");
            return;
        }

        setIsSubmitting(true);
        try {
            const data = new FormData();
            if (user) {
                data.append('userId', user._id || user.email);
            }
            data.append('name', formData.name);
            data.append('email', formData.email);
            if (!user) data.append('password', formData.password);
            data.append('category', formData.category);
            data.append('experience', formData.experience);
            data.append('summary', formData.summary);
            data.append('linkedinUrl', formData.linkedinUrl);
            data.append('skills', formData.skills);
            data.append('proofFile', formData.proofFile);

            // Placeholder backend route (aapko yeh route Node.js mein banana hoga)
            const response = await fetch(buildApiUrl('/api/verifier/apply'), {
                method: 'POST',
                body: data, // No JSON.stringify, fetch automatically sets headers for FormData
            });

            const text = await response.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch (err) {
                throw new Error("Server returned an HTML page instead of JSON. Backend route '/api/verifier/apply' might be missing.");
            }

            if (response.ok) {
                alert("Application submitted successfully! It is now pending review.");
                navigate(user ? '/dashboard' : '/');
            } else {
                alert(result.message || "Failed to submit application. Note: You might already have a pending application.");
            }
        } catch (error) {
            console.error("Submission error:", error);
            alert(error.message || "An error occurred while submitting the form.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PageContainer title="Become a Verifier" subtitle="Join our elite team of moderators. Help us maintain platform quality by verifying user skills, and earn exclusive badges and perks.">
            <div className="card" style={{ padding: '3rem', margin: '0 auto', maxWidth: '800px', width: '100%', background: '#1f2937', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', textAlign: 'left', position: 'relative', overflow: 'hidden' }}>

                {/* Subtle background glow */}
                <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(100,108,255,0.1) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }}></div>

                <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }}>
                    <h3 style={{ marginTop: 0, marginBottom: '2rem', fontSize: '1.4rem', color: '#fff', borderBottom: '1px solid #374151', paddingBottom: '1rem' }}>Application Details</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        {!user && (
                            <>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#d1d5db', fontSize: '0.95rem', fontWeight: '500' }}>👤 Full Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #4b5563', background: 'rgba(17,24,39,0.7)', color: '#fff', fontSize: '1rem', boxSizing: 'border-box' }} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#d1d5db', fontSize: '0.95rem', fontWeight: '500' }}>✉️ Email Address</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #4b5563', background: 'rgba(17,24,39,0.7)', color: '#fff', fontSize: '1rem', boxSizing: 'border-box' }} />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#d1d5db', fontSize: '0.95rem', fontWeight: '500' }}>🔑 Create Password</label>
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="To access your verifier dashboard later" style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #4b5563', background: 'rgba(17,24,39,0.7)', color: '#fff', fontSize: '1rem', boxSizing: 'border-box' }} />
                                </div>
                            </>
                        )}

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#d1d5db', fontSize: '0.95rem', fontWeight: '500' }}>🏷️ Expertise Category</label>
                            <select name="category" value={formData.category} onChange={handleChange} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #4b5563', background: 'rgba(17,24,39,0.7)', color: '#fff', fontSize: '1rem', boxSizing: 'border-box' }}>
                                <option value="Tech">Tech & Programming</option>
                                <option value="Creative Arts">Creative Arts & Design</option>
                                <option value="Academics">Academics & Languages</option>
                                <option value="Fitness">Fitness & Lifestyle</option>
                                <option value="Music">Music & Audio</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#d1d5db', fontSize: '0.95rem', fontWeight: '500' }}>⏳ Years of Experience</label>
                            <input type="number" name="experience" min="1" value={formData.experience} onChange={handleChange} required placeholder="e.g. 5" style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #4b5563', background: 'rgba(17,24,39,0.7)', color: '#fff', fontSize: '1rem', boxSizing: 'border-box' }} />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#d1d5db', fontSize: '0.95rem', fontWeight: '500' }}>🎯 Specific Skills to Moderate</label>
                            <input type="text" name="skills" value={formData.skills} onChange={handleChange} required placeholder="e.g. React, Node.js, System Design" style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #4b5563', background: 'rgba(17,24,39,0.7)', color: '#fff', fontSize: '1rem', boxSizing: 'border-box' }} />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#d1d5db', fontSize: '0.95rem', fontWeight: '500' }}>🔗 LinkedIn or Portfolio URL</label>
                            <input type="url" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} required placeholder="https://linkedin.com/in/yourprofile" style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #4b5563', background: 'rgba(17,24,39,0.7)', color: '#fff', fontSize: '1rem', boxSizing: 'border-box' }} />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#d1d5db', fontSize: '0.95rem', fontWeight: '500' }}>📝 Professional Summary</label>
                        <textarea name="summary" rows="4" value={formData.summary} onChange={handleChange} required placeholder="Briefly describe your professional background and why you'd be a good verifier... (Approx. 200 words)" style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #4b5563', background: 'rgba(17,24,39,0.7)', color: '#fff', fontSize: '1rem', boxSizing: 'border-box', resize: 'vertical' }}></textarea>
                    </div>

                    <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#d1d5db', fontSize: '0.95rem', fontWeight: '500' }}>📄 Proof of Expertise (PDF/JPG/PNG)</label>
                        <div style={{ padding: '2.5rem 2rem', border: '2px dashed #4b5563', borderRadius: '12px', textAlign: 'center', background: 'rgba(17,24,39,0.5)', transition: 'all 0.2s ease', position: 'relative' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.8 }}>📁</div>
                            {/* Transparent file input covering the whole area */}
                            <input type="file" name="proofFile" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} required style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} title="Upload proof file" />
                            <p style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: formData.proofFile ? '#10b981' : '#e5e7eb', fontWeight: '600' }}>
                                {formData.proofFile ? `✅ ${formData.proofFile.name}` : 'Click to upload or drag and drop'}
                            </p>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#9ca3af' }}>Upload certificates, degree, or recognition letters. (Max 5MB)</p>
                        </div>
                    </div>

                    <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.15rem', fontWeight: 'bold', borderRadius: '12px', background: isSubmitting ? '#4b5563' : 'linear-gradient(135deg, #646cff, #bc13fe)', boxShadow: isSubmitting ? 'none' : '0 10px 20px -5px rgba(100,108,255,0.4)', transition: 'all 0.3s ease', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
                        {isSubmitting ? '🚀 Submitting Application...' : '🚀 Submit Application'}
                    </button>
                </form>
            </div>
        </PageContainer>
    );
};

export default VerifierApplicationForm;