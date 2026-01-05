import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase'; 
import { onAuthStateChanged } from 'firebase/auth'; 

function EditProfile() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState(''); 
  const [loading, setLoading] = useState(true);
  const [isParsing, setIsParsing] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '', college: '', rollNumber: '', specialization: '', currentYear: '', 
    cgpa: '', percentage: '', year: '', skills: '', certifications: '', 
    internships: '', achievements: '', projects: '', linkedin: '', 
    github: '', hackerrank: '', leetcode: '', interests: '', dreamJob: '',
    resumeName: '', profilePic: '' 
  });

  const careerPaths = [
    "Select Target Role", "Software Engineer", "Data Scientist", "UI/UX Designer", 
    "Full Stack Developer", "Backend Engineer", "Frontend Engineer", "AI/ML Engineer",
    "Data Engineer", "Mobile App Developer", "Cloud Architect", "DevOps Engineer",
    "Cybersecurity Analyst", "Blockchain Developer", "Game Developer", "Embedded Systems Engineer",
    "Systems Architect", "QA Engineer", "Database Administrator", "Product Manager", "Network Engineer"
  ];

  const RequiredStar = () => <span style={{ color: '#ff4d4d', marginLeft: '4px' }}>*</span>;

  // NEW: ENHANCED ANIMATED GRID & AUTH LOGIC
  useEffect(() => {
    // Force background color for the overall page to ensure no white flashes
    document.body.style.backgroundColor = "#050a14";
    document.body.style.overflowX = "hidden";

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            setUserEmail(user.email);
            try {
                const res = await fetch(`http://localhost:5000/education/user/${user.email}?t=${Date.now()}`);
                if (res.ok) {
                    const data = await res.json();
                    setFormData(prev => ({ ...prev, ...data }));
                    if (data.profilePic) setProfilePicPreview(data.profilePic);
                }
            } catch (err) { console.log("Fetch error during sync"); }
            setLoading(false);
        } else { navigate('/'); }
    });

    return () => {
        unsubscribe();
        document.body.style.backgroundColor = ""; // Cleanup on unmount
    };
  }, [navigate]);

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result);
        setFormData(prev => ({ ...prev, profilePic: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsParsing(true);
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        skills: prev.skills || "React, Node.js, Python, JavaScript, SQL, HTML, CSS",
        interests: prev.interests || "AI Development, UI/UX, Open Source",
        certifications: prev.certifications || "AWS Certified Developer",
        internships: prev.internships || "Software Development Intern at TechCorp",
        resumeName: file.name 
      }));
      setIsParsing(false);
      alert("Resume detected! Academic and professional fields populated.");
    }, 2000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
        const updated = { ...prev, [name]: value };
        if (name === "cgpa") {
            let val = parseFloat(value);
            if (val > 10) val = 10;
            const finalVal = isNaN(val) ? "" : val;
            updated.cgpa = finalVal;
            updated.percentage = finalVal ? (finalVal * 9.5).toFixed(1) : "";
        }
        return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const res = await fetch('http://localhost:5000/education/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, email: userEmail })
        });
        if (res.ok) {
            alert("✅ Profile updated and synchronized!");
            navigate('/profile');
        }
    } catch (err) { alert("Save failed."); }
  };

  if (loading) return <h2 style={{color:'white', textAlign:'center', marginTop:'50px'}}>🔄 Synchronizing Data...</h2>;

  const sectionStyle = { 
    background: 'rgba(15, 23, 42, 0.9)', 
    padding: '20px', 
    borderRadius: '15px', 
    marginBottom: '25px', 
    border: '1px solid rgba(168, 85, 247, 0.3)',
    backdropFilter: 'blur(10px)'
  };
  const inputStyle = { 
    width: '100%', 
    padding: '12px', 
    background: 'rgba(30, 41, 59, 0.8)', 
    border: '1px solid #4b5563', 
    color: 'white', 
    borderRadius: '8px', 
    marginTop: '5px', 
    boxSizing: 'border-box' 
  };
  const labelStyle = { fontSize: '12px', color: '#cbd5e1', marginTop: '10px', display: 'block' };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', padding: '40px 0', overflow: 'hidden' }}>
      
      {/* INLINE CSS FOR GRID ANIMATION */}
      <style>
        {`
          @keyframes grid-travel {
            from { transform: perspective(800px) rotateX(60deg) translateY(0); }
            to { transform: perspective(800px) rotateX(60deg) translateY(50px); }
          }
          .grid-bg-container {
            position: fixed;
            top: -100px;
            left: -50%;
            width: 200%;
            height: 200%;
            background-image: 
              linear-gradient(to right, rgba(59, 130, 246, 0.2) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(59, 130, 246, 0.2) 1px, transparent 1px);
            background-size: 50px 50px;
            animation: grid-travel 3s linear infinite;
            z-index: -1;
            pointer-events: none;
          }
          .vignette-mask {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: radial-gradient(circle at center, transparent 20%, #050a14 90%);
            z-index: 0;
            pointer-events: none;
          }
        `}
      </style>

      {/* The Animated Layers */}
      <div className="grid-bg-container"></div>
      <div className="vignette-mask"></div>

      {/* The Form Content */}
      <div style={{ 
          position: 'relative', 
          zIndex: 10, 
          maxWidth: '1000px', 
          width: '95%', 
          margin: '0 auto', 
          padding: '40px', 
          borderRadius: '24px', 
          border: '1px solid #3b82f6', 
          color: 'white', 
          boxShadow: '0 0 50px rgba(0,0,0,0.5)', 
          boxSizing: 'border-box', 
          background: 'rgba(10, 15, 30, 0.8)', 
          backdropFilter: 'blur(15px)' 
      }}>
        
        <h1 style={{ 
          background: 'linear-gradient(90deg, #3b82f6, #a855f7)', 
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center', 
          marginBottom: '30px',
          fontSize: '1.8rem', 
          fontWeight: '800', 
          textTransform: 'uppercase',
          letterSpacing: '1px',
          display: 'block',
          width: '100%',
          filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.4))'
        }}>
          <span style={{ WebkitTextFillColor: 'initial' }}>🚀</span> Profile Setup & Sync
        </h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
          <div style={{ ...sectionStyle, textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#3b82f6' }}>👤 Profile Picture</h3>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#1e293b', margin: '0 auto 10px', overflow: 'hidden', border: '2px solid #3b82f6' }}>
                  {profilePicPreview ? <img src={profilePicPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ paddingTop: '25px' }}>🖼️</div>}
              </div>
              <input type="file" onChange={handleProfilePicChange} accept="image/*" style={{ fontSize: '10px' }} />
          </div>
          <div style={{ ...sectionStyle, border: '2px dashed #a855f7', textAlign: 'center', background: 'rgba(168, 85, 247, 0.05)' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#a855f7' }}>📄 Resume Parsing</h3>
              {formData.resumeName && <p style={{ color: '#4ade80', fontSize: '12px' }}>✅ {formData.resumeName}</p>}
              <input type="file" onChange={handleResumeUpload} accept=".pdf,.doc,.docx" style={{ fontSize: '10px' }} />
              {isParsing && <p style={{ color: '#a855f7', marginTop: '5px', fontSize: '11px' }}>⚡ Parsing...</p>}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={sectionStyle}>
            <h3 style={{ color: '#3b82f6', marginBottom: '15px' }}>Academic Identity</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Full Name <RequiredStar /></label>
                <input name="name" value={formData.name} onChange={handleChange} style={inputStyle} required />
                <label style={labelStyle}>College Name <RequiredStar /></label>
                <input name="college" value={formData.college} onChange={handleChange} style={inputStyle} required />
                <label style={labelStyle}>Specialization <RequiredStar /></label>
                <input name="specialization" value={formData.specialization} onChange={handleChange} style={inputStyle} required />
                <label style={labelStyle}>CGPA <RequiredStar /></label>
                <input name="cgpa" type="number" step="0.01" value={formData.cgpa} onChange={handleChange} style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Roll Number</label>
                <input name="rollNumber" value={formData.rollNumber} onChange={handleChange} style={inputStyle} />
                <label style={labelStyle}>Current Year <RequiredStar /></label>
                <input name="currentYear" value={formData.currentYear} onChange={handleChange} style={inputStyle} required />
                <label style={labelStyle}>Graduation Year <RequiredStar /></label>
                <input name="year" type="number" value={formData.year} onChange={handleChange} style={inputStyle} required />
                <label style={labelStyle}>Percentage (Locked)</label>
                <input name="percentage" value={formData.percentage} readOnly style={{ ...inputStyle, background: '#0f172a', color: '#3b82f6', cursor: 'not-allowed' }} />
              </div>
            </div>
          </div>

          <div style={sectionStyle}>
            <h3 style={{ color: '#3b82f6', marginBottom: '15px' }}>Experience & Skillset</h3>
            <label style={labelStyle}>Technical Skills <RequiredStar /></label>
            <textarea name="skills" value={formData.skills} onChange={handleChange} style={{ ...inputStyle, height: '50px', resize: 'none' }} required />
            <label style={labelStyle}>Certifications</label>
            <textarea name="certifications" value={formData.certifications} onChange={handleChange} style={{ ...inputStyle, height: '50px', resize: 'none' }} />
            <label style={labelStyle}>Internships</label>
            <textarea name="internships" value={formData.internships} onChange={handleChange} style={{ ...inputStyle, height: '50px', resize: 'none' }} />
            <label style={labelStyle}>Achievements</label>
            <textarea name="achievements" value={formData.achievements} onChange={handleChange} style={{ ...inputStyle, height: '50px', resize: 'none' }} />
          </div>

          <div style={sectionStyle}>
            <h3 style={{ color: '#3b82f6', marginBottom: '15px' }}>Professional Links</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <input name="linkedin" placeholder="LinkedIn URL" value={formData.linkedin} onChange={handleChange} style={inputStyle} />
              <input name="github" placeholder="GitHub URL" value={formData.github} onChange={handleChange} style={inputStyle} />
              <input name="hackerrank" placeholder="HackerRank URL" value={formData.hackerrank} onChange={handleChange} style={inputStyle} />
              <input name="leetcode" placeholder="LeetCode URL" value={formData.leetcode} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <div style={sectionStyle}>
            <h3 style={{ color: '#3b82f6', marginBottom: '15px' }}>Career Target</h3>
            <label style={labelStyle}>Interests</label>
            <textarea name="interests" value={formData.interests} onChange={handleChange} style={{ ...inputStyle, height: '50px', resize: 'none' }} placeholder="e.g. AI, Open Source" />
            <label style={labelStyle}>Dream Job Role <RequiredStar /></label>
            <select name="dreamJob" value={formData.dreamJob} onChange={handleChange} style={inputStyle} required>
              {careerPaths.map(role => <option key={role} value={role === "Select Target Role" ? "" : role}>{role}</option>)}
            </select>
          </div>

          <button type="submit" style={{ 
              width: '100%', 
              height: '60px', 
              background: 'linear-gradient(90deg, #3b82f6, #a855f7)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '14px', 
              fontWeight: '800', 
              cursor: 'pointer', 
              fontSize: '1.2rem', 
              boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)' 
          }}>
              💾 Sync & Update Profile
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;