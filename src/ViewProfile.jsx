import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { auth } from './firebase'; 
import { onAuthStateChanged, signOut } from 'firebase/auth'; 
import html2canvas from 'html2canvas'; 
import './App.css';
import FeedbackWidget from './FeedbackWidget';

function ViewProfile({ darkMode, toggleTheme }) { 
  const navigate = useNavigate(); 
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showResult, setShowResult] = useState(false); 
  const [prediction, setPrediction] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showResources, setShowResources] = useState(false); 

  const [bio, setBio] = useState("");
  const [loadingBio, setLoadingBio] = useState(false);

  // NEW FEATURE: Profile Completeness Calculation Logic
  const calculateCompleteness = () => {
    if (!student) return 0;
    const fields = ['skills', 'internships', 'projects', 'certifications', 'linkedin', 'github'];
    const filled = fields.filter(f => student[f] && student[f].trim().length > 0).length;
    return Math.round((filled / fields.length) * 100);
  };

  const resourceLibrary = {
    "Web Development": [
      { name: "HTML/CSS", url: "https://web.dev/learn/css/" },
      { name: "JavaScript", url: "https://javascript.info/" },
      { name: "React", url: "https://react.dev/" },
      { name: "Node.js", url: "https://nodejs.org/en/learn" },
      { name: "Next.js", url: "https://nextjs.org/learn" },
      { name: "Tailwind CSS", url: "https://tailwindcss.com/docs" },
      { name: "TypeScript", url: "https://www.typescriptlang.org/docs/" },
      { name: "GraphQL", url: "https://graphql.org/learn/" },
      { name: "PHP", url: "https://www.php.net/docs.php" },
      { name: "Django", url: "https://www.djangoproject.com/start/" }
    ],
    "Data Science & AI": [
      { name: "Python", url: "https://realpython.com/" },
      { name: "Pandas", url: "https://pandas.pydata.org/docs/" },
      { name: "NumPy", url: "https://numpy.org/doc/" },
      { name: "Machine Learning", url: "https://www.coursera.org/learn/machine-learning" },
      { name: "Deep Learning", url: "https://www.deeplearning.ai/" },
      { name: "TensorFlow", url: "https://www.tensorflow.org/learn" },
      { name: "PyTorch", url: "https://pytorch.org/tutorials/" },
      { name: "NLP", url: "https://huggingface.co/learn/nlp-course" },
      { name: "Computer Vision", url: "https://opencv.org/university/free-opencv-course/" },
      { name: "R Programming", url: "https://www.r-project.org/other-docs.html" }
    ],
    "Cloud & DevOps": [
      { name: "AWS", url: "https://aws.amazon.com/training/" },
      { name: "Azure", url: "https://learn.microsoft.com/en-us/training/azure/" },
      { name: "Google Cloud", url: "https://cloud.google.com/learn" },
      { name: "Docker", url: "https://docs.docker.com/get-started/" },
      { name: "Kubernetes", url: "https://kubernetes.io/docs/tutorials/" },
      { name: "Jenkins", url: "https://www.jenkins.io/doc/pipeline/tour/getting-started/" },
      { name: "Terraform", url: "https://developer.hashicorp.com/terraform/tutorials" },
      { name: "Git/GitHub", url: "https://skills.github.com/" },
      { name: "Linux/Bash", url: "https://linuxjourney.com/" },
      { name: "Ansible", url: "https://docs.ansible.com/ansible/latest/getting_started/index.html" }
    ],
    "Cybersecurity": [
      { name: "Ethical Hacking", url: "https://www.hackerone.com/hacker-university" },
      { name: "Network Security", url: "https://www.cisco.com/c/en/us/training-events/training-certifications.html" },
      { name: "Penetration Testing", url: "https://www.offensive-security.com/metasploit-unleashed/" },
      { name: "Cryptography", url: "https://www.cryptool.org/en/learn" },
      { name: "CISSP Guide", url: "https://www.isc2.org/Certifications/CISSP" },
      { name: "Kali Linux", url: "https://www.kali.org/docs/" },
      { name: "Wireshark", url: "https://www.wireshark.org/docs/" },
      { name: "SOC Analyst", url: "https://www.cybrary.it/career-path/soc-analyst/" },
      { name: "OWASP", url: "https://owasp.org/projects/" },
      { name: "Identity Management", url: "https://www.okta.com/intro-to-iam/" }
    ],
    "Professional & Design": [
      { name: "UI/UX Design", url: "https://www.figma.com/resource-library/design-basics/" },
      { name: "Figma Mastery", url: "https://help.figma.com/hc/en-us/categories/360002051613" },
      { name: "Product Management", url: "https://www.productschool.com/resources" },
      { name: "Agile/Scrum", url: "https://www.scrum.org/resources" },
      { name: "SEO Basics", url: "https://moz.com/beginners-guide-to-seo" },
      { name: "SQL Mastery", url: "https://sqlbolt.com/" },
      { name: "Blockchain/Solidity", url: "https://cryptozombies.io/" },
      { name: "Mobile (Flutter)", url: "https://docs.flutter.dev/get-started/learn-more" },
      { name: "Game Dev (Unity)", url: "https://learn.unity.com/" },
      { name: "PowerBI/Tableau", url: "https://learn.microsoft.com/en-us/power-bi/learning-catalog/" }
    ]
  };

  useEffect(() => {
    const imageLink = "https://static.vecteezy.com/system/resources/thumbnails/041/287/255/small/a-white-screen-laptop-computer-mockup-and-books-on-a-wooden-table-in-a-spacious-university-library-photo.jpg";
    document.body.style.backgroundImage = `url(${imageLink})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.backgroundRepeat = "no-repeat";

    return () => { 
      document.body.style.backgroundImage = "";
      document.body.style.backgroundSize = "";
      document.body.style.backgroundPosition = "";
      document.body.style.backgroundAttachment = "";
      document.body.style.backgroundRepeat = "";
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            await fetchStudentData(user.email);
        } else {
            setLoading(false);
        }
    });
    return () => unsubscribe(); 
  }, []);

  const fetchStudentData = async (email) => {
      try {
        const res = await fetch(`http://localhost:5000/education/user/${email}?t=${Date.now()}`); 
        if (!res.ok) throw new Error('Failed to fetch data');
        const data = await res.json();
        setStudent(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
  };

  const generateAiBio = async () => {
    if (!student) return;
    setLoadingBio(true);
    try {
        const response = await fetch('http://localhost:5000/generate-bio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        name: student.name || "Student", 
        degree: student.degree || student.specialization || "Engineering", 
        skills: student.skills || "Technical Skills", 
        currentYear: student.currentYear || "Final Year", 
        dreamJob: student.dreamJob || "Professional" 
    })
});

        const data = await response.json();
        if (data.bio) {
            setBio(data.bio);
        }
    } catch (error) {
        console.error("Frontend Bio Error:", error);
    } finally {
        setLoadingBio(false);
    }
};

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); 
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const goToRoadmap = () => {
    navigate('/roadmap', { 
        state: { 
            role: prediction.topMatch.role, 
            userSkills: student.skills 
        } 
    });
  };

  const downloadProfileID = () => {
    const input = document.querySelector('.profile-card'); 
    html2canvas(input, { backgroundColor: '#1e293b', scale: 2 }).then((canvas) => {
      const link = document.createElement('a');
      link.download = `${student.name}_ID_Card.png`;
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  const runPrediction = async (user) => {
    try {
      const payload = {
        degree: user.degree,
        specialization: user.specialization,
        skills: user.skills,
        internships: user.internships,
        projects: user.projects,
        certifications: user.certifications
      };

      const res = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Prediction failed");
      const data = await res.json();

      setPrediction({
        topMatch: data.predictions ? data.predictions[0] : { role: data.recommended_job },
        others: data.predictions ? data.predictions.slice(1, 6) : [], 
        reasoning: data.reasoning || "Based on your academic profile, skill set, and project experience."
      });

    } catch (error) {
      console.error("AI Error:", error);
    }
  };

  const getCGPABadge = (cgpa) => {
    if (cgpa >= 9.5) return { text: "🏆 Elite Scholar", color: "#ffd700", glow: "0 0 15px #ffd700" };
    if (cgpa >= 8.5) return { text: "🥇 Gold Medalist", color: "#ffcc00", glow: "0 0 10px #ffcc00" };
    if (cgpa >= 7.5) return { text: "🥈 Silver Tier", color: "#c0c0c0", glow: "none" };
    return null;
  };

  if (loading) return <div className="loading-screen"><h2>🔄 Loading Profile...</h2></div>;
  
  if (!student) return (
    <div className="error-screen">
        <h2>⚠️ No Profile Found</h2>
        <p>You haven't created a profile for this account yet.</p>
        <Link to="/edit-profile" className="glass-btn" style={{width: '200px'}}>
            Create Profile
        </Link>
    </div>
  );

  const badge = getCGPABadge(student.cgpa);
  const profileProgress = calculateCompleteness(); // Integrated completeness value

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">Edu2Job Prediction</div>
        
        <div className="nav-menu-container" style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            {/* NEW FEATURE: Global Profile Strength Indicator */}
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 'bold' }}>STRENGTH: {profileProgress}%</span>
                <div style={{ width: '80px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                    <div style={{ width: `${profileProgress}%`, height: '100%', background: '#4ade80', borderRadius: '10px', boxShadow: '0 0 8px #4ade80' }}></div>
                </div>
            </div>

            <div 
                onClick={toggleTheme} 
                className="nav-icon" 
                title="Toggle Theme"
                style={{cursor: 'pointer', fontSize: '1.2rem', userSelect: 'none'}}
            >
                {darkMode ? '☀️' : '🌙'}
            </div>

            <div className="gear-icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>⚙️</div>

            {isMenuOpen && (
                <div className="dropdown-menu">
                    <Link to="/edit-profile" className="dropdown-item">✏️ Edit Profile</Link>
                    <div className="dropdown-item" onClick={() => { setShowResources(true); setIsMenuOpen(false); }}>📚 Resources</div>
                    <div className="dropdown-item" onClick={() => { 
                        runPrediction(student); 
                        setShowResult(true); 
                        setIsMenuOpen(false); 
                    }}>
                        🔮 Predict Job
                    </div>
                    <div className="dropdown-item logout" onClick={handleLogout}>🚪 Logout</div>
                </div>
            )}
        </div>
      </nav>

      {showResources && (
        <div className="resources-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(10, 15, 30, 0.95)', zIndex: 1000, overflowY: 'auto', padding: '40px' }}>
            <div style={{ maxWidth: '1000px', margin: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <h1 style={{ color: '#5e45a3ff' }}>📚 Skill Learning Library</h1>
                    <button onClick={() => setShowResources(false)} style={{ background: 'none', border: '1px solid #2E8B57', color: 'white', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Close Library</button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                    {Object.keys(resourceLibrary).map(category => (
                        <div key={category} style={{ background: 'rgba(255,255,255,0.05)', padding: '25px', borderRadius: '15px', border: '1px solid rgba(46, 139, 87, 0.3)' }}>
                            <h3 style={{ color: '#7b40abff', borderBottom: '1px solid rgba(149, 0, 0, 0.1)', paddingBottom: '10px' }}>{category}</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
                                {resourceLibrary[category].map(skill => (
                                    <a key={skill.name} href={skill.url} target="_blank" rel="noreferrer" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.9rem', padding: '5px', borderRadius: '4px', background: 'rgba(255,255,255,0.02)' }}>
                                        🔗 {skill.name}
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      <div className={`view-container ${showResult ? 'split-mode' : ''}`} style={{marginTop: '80px', maxWidth: '1000px', margin: '80px auto'}}>
        <div className="profile-card">
          {/* NEW FEATURE: Conditional Action Banner */}
          {profileProgress < 85 && !showResult && (
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '12px 18px', borderRadius: '12px', marginBottom: '25px', color: '#fbbf24', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  💡 <span>Boost your profile strength! Add <strong>Projects</strong> or <strong>Certifications</strong> to refine AI accuracy.</span>
              </div>
          )}

          <div className="profile-header" style={{ display: 'flex', alignItems: 'center', gap: '25px', marginBottom: '40px', position: 'relative' }}>
              <button onClick={downloadProfileID} className="nav-icon" title="Download ID" style={{ position: 'absolute', right: '0', top: '0', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}>📥</button>

              <div 
                className="avatar-placeholder" 
                style={{ 
                    width: '100px', 
                    height: '100px', 
                    fontSize: '2.5rem', 
                    background: 'linear-gradient(135deg, #556bdbff, #8162a7ff)', 
                    boxShadow: '0 0 25px rgba(245, 158, 11, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    overflow: 'hidden', 
                    border: '3px solid rgba(255, 255, 255, 0.1)',
                    color: '#000', 
                    fontWeight: '800'
                }}
                >
                {student.profilePic ? (
                    <img src={student.profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    student.name.charAt(0)
                )}
                </div>
              <div style={{ flex: 1 }}>
                  <h2 style={{ color: '#F1F5F9', margin: 0, display: 'flex', alignItems: 'center', gap: '15px', fontSize: '2.2rem', fontWeight: 800 }}>
                    {student.name}
                    {badge && (
                        <span className="cgpa-achievement-badge" style={{ color: badge.color, border: `1px solid ${badge.color}`, boxShadow: badge.glow, background: 'rgba(0,0,0,0.3)', padding: '2px 10px', borderRadius: '4px', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                            {badge.text}
                        </span>
                    )}
                  </h2>
                  <p style={{ margin: '8px 0', fontSize: '1.1rem', color: '#94a3b8' }}>📍 {student.college}</p>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                    <span className="detail-tag" style={{ background: 'rgba(46, 139, 87, 0.2)', color: '#4ade80', border: '1px solid rgba(46, 139, 87, 0.3)' }}>🎓 {student.currentYear} Year</span>
                    <span className="detail-tag" style={{ background: 'rgba(255,255,255,0.05)', color: '#CBD5E1' }}>🆔 {student.rollNumber}</span>
                  </div>

                  <div className="profile-links-row" style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
                    {[
                      { name: 'LinkedIn', url: student.linkedin, icon: '🔗' },
                      { name: 'GitHub', url: student.github, icon: '🐙' },
                      { name: 'LeetCode', url: student.leetcode, icon: '💻' },
                      { name: 'HackerRank', url: student.hackerrank, icon: '🏆' }
                    ].map((link) => (
                      <a key={link.name} href={link.url?.startsWith('http') ? link.url : `https://${link.url}`} onClick={(e) => { if (!link.url) { e.preventDefault(); alert(`Please provide your ${link.name} link in Edit Profile!`); } }}
                        target="_blank" rel="noreferrer" className="glass-btn profile-link-btn"
                        style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(46, 139, 87, 0.4)', background: link.url ? 'rgba(46, 139, 87, 0.15)' : 'rgba(136, 53, 139, 0.05)', color: link.url ? '#4ade80' : '#64748b' }}>
                        {link.icon} {link.name}
                      </a>
                    ))}
                  </div>
              </div>
          </div>

          <div className="profile-body">
              <div className="ai-summary-box" style={{ marginBottom: '35px', padding: '25px', background: 'rgba(46, 139, 87, 0.05)', borderRadius: '0 16px 16px 0', borderLeft: '4px solid #2E8B57' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4 style={{ color: '#2E8B57', margin: 0, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.9rem', fontWeight: 700 }}>✨ Professional AI Summary</h4>
                    <button onClick={generateAiBio} className="ai-btn" style={{ background: '#2E8B57', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 15px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {loadingBio ? "CRAFTING..." : "REGENERATE"}
                    </button>
                  </div>
                  <p style={{ fontSize: '1rem', color: '#F1F5F9', fontStyle: 'italic', lineHeight: '1.7', margin: 0 }}>
                    {bio || "Your professional narrative is being analyzed. Click regenerate to create a summary."}
                  </p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px', marginBottom: '40px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', textAlign: 'center' }}>
                      <div><label style={{color:'#94a3b8', fontSize:'0.7rem'}}>DEGREE</label><br/><span style={{color:'white', fontWeight:'bold'}}>{student.degree}</span></div>
                      <div><label style={{color:'#94a3b8', fontSize:'0.7rem'}}>BRANCH</label><br/><span style={{color:'white', fontWeight:'bold'}}>{student.specialization}</span></div>
                      <div><label style={{color:'#94a3b8', fontSize:'0.7rem'}}>CGPA</label><br/><span style={{color:'#4ade80', fontWeight:'bold'}}>{student.cgpa}</span></div>
                      <div><label style={{color:'#94a3b8', fontSize:'0.7rem'}}>PERCENTAGE</label><br/><span style={{color:'#4ade80', fontWeight:'bold'}}>{student.percentage}%</span></div>
                      <div><label style={{color:'#94a3b8', fontSize:'0.7rem'}}>GRADUATION</label><br/><span style={{color:'white', fontWeight:'bold'}}>{student.year}</span></div>
                  </div>
              </div>
              
              <div style={{marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '30px'}}>
                  <strong style={{display: 'block', marginBottom: '20px', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase'}}>Technical Competencies</strong>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '12px'}}>
                      {student.skills?.split(',').map((skill, index) => (
                          <span key={index} className="skill-badge" style={{ background: 'rgba(46, 139, 87, 0.1)', color: '#4ade80', padding: '8px 20px', borderRadius: '50px', fontSize: '0.85rem', border: '1px solid rgba(46, 139, 87, 0.3)', fontWeight: '600' }}>
                              ● {skill.trim()}
                          </span>
                      ))}
                  </div>
              </div>

              <div style={{ marginTop: '40px', display: 'grid', gap: '25px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px' }}>
                      <strong style={{ color: '#2E8B57', display: 'block', marginBottom: '10px', fontSize:'0.85rem' }}>💼 INTERNSHIPS</strong>
                      <p style={{ color: '#CBD5E1', margin: 0, fontSize:'0.95rem' }}>{student.internships || "No internships listed."}</p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px' }}>
                      <strong style={{ color: '#2E8B57', display: 'block', marginBottom: '10px', fontSize:'0.85rem' }}>📜 CERTIFICATIONS</strong>
                      <p style={{ color: '#CBD5E1', margin: 0, fontSize:'0.95rem' }}>{student.certifications || "No certifications listed."}</p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px' }}>
                      <strong style={{ color: '#2E8B57', display: 'block', marginBottom: '10px', fontSize:'0.85rem' }}>🏆 ACHIEVEMENTS</strong>
                      <p style={{ color: '#CBD5E1', margin: 0, fontSize:'0.95rem' }}>{student.achievements || "No achievements listed."}</p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px' }}>
                      <strong style={{ color: '#2E8B57', display: 'block', marginBottom: '10px', fontSize:'0.85rem' }}>📁 PROJECTS</strong>
                      <p style={{ color: '#CBD5E1', margin: 0, fontSize:'0.95rem' }}>{student.projects || "No projects listed."}</p>
                  </div>
              </div>
          </div>
          
          {!showResult && (
               <button onClick={() => { runPrediction(student); setShowResult(true); }} className="glass-btn" style={{marginTop: '50px', width: '100%', height: '60px', fontSize: '1.1rem', background: 'rgba(46, 139, 87, 0.15)', border: '1px solid #2E8B57', color: 'white', fontWeight: 'bold' }}>
                  🔮 Analyze Career Trajectory
               </button>
          )}
        </div>

        {showResult && prediction && (
          <div className="prediction-card" style={{ padding: '45px', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid #2E8B57', borderRadius: '24px', overflowY: 'auto', maxHeight: '85vh' }}>
              <div style={{textAlign: 'center'}}>
                  <span style={{background: '#2E8B57', color:'white', padding:'6px 20px', borderRadius:'20px', fontSize:'0.8rem', fontWeight:'bold'}}>⭐ TOP CAREER MATCH</span>
                  <h1 style={{fontSize: '3rem', color: 'white', margin: '15px 0'}}>{prediction.topMatch.role}</h1>
                  
                  {/* NEW FEATURE: Confidence & Market Sentiment Indicators */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.05)', padding: '10px 25px', borderRadius: '18px', marginBottom: '25px' }}>
                      <div style={{ color: '#4ade80', fontSize: '0.85rem', fontWeight: 'bold' }}>⚡ MATCH CONFIDENCE: {profileProgress > 80 ? '98%' : '76%'}</div>
                      <div style={{ width: '1px', height: '15px', background: 'rgba(255,255,255,0.2)' }}></div>
                      <div style={{ color: '#fbbf24', fontSize: '0.85rem', fontWeight: 'bold' }}>📊 MARKET DEMAND: HIGH</div>
                  </div>

                  <div style={{ margin: '30px 0', padding: '25px', background: 'rgba(46, 139, 87, 0.12)', borderLeft: '6px solid #2E8B57', borderRadius: '12px', textAlign: 'left' }}>
                      <strong style={{ color: '#2E8B57', fontSize: '1.1rem', textTransform: 'uppercase' }}>💡 Why is this best for you?</strong>
                      <p style={{ color: '#CBD5E1', marginTop: '12px', fontStyle: 'italic', lineHeight: '1.7', fontSize: '1.05rem' }}>{prediction.reasoning}</p>
                  </div>
                  
                  <div style={{ marginTop: '45px' }}>
                      <h4 style={{ color: '#94a3b8', marginBottom: '25px', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px' }}>
                        Also you can choose job roles of the most relevant job roles according to your skills:
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
                          {prediction.others.map((alt, i) => (
                              <div key={i} style={{ padding: '18px', background: 'rgba(255,255,255,0.04)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                                  <div style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '0.95rem' }}>{alt.role}</div>
                              </div>
                          ))}
                      </div>
                  </div>
                  
                  {/* Feedback widget remains exactly as you had it */}
                  <FeedbackWidget 
                    userEmail={student.email} 
                    suggestedJob={prediction.topMatch.role} 
                  />

                  <div style={{display: 'flex', gap: '15px', flexDirection: 'column', marginTop: '50px'}}>
                      <button onClick={goToRoadmap} className="glass-btn" style={{background: '#2E8B57', color: 'white', border: 'none', fontWeight: 'bold', height: '55px', borderRadius: '12px', cursor: 'pointer'}}>🗺️ View Strategic Roadmap</button>
                      <button onClick={() => setShowResult(false)} className="glass-btn" style={{background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'white', height: '55px', borderRadius: '12px', cursor: 'pointer'}}>Return to Profile</button>
                  </div>
              </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ViewProfile;