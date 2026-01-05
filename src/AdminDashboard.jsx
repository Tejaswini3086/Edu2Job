import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
    const [jobData, setJobData] = useState({ labels: [], datasets: [] });
    const [degreeData, setDegreeData] = useState({ labels: [], datasets: [] });
    const [feedbacks, setFeedbacks] = useState([]);
    
    // NEW: States for dataset management and insights
    const [file, setFile] = useState(null);
    const [statsSummary, setStatsSummary] = useState({ totalUsers: 0, avgRating: 0 });
    // Add at the top with your other states
    const [showZoomedChart, setShowZoomedChart] = useState(false);

    useEffect(() => {
        fetchStats();
        fetchFeedback();
    }, []);

    const fetchStats = async () => {
        const jobRes = await axios.get('http://localhost:5000/admin/stats/jobs');
        const degRes = await axios.get('http://localhost:5000/admin/stats/degrees');

        setJobData({
            labels: jobRes.data.map(d => d._id),
            datasets: [{
                label: 'Students per Career Path',
                data: jobRes.data.map(d => d.count),
                // NEW: Professional Color Palette
                backgroundColor: [
                    'rgba(46, 139, 87, 0.8)', 
                    'rgba(54, 162, 235, 0.8)', 
                    'rgba(255, 206, 86, 0.8)', 
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 99, 132, 0.8)'
                ],
                borderColor: 'rgba(255, 255, 255, 1)',
                borderWidth: 2,
                borderRadius: 10, // NEW: Rounded corners
                hoverBackgroundColor: 'rgba(46, 139, 87, 1)',
            }]
        });

        setDegreeData({
            labels: degRes.data.map(d => d._id),
            datasets: [{
                data: degRes.data.map(d => d.count),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
            }]
        });

        // NEW: Calculate basic insights summary
        const total = degRes.data.reduce((acc, curr) => acc + curr.count, 0);
        setStatsSummary(prev => ({ ...prev, totalUsers: total }));
    };

    const fetchFeedback = async () => {
        const res = await axios.get('http://localhost:5000/admin/feedback-view');
        setFeedbacks(res.data);
        
        // NEW: Calculate average rating for insights
        if (res.data.length > 0) {
            const avg = res.data.reduce((acc, curr) => acc + curr.rating, 0) / res.data.length;
            setStatsSummary(prev => ({ ...prev, avgRating: avg.toFixed(1) }));
        }
    };

    const handleRetrain = async () => {
        alert("Retraining started... Check server console.");
        await axios.post('http://localhost:5000/admin/retrain');
    };

    // NEW: Handle Dataset Upload
    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!file) return alert("Please select a CSV file first.");
        
        const formData = new FormData();
        formData.append('dataset', file);

        try {
            await axios.post('http://localhost:5000/admin/upload-dataset', formData);
            alert("Dataset uploaded successfully!");
        } catch (err) {
            alert("Upload failed. Check if backend route exists.");
        }
    };

    // NEW: Variable for professional bar chart styling
    const barOptions = {
        responsive: true,
        plugins: {
            legend: { display: false }, 
            title: {
                display: true,
                text: 'Top Trending Job Matches',
                font: { size: 18, weight: 'bold' },
                color: '#2E8B57'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0,0,0,0.05)' }
            },
            x: {
                grid: { display: false }
            }
        },
        animation: {
            duration: 2000,
            easing: 'easeInOutQuart'
        }
    };

    const pieOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right', // Moves labels to the side so the chart isn't crowded
                labels: {
                    padding: 20,
                    font: { size: 12, weight: '600' },
                    usePointStyle: true, // Changes square boxes to nice dots
                }
            },
            title: {
                display: true,
                text: 'User Educational Background',
                font: { size: 18, weight: 'bold' },
                color: '#36A2EB'
            }
        },
        animation: {
            animateRotate: true,
            duration: 2000
        }
    };

    const zoomedBarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: 'Detailed Career Analytics: Full Batches',
                font: { size: 24, weight: 'bold' },
                padding: 20
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 20, font: { size: 16 } },
                title: { display: true, text: 'Student Count', font: { size: 18 } }
            },
            x: {
                ticks: {
                    autoSkip: false, // Force all names to show
                    maxRotation: 0,  // Keep text horizontal
                    minRotation: 0,
                    font: { size: 12, weight: '600' }
                }
            }
        }
    };

    return (
        <div style={{ padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
            <h1>🚀 Admin Control Panel</h1>

            {/* NEW: Quick Insights Summary */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div style={{ flex: 1, backgroundColor: '#2E8B57', color: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                    <h4>Total Predictions</h4>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{statsSummary.totalUsers}</p>
                </div>
                <div style={{ flex: 1, backgroundColor: '#36A2EB', color: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                    <h4>Avg. System Accuracy (User Rated)</h4>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{statsSummary.avgRating} / 5</p>
                </div>
            </div>
            
            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                <div 
                    onClick={() => setShowZoomedChart(true)} 
                    style={{ cursor: 'zoom-in', flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                >
                    <h3>Degree to Job Mapping (Bar Chart)</h3>
                    <p style={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'right' }}>🔍 Click to expand</p>
                    <Bar data={jobData} options={barOptions} />
                </div>
                <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <h3>User Distribution (Pie Chart)</h3>
                    <Pie data={degreeData} options={pieOptions} />
                </div>
            </div>

            {/* NEW: Dataset Management Section */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3>📂 Dataset Management</h3>
                    <input type="file" onChange={(e) => setFile(e.target.files[0])} accept=".csv" />
                    <button onClick={handleFileUpload} style={{ marginLeft: '10px', padding: '8px 15px', backgroundColor: '#4a90e2', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                        Upload New CSV
                    </button>
                </div>
                <div style={{ borderLeft: '1px solid #ddd', paddingLeft: '20px' }}>
                    <h3>🛠️ Model Management</h3>
                    <button onClick={handleRetrain} style={{ padding: '10px 20px', backgroundColor: '#2E8B57', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                        Trigger ML Retraining
                    </button>
                </div>
            </div>

            <div style={{ backgroundColor: '#1e1414ff', padding: '20px', borderRadius: '12px' }}>
                <h3>💬 User Feedback Logs</h3>
                <table border="1" width="100%" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#150b0bff' }}>
                            <th>Email</th>
                            <th>Rating</th>
                            <th>Comment</th>
                            <th>Suggested Job</th>
                        </tr>
                    </thead>
                    <tbody style={{ color: "#ddd" }}> 
                    {feedbacks.map((f, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '10px' }}>{f.userEmail || f.email || "No Email Provided"}</td>
                            <td style={{ padding: '10px' }}>{f.rating} ⭐</td>
                            <td style={{ padding: '10px' }}>{f.comment}</td>
                            <td style={{ padding: '10px' }}>{f.suggestedJob || "N/A"}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Professional Zoom Modal */}
            {showZoomedChart && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999,
                    display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '50px'
                }}>
                    <div style={{
                        backgroundColor: 'white', width: '90%', height: '80%',
                        borderRadius: '20px', padding: '40px', position: 'relative', overflowX: 'auto'
                    }}>
                        <button 
                            onClick={() => setShowZoomedChart(false)}
                            style={{ position: 'absolute', right: '20px', top: '20px', fontSize: '24px', cursor: 'pointer', border: 'none', background: 'none' }}
                        >✖</button>
                        
                        <div style={{ minWidth: '1200px', height: '100%' }}> 
                            <Bar data={jobData} options={zoomedBarOptions} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;