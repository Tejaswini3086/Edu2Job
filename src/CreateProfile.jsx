import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase'; 
import { onAuthStateChanged } from 'firebase/auth';
import './App.css'; 

// --- LIST OF JOB ROLES FOR DROPDOWN ---
const JOB_ROLES = [
  "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Data Scientist", "Data Analyst", "AI Engineer", "Big Data Engineer",
  "DevOps Engineer", "Cloud Engineer", "Cyber Security Analyst", "Network Engineer",
  "Mobile App Developer", "Game Developer", "Blockchain Developer",
  "UI/UX Designer", "Graphic Designer", "Video Editor", "Product Manager",
  "Digital Marketer", "SEO Specialist", "Content Writer",
  "Embedded Systems Engineer", "Robotics Engineer", "AR/VR Developer",
  "Database Administrator", "System Administrator", "IT Support Specialist",
  "Sales Engineer", "Ethical Hacker"
];

function CreateProfile() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '', rollNumber: '', college: '', currentYear: '',
    degree: '', specialization: '', cgpa: '', year: '',
    skills: '', internships: '', interests: '', 
    dreamJob: '', // Now selected from dropdown
    certifications: '', percentage: ''
  });

  // Check Login & Load Existing Data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            setUserEmail(user.email);
            fetchExistingProfile(user.email);
        } else {
            navigate('/login');
        }
    });
    return () => unsubscribe();
  }, []);

  const fetchExistingProfile = async (email) => {
      try {
          const res = await fetch(`http://localhost:5000/education/user/${email}`);
          if (res.ok) {
              const data = await res.json();
              setFormData(prev => ({ ...prev, ...data }));
          }
      } catch (err) {
          console.log("No existing profile found, creating new.");
      }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Resume Upload Logic
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const data = new FormData();
    data.append('resume', file);

    try {
        const res = await fetch('http://localhost:5000/upload-resume', {
            method: 'POST',
            body: data
        });
        const result = await res.json();
        
        if (result.skills) {
            setFormData(prev => ({ 
                ...prev, 
                skills: result.skills
            }));
            alert("✅ AI extracted skills from your Resume!");
        }
    } catch (error) {
        console.error("Resume Error:", error);
        alert("Failed to read resume.");
    } finally {
        setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, email: userEmail };
      
      const res = await fetch('http://localhost:5000/education/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to save');
      }

      alert('Profile Saved Successfully! 🚀');
      navigate('/profile'); 

    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="view-container" style={{justifyContent: 'center', paddingTop: '40px'}}>
      <div className="profile-card" style={{width: '90%', maxWidth: '800px', padding: '30px'}}>
        
        <h2 style={{color: 'white', textAlign: 'center', marginBottom: '20px'}}>📝 Edit Your Profile</h2>
        
        {/* RESUME UPLOAD SECTION */}
        <div style={{background: 'rgba(74, 222, 128, 0.1)', padding: '20px', borderRadius: '10px', marginBottom: '30px', border: '1px dashed #4ade80'}}>
            <label style={{display:'block', marginBottom:'10px', color: '#4ade80', fontWeight: 'bold', fontSize: '1.1rem'}}>
                📄 Step 1: Auto-Fill with Resume (Optional)
            </label>
            <input type="file" accept=".pdf" onChange={handleResumeUpload} style={{color: 'white'}} />
            {loading && <span style={{marginLeft: '10px', color: '#f59e0b'}}>🔄 Analyzing PDF...</span>}
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
            <h3 style={{color: '#ccc', borderBottom: '1px solid #444', paddingBottom: '10px', marginBottom: '20px'}}>
                Personal Details
            </h3>

            <div className="form-grid">
                <div className="form-group">
                    <label className="input-label">Full Name</label>
                    <input name="name" placeholder="Ex: Boda Tejaswini" value={formData.name} onChange={handleChange} required />
                </div>
                
                <div className="form-group">
                    <label className="input-label">Roll Number</label>
                    <input name="rollNumber" placeholder="Ex: 23A31A0571" value={formData.rollNumber} onChange={handleChange} required />
                </div>
                
                <div className="form-group">
                    <label className="input-label">College Name</label>
                    <input name="college" placeholder="Ex: Pragati Engineering College" value={formData.college} onChange={handleChange} required />
                </div>
                
                <div className="form-group">
                    <label className="input-label">Current Year</label>
                    <input name="currentYear" placeholder="Ex: 3rd" value={formData.currentYear} onChange={handleChange} required />
                </div>
            </div>

            <h3 style={{color: '#ccc', borderBottom: '1px solid #444', paddingBottom: '10px', marginTop: '30px', marginBottom: '20px'}}>
                Academic Details
            </h3>

            <div className="form-grid">
                <div className="form-group">
                    <label className="input-label">Degree</label>
                    <input name="degree" placeholder="Ex: B.Tech" value={formData.degree} onChange={handleChange} required />
                </div>
                
                <div className="form-group">
                    <label className="input-label">Specialization (Branch)</label>
                    <input name="specialization" placeholder="Ex: CSE" value={formData.specialization} onChange={handleChange} required />
                </div>
                
                <div className="form-group">
                    <label className="input-label">CGPA</label>
                    <input name="cgpa" type="number" step="0.1" placeholder="Ex: 8.5" value={formData.cgpa} onChange={handleChange} required />
                </div>
                
                <div className="form-group">
                    <label className="input-label">Graduation Year</label>
                    <input name="year" type="number" placeholder="Ex: 2025" value={formData.year} onChange={handleChange} required />
                </div>
            </div>

            <h3 style={{color: '#ccc', borderBottom: '1px solid #444', paddingBottom: '10px', marginTop: '30px', marginBottom: '20px'}}>
                Skills & Ambitions
            </h3>

            <div className="form-group" style={{marginBottom: '20px'}}>
                <label className="input-label">Technical Skills (Comma separated)</label>
                <textarea name="skills" placeholder="Java, Python, React, SQL..." value={formData.skills} onChange={handleChange} className="full-width" rows="3" />
            </div>
            
            <div className="form-group" style={{marginBottom: '20px'}}>
                <label className="input-label">Internships / Experience</label>
                <textarea name="internships" placeholder="Ex: Web Developer Intern at Amazon..." value={formData.internships} onChange={handleChange} className="full-width" rows="2" />
            </div>
            
            <div className="form-group" style={{marginBottom: '20px'}}>
                <label className="input-label">Interests / Hobbies</label>
                <textarea name="interests" placeholder="Coding, Reading, Chess..." value={formData.interests} onChange={handleChange} className="full-width" rows="2" />
            </div>

            {/* --- NEW DROPDOWN FOR DREAM JOB --- */}
            <div className="form-group" style={{marginBottom: '30px'}}>
                <label className="input-label" style={{color: '#f59e0b'}}>⭐ Dream Job Goal (Scroll to Select)</label>
                <select 
                    name="dreamJob" 
                    value={formData.dreamJob} 
                    onChange={handleChange} 
                    className="full-width"
                    style={{
                        padding: '12px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid #555',
                        borderRadius: '5px',
                        color: 'white',
                        fontSize: '1rem',
                        cursor: 'pointer'
                    }}
                >
                    <option value="" disabled>-- Select Your Target Role --</option>
                    {JOB_ROLES.map((role, index) => (
                        <option key={index} value={role} style={{color: 'black'}}>
                            {role}
                        </option>
                    ))}
                </select>
            </div>

            <button type="submit" className="glass-btn" style={{width: '100%', padding: '15px', fontSize: '1.2rem', fontWeight: 'bold'}}>
                💾 Save Profile Changes
            </button>
        </form>
      </div>
    </div>
  );
}

export default CreateProfile;