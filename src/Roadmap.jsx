import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './App.css'; 

// --- 1. THE MASSIVE SKILL DATABASE (30+ ROLES) ---
const JOB_REQUIREMENTS = {
  // === SOFTWARE DEVELOPMENT ===
  "Software Engineer": { 
      req: ["Java", "C++", "DSA", "SQL", "System Design", "Git"], 
      steps: [
          {t:"Master DSA", d:"Learn Arrays, Trees, Graphs, and Dynamic Programming.", l:"https://leetcode.com/problemset/all/"}, 
          {t:"System Design", d:"Understand Scalability, Load Balancing, and Caching.", l:"https://github.com/donnemartin/system-design-primer"}, 
          {t:"Version Control", d:"Master Git commands and GitHub workflows.", l:"https://git-scm.com/doc"}
      ] 
  },
  "Frontend Developer": { 
      req: ["HTML", "CSS", "JavaScript", "React", "Redux", "Git"], 
      steps: [
          {t:"Advanced JS", d:"Closures, Event Loop, Async/Await.", l:"https://javascript.info/"}, 
          {t:"React Ecosystem", d:"Hooks, Context API, and Redux Toolkit.", l:"https://react.dev/learn"}, 
          {t:"CSS Frameworks", d:"Tailwind CSS or Material UI.", l:"https://tailwindcss.com/"}
      ] 
  },
  "Backend Developer": { 
      req: ["Node.js", "Express", "MongoDB", "SQL", "API", "Docker"], 
      steps: [
          {t:"Build APIs", d:"RESTful services and GraphQL basics.", l:"https://restfulapi.net/"}, 
          {t:"Database Design", d:"Normalization and Schema design.", l:"https://sqlbolt.com/"}, 
          {t:"Containerization", d:"Dockerize your applications.", l:"https://www.docker.com/get-started"}
      ] 
  },
  "Full Stack Developer": {
      req: ["React", "Node.js", "MongoDB", "SQL", "Git", "DevOps"],
      steps: [
          {t:"Frontend Mastery", d:"React.js, Redux, and Responsive UI.", l:"https://fullstackopen.com/en/"},
          {t:"Backend Logic", d:"Express.js, Authentication (JWT), and DBs.", l:"https://www.theodinproject.com/"},
          {t:"Deployment", d:"CI/CD pipelines and Cloud hosting.", l:"https://vercel.com/docs"}
      ]
  },
  "Mobile App Developer": {
      req: ["Flutter", "React Native", "Swift", "Kotlin", "Firebase"],
      steps: [
          {t:"Choose Path", d:"Native (Kotlin/Swift) or Cross-Platform (Flutter).", l:"https://flutter.dev/learn"},
          {t:"State Management", d:"Provider, Riverpod, or Redux.", l:"https://docs.flutter.dev/data-and-backend/state-mgmt/intro"},
          {t:"Publishing", d:"Play Store and App Store guidelines.", l:"https://developer.android.com/distribute"}
      ]
  },
  "Game Developer": {
      req: ["C#", "C++", "Unity", "Unreal Engine", "Math", "Physics"],
      steps: [
          {t:"Game Engines", d:"Master Unity (C#) or Unreal (C++).", l:"https://learn.unity.com/"},
          {t:"3D Math", d:"Vectors, Quaternions, and Physics.", l:"https://gamemath.com/"},
          {t:"Game Design", d:"Level design, lighting, and mechanics.", l:"https://www.gamedesigning.org/"}
      ]
  },

  // === DATA & AI ===
  "Data Scientist": { 
      req: ["Python", "Pandas", "NumPy", "SQL", "Machine Learning", "Statistics"], 
      steps: [
          {t:"Data Wrangling", d:"Clean and manipulate data with Pandas.", l:"https://pandas.pydata.org/docs/"}, 
          {t:"ML Algorithms", d:"Regression, Classification, Clustering.", l:"https://scikit-learn.org/stable/tutorial/"}, 
          {t:"Math Foundations", d:"Linear Algebra and Probability.", l:"https://www.khanacademy.org/math/statistics-probability"}
      ] 
  },
  "Data Analyst": {
      req: ["Excel", "SQL", "Tableau", "PowerBI", "Python", "Statistics"],
      steps: [
          {t:"Advanced Excel", d:"Pivot Tables, VLOOKUP, Macros.", l:"https://excelexposure.com/"},
          {t:"SQL Mastery", d:"Joins, Aggregations, Window Functions.", l:"https://mode.com/sql-tutorial/"},
          {t:"Visualization", d:"Dashboard creation in Tableau/PowerBI.", l:"https://public.tableau.com/en-us/s/"}
      ]
  },
  "AI Engineer": {
      req: ["Python", "TensorFlow", "PyTorch", "NLP", "Deep Learning", "Math"],
      steps: [
          {t:"Neural Networks", d:"CNNs, RNNs, and Transformers.", l:"https://www.deeplearning.ai/"},
          {t:"Frameworks", d:"Build models with PyTorch or TensorFlow.", l:"https://pytorch.org/tutorials/"},
          {t:"Deployment", d:"Model serving with FastAPI or Docker.", l:"https://www.tensorflow.org/tfx"}
      ]
  },
  "Big Data Engineer": {
      req: ["Hadoop", "Spark", "Scala", "Kafka", "SQL", "AWS"],
      steps: [
          {t:"Big Data Ecosystem", d:"HDFS, MapReduce, and Hive.", l:"https://hadoop.apache.org/"},
          {t:"Stream Processing", d:"Apache Spark and Kafka.", l:"https://spark.apache.org/"},
          {t:"Data Warehousing", d:"Snowflake or Redshift.", l:"https://docs.snowflake.com/"}
      ]
  },

  // === INFRASTRUCTURE & CLOUD ===
  "DevOps Engineer": {
      req: ["Linux", "Docker", "Kubernetes", "Jenkins", "AWS", "Python"],
      steps: [
          {t:"Containerization", d:"Docker and Kubernetes orchestration.", l:"https://kubernetes.io/docs/tutorials/"},
          {t:"CI/CD", d:"Automated pipelines with Jenkins/GitHub Actions.", l:"https://www.jenkins.io/doc/"},
          {t:"Infrastructure as Code", d:"Terraform or Ansible.", l:"https://www.terraform.io/"}
      ]
  },
  "Cloud Engineer": {
      req: ["AWS", "Azure", "Linux", "Networking", "Terraform", "Security"],
      steps: [
          {t:"Cloud Certification", d:"AWS Solutions Architect or Azure Admin.", l:"https://aws.amazon.com/certification/"},
          {t:"Networking", d:"VPCs, Subnets, DNS, Load Balancers.", l:"https://docs.aws.amazon.com/vpc/"},
          {t:"Serverless", d:"Lambda functions and API Gateway.", l:"https://serverless.com/"}
      ]
  },
  "Cyber Security Analyst": {
      req: ["Networking", "Linux", "Python", "Ethical Hacking", "Firewalls"],
      steps: [
          {t:"Networking", d:"OSI Model, TCP/IP, Subnetting.", l:"https://www.comptia.org/certifications/network"},
          {t:"Linux Skills", d:"Kali Linux command line mastery.", l:"https://linuxjourney.com/"},
          {t:"Penetration Testing", d:"Learn to use Metasploit and Burp Suite.", l:"https://portswigger.net/web-security"}
      ]
  },
  "Network Engineer": {
      req: ["CCNA", "Networking", "Routing", "Switching", "Linux", "Python"],
      steps: [
          {t:"CCNA Prep", d:"Cisco Certified Network Associate basics.", l:"https://www.cisco.com/c/en/us/training-events/training-certifications/certifications/associate/ccna.html"},
          {t:"Protocols", d:"BGP, OSPF, TCP/IP deep dive.", l:"https://networklessons.com/"},
          {t:"Automation", d:"Network automation with Python/Ansible.", l:"https://developer.cisco.com/learning/"}
      ]
  },
  "System Administrator": {
      req: ["Linux", "Windows Server", "Bash", "Active Directory", "Networking"],
      steps: [
          {t:"OS Admin", d:"User management, Permissions, Cron jobs.", l:"https://linuxconfig.org/"},
          {t:"Scripting", d:"Bash or PowerShell automation.", l:"https://dev.to/t/bash"},
          {t:"Security", d:"Firewalls, SSH hardening, VPNs.", l:"https://www.ssh.com/academy/ssh"}
      ]
  },

  // === SPECIALIZED TECH ===
  "Blockchain Developer": {
      req: ["Solidity", "Web3.js", "Smart Contracts", "Cryptography", "Ethereum"],
      steps: [
          {t:"Smart Contracts", d:"Write contracts in Solidity.", l:"https://cryptozombies.io/"},
          {t:"DApps", d:"Connect Frontend to Blockchain with Web3.js.", l:"https://docs.ethers.org/"},
          {t:"DeFi", d:"Understand Decentralized Finance protocols.", l:"https://finematics.com/"}
      ]
  },
  "Embedded Systems Engineer": {
      req: ["C", "C++", "Microcontrollers", "RTOS", "Electronics"],
      steps: [
          {t:"Low Level C", d:"Pointers, Memory Management, Bit manipulation.", l:"https://www.learn-c.org/"},
          {t:"Hardware", d:"Arduino, ESP32, STM32 programming.", l:"https://www.arduino.cc/"},
          {t:"RTOS", d:"Real-Time Operating Systems basics.", l:"https://www.freertos.org/"}
      ]
  },
  "Robotics Engineer": {
      req: ["C++", "Python", "ROS", "Kinematics", "Sensors"],
      steps: [
          {t:"ROS", d:"Robot Operating System (ROS 2).", l:"https://docs.ros.org/"},
          {t:"Control Theory", d:"PID Controllers, Path Planning.", l:"https://www.youtube.com/playlist?list=PLUMWjy5jgHK1NC52DXXrriwihVrYZKqjk"},
          {t:"Simulation", d:"Gazebo or V-Rep simulation.", l:"https://gazebosim.org/"}
      ]
  },
  "AR/VR Developer": {
      req: ["Unity", "C#", "3D Modeling", "XR Toolkit", "Oculus SDK"],
      steps: [
          {t:"XR Development", d:"Unity XR Interaction Toolkit.", l:"https://learn.unity.com/course/xr-development-with-unity"},
          {t:"3D Assets", d:"Blender basics for VR assets.", l:"https://www.blender.org/support/tutorials/"},
          {t:"Optimization", d:"Performance tuning for mobile VR.", l:"https://developer.oculus.com/documentation/unity/unity-perf/"}
      ]
  },
  "Ethical Hacker": {
      req: ["Networking", "Linux", "Metasploit", "Nmap", "Scripting"],
      steps: [
          {t:"Reconnaissance", d:"OSINT and Information Gathering.", l:"https://osintframework.com/"},
          {t:"Scanning", d:"Nmap, Wireshark, Burp Suite.", l:"https://tryhackme.com/"},
          {t:"Exploitation", d:"Buffer Overflows, SQL Injection.", l:"https://www.hackthebox.com/"}
      ]
  },

  // === DESIGN & CREATIVE ===
  "UI/UX Designer": {
      req: ["Figma", "Wireframing", "Prototyping", "User Research", "Color Theory"],
      steps: [
          {t:"Design Tools", d:"Master Figma or Adobe XD.", l:"https://help.figma.com/"},
          {t:"UX Principles", d:"User Journey Maps, Personas.", l:"https://www.nngroup.com/articles/"},
          {t:"UI Patterns", d:"Material Design, Human Interface Guidelines.", l:"https://m3.material.io/"}
      ]
  },
  "Graphic Designer": {
      req: ["Photoshop", "Illustrator", "Typography", "Branding", "Layout"],
      steps: [
          {t:"Adobe Suite", d:"Photoshop (Raster) & Illustrator (Vector).", l:"https://helpx.adobe.com/learning.html"},
          {t:"Typography", d:"Font pairing and hierarchy.", l:"https://fonts.google.com/knowledge"},
          {t:"Portfolio", d:"Build a Behance portfolio.", l:"https://www.behance.net/"}
      ]
  },
  "Video Editor": {
      req: ["Premiere Pro", "After Effects", "Storytelling", "Color Grading"],
      steps: [
          {t:"Editing", d:"Cuts, Transitions, Pacing.", l:"https://www.skillshare.com/browse/video-editing"},
          {t:"Color Grading", d:"Lumetri Color or DaVinci Resolve.", l:"https://www.blackmagicdesign.com/products/davinciresolve/training"},
          {t:"Motion Graphics", d:"Basic text animations in After Effects.", l:"https://helpx.adobe.com/after-effects/tutorials.html"}
      ]
  },
  "Content Writer": {
      req: ["SEO", "Copywriting", "Research", "Editing", "CMS"],
      steps: [
          {t:"SEO Writing", d:"Keywords, Headings, Meta descriptions.", l:"https://yoast.com/seo-copywriting/"},
          {t:"Copywriting", d:"Persuasive writing techniques (AIDA).", l:"https://copyhackers.com/"},
          {t:"Tools", d:"WordPress, Grammarly, Hemingway.", l:"https://wordpress.com/learn/"}
      ]
  },

  // === BUSINESS & OTHERS ===
  "Product Manager": {
      req: ["Agile", "Scrum", "User Stories", "Roadmapping", "Jira"],
      steps: [
          {t:"Agile Methodologies", d:"Scrum, Kanban, Sprints.", l:"https://www.atlassian.com/agile"},
          {t:"Product Strategy", d:"Market research and MVP definition.", l:"https://www.productschool.com/blog/"},
          {t:"Tools", d:"Jira, Trello, Confluence.", l:"https://www.atlassian.com/software/jira"}
      ]
  },
  "Digital Marketer": {
      req: ["SEO", "Google Ads", "Social Media", "Analytics", "Email Marketing"],
      steps: [
          {t:"PPC", d:"Google Ads and Facebook Ads Manager.", l:"https://skillshop.withgoogle.com/"},
          {t:"Analytics", d:"Google Analytics 4 (GA4).", l:"https://analytics.google.com/analytics/academy/"},
          {t:"Social Strategy", d:"Content calendars and engagement.", l:"https://hubspot.com/digital-marketing"}
      ]
  },
  "SEO Specialist": {
      req: ["Keyword Research", "Technical SEO", "Link Building", "Analytics"],
      steps: [
          {t:"On-Page SEO", d:"Title tags, H1s, Content optimization.", l:"https://moz.com/beginners-guide-to-seo"},
          {t:"Technical SEO", d:"Sitemaps, Robots.txt, Site Speed.", l:"https://developers.google.com/search/docs"},
          {t:"Tools", d:"Ahrefs, SEMRush, Google Search Console.", l:"https://ahrefs.com/academy"}
      ]
  },
  "Sales Engineer": {
      req: ["Salesforce", "Technical Demo", "Communication", "CRM", "Negotiation"],
      steps: [
          {t:"Product Knowledge", d:"Deep dive into technical specs.", l:"https://www.salesforce.com/"},
          {t:"Soft Skills", d:"Presentation and Public Speaking.", l:"https://www.toastmasters.org/"},
          {t:"CRM", d:"Managing leads in Salesforce/HubSpot.", l:"https://academy.hubspot.com/"}
      ]
  },
  "IT Support Specialist": {
      req: ["Hardware", "Windows", "Troubleshooting", "Networking", "Customer Service"],
      steps: [
          {t:"Hardware", d:"PC Building and Repair.", l:"https://www.coursera.org/professional-certificates/google-it-support"},
          {t:"OS Troubleshooting", d:"Driver issues, Boot errors.", l:"https://www.windowscentral.com/"},
          {t:"Ticketing", d:"ServiceNow or Jira Service Desk.", l:"https://www.servicenow.com/"}
      ]
  },
  "Database Administrator": {
      req: ["SQL", "Backup", "Recovery", "Security", "Performance Tuning"],
      steps: [
          {t:"Advanced SQL", d:"Stored Procedures, Triggers, Views.", l:"https://www.mysqltutorial.org/"},
          {t:"Admin Tasks", d:"User permissions, Replication.", l:"https://docs.oracle.com/en/database/"},
          {t:"Optimization", d:"Query analysis and Indexing.", l:"https://use-the-index-luke.com/"}
      ]
  }
};

const DEFAULT_JOB = { 
    req: ["Communication", "Problem Solving", "Teamwork"], 
    steps: [{t:"Research Role", d:"Understand job requirements.", l:"https://linkedin.com"}] 
};

function Roadmap() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, userSkills } = location.state || { role: "Software Engineer", userSkills: "" };

  const jobData = JOB_REQUIREMENTS[role] || DEFAULT_JOB;

  // --- INTELLIGENT GAP ANALYSIS LOGIC ---
  const mySkillsRaw = userSkills ? userSkills.toLowerCase().split(',').map(s => s.trim()) : [];
  
  // Identify Matches and Gaps
  const matchedSkills = jobData.req.filter(reqSkill => 
      mySkillsRaw.some(mySkill => mySkill.includes(reqSkill.toLowerCase()))
  );
  
  const missingSkills = jobData.req.filter(reqSkill => 
      !mySkillsRaw.some(mySkill => mySkill.includes(reqSkill.toLowerCase()))
  );

  const total = jobData.req.length;
  const matchPercent = total > 0 ? Math.round((matchedSkills.length / total) * 100) : 0;
  const gapPercent = 100 - matchPercent;

  // --- DYNAMIC ADVICE GENERATOR ---
  let adviceText = "";
  if (matchPercent === 100) {
      adviceText = "🎉 Perfect Match! You are ready to apply for jobs.";
  } else if (missingSkills.length > 0) {
      // Pick the first missing skill to recommend
      const nextSkill = missingSkills[0];
      const potentialScore = Math.round(((matchedSkills.length + 1) / total) * 100);
      
      adviceText = `You are a ${matchPercent}% match. Learn "${nextSkill}" to become a ${potentialScore}% match!`;
  } else {
      adviceText = `You are off to a great start! Keep building projects.`;
  }

  const pieData = [
    { name: 'You Have', value: matchPercent, fill: '#4ade80' },
    { name: 'You Need', value: gapPercent, fill: '#ef4444' }
  ];

  const downloadPDF = () => {
    const input = document.getElementById('roadmap-container');
    html2canvas(input, { backgroundColor: '#1e293b', scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Career_Report_${role}.pdf`);
    });
  };

  return (
    <div className="view-container" style={{paddingTop: '80px', color: 'white'}}>
      <div style={{maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'space-between'}}>
         <button onClick={() => navigate(-1)} className="glass-btn">⬅ Back</button>
         <button onClick={downloadPDF} className="glass-btn" style={{background: '#f59e0b', color: 'black', border: 'none'}}>📥 Download PDF</button>
      </div>

      <div id="roadmap-container" className="profile-card" style={{maxWidth: '900px', marginTop: '20px', padding: '40px'}}>
        
        <h1 style={{textAlign: 'center', marginBottom: '5px'}}>🚀 Career Roadmap</h1>
        <h2 style={{textAlign: 'center', color: '#4ade80'}}>{role}</h2>

        {/* --- DYNAMIC ADVICE BANNER --- */}
        <div style={{
            background: 'rgba(74, 222, 128, 0.15)', 
            border: '1px solid #4ade80', 
            borderRadius: '10px', 
            padding: '15px', 
            textAlign: 'center', 
            marginTop: '20px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#fff'
        }}>
            💡 {adviceText}
        </div>

        {/* --- GRAPHS & SKILL LIST --- */}
        <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '30px'}}>
            
            {/* Pie Chart */}
            <div style={{flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '15px', padding: '20px', textAlign: 'center'}}>
                <h3>Match Analysis</h3>
                <div style={{height: '250px'}}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" paddingAngle={5}>
                                {pieData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div style={{marginTop: '-140px', marginBottom: '100px'}}>
                    <h1 style={{fontSize: '2.5rem', margin: 0}}>{matchPercent}%</h1>
                    <span style={{color: '#aaa', fontSize: '0.8rem'}}>READY</span>
                </div>
            </div>

            {/* Detailed Skill Checklist */}
            <div style={{flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '15px', padding: '20px'}}>
                <h3>Skill Checklist</h3>
                <div style={{marginTop: '15px', display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                    {/* Show Matched Skills (Green) */}
                    {matchedSkills.map((skill, i) => (
                        <span key={i} style={{padding: '8px 12px', borderRadius: '8px', background: 'rgba(74, 222, 128, 0.2)', border: '1px solid #4ade80', fontSize: '0.9rem'}}>
                            ✅ {skill}
                        </span>
                    ))}
                    
                    {/* Show Missing Skills (Red) */}
                    {missingSkills.map((skill, i) => (
                        <span key={i} style={{padding: '8px 12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', fontSize: '0.9rem'}}>
                            ❌ {skill}
                        </span>
                    ))}
                </div>
                
                {missingSkills.length > 0 && (
                    <div style={{marginTop: '20px', fontSize: '0.9rem', color: '#ccc'}}>
                        * Focusing on <strong style={{color: '#ef4444'}}>{missingSkills[0]}</strong> is your highest priority.
                    </div>
                )}
            </div>
        </div>

        {/* --- LEARNING PATH --- */}
        <h3 style={{marginTop: '40px', borderBottom: '2px solid #4ade80', display: 'inline-block'}}>
            🗺️ Recommended Learning Path
        </h3>
        <div style={{marginTop: '20px'}}>
            {jobData.steps.map((step, index) => (
                <div key={index} className="roadmap-step" style={{background: 'white', color: 'black', marginBottom: '15px', padding: '15px', borderRadius: '10px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <h3 style={{margin: 0, fontSize: '1.1rem'}}>Step {index + 1}: {step.t}</h3>
                        <a href={step.l} target="_blank" rel="noreferrer" style={{background: '#2563eb', color: 'white', padding: '5px 15px', borderRadius: '20px', textDecoration:'none', fontSize:'0.8rem'}}>
                            🔗 Start Learning
                        </a>
                    </div>
                    <p style={{margin: '5px 0', color: '#555'}}>{step.d}</p>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default Roadmap;