import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
    const [jobData, setJobData] = useState({ labels: [], datasets: [] });
    const [degreeData, setDegreeData] = useState({ labels: [], datasets: [] });
    const [feedbacks, setFeedbacks] = useState([]);
    
    // Existing States preserved
    const [file, setFile] = useState(null);
    const [statsSummary, setStatsSummary] = useState({ totalUsers: 0, avgRating: 0 });
    const [showZoomedChart, setShowZoomedChart] = useState(false);

    useEffect(() => {
        fetchStats();
        fetchFeedback();
    }, []);

    const fetchStats = async () => {
        try {
            const jobRes = await axios.get('http://localhost:5000/admin/stats/jobs');
            const degRes = await axios.get('http://localhost:5000/admin/stats/degrees');

            // --- NEW FEATURE: TOP 5 JOB ROLES WITH PERCENTAGES ---
            // 1. Filter out null/empty values and sort by frequency
            const cleanJobs = jobRes.data.filter(d => d._id && d._id !== "null" && d._id.trim() !== "");
            const sortedJobs = [...cleanJobs].sort((a, b) => b.count - a.count);
            const totalJobCount = sortedJobs.reduce((acc, curr) => acc + curr.count, 0);
            
            // 2. Select Top 5 for clarity
            const top5Jobs = sortedJobs.slice(0, 5);

            setJobData({
                // X-AXIS: Job Names
                labels: top5Jobs.map(d => d._id),
                datasets: [{
                    label: 'Recommendation Strength (%)',
                    // Y-AXIS DATA: Percentage heights for tall vertical bars
                    data: top5Jobs.map(d => ((d.count / totalJobCount) * 100).toFixed(1)),
                    backgroundColor: 'rgba(78, 115, 223, 1)', // Professional blue
                    barThickness: 80, // Thick vertical bars for clarity
                    borderRadius: 4,
                }]
            });

            // Pie chart logic preserved
            const sortedDegrees = [...degRes.data].sort((a, b) => b.count - a.count);
            setDegreeData({
                labels: sortedDegrees.map(d => d._id),
                datasets: [{
                    data: sortedDegrees.map(d => d.count),
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#C9CBCF', '#FF9F40'],
                }]
            });

            setStatsSummary(prev => ({ ...prev, totalUsers: totalJobCount }));
        } catch (error) {
            console.error("Error fetching statistics:", error);
        }
    };

    const fetchFeedback = async () => {
        const res = await axios.get('http://localhost:5000/admin/feedback-view');
        setFeedbacks(res.data);
        if (res.data.length > 0) {
            const avg = res.data.reduce((acc, curr) => acc + curr.rating, 0) / res.data.length;
            setStatsSummary(prev => ({ ...prev, avgRating: avg.toFixed(1) }));
        }
    };

    const handleRetrain = async () => {
        alert("Retraining started... Check server console.");
        await axios.post('http://localhost:5000/admin/retrain');
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!file) return alert("Please select a CSV file first.");
        const formData = new FormData();
        formData.append('dataset', file);
        try {
            await axios.post('http://localhost:5000/admin/upload-dataset', formData);
            alert("Dataset uploaded successfully!");
            fetchStats();
        } catch (err) {
            alert("Upload failed.");
        }
    };

    // PROFESSIONAL BAR OPTIONS
    const barOptions = {
        responsive: true,
        maintainAspectRatio: false, // Forces bars to be TALL
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: { label: (context) => ` Strength: ${context.raw}%` }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100, // Fixed 100% scale for visual impact
                title: { display: true, text: 'Percentage (%)', font: { size: 16, weight: 'bold' } },
                ticks: { callback: (v) => v + "%", font: { size: 14 } }
            },
            x: {
                title: { display: true, text: 'Top Predicted Job Roles', font: { size: 16, weight: 'bold' } },
                ticks: { font: { size: 12, weight: 'bold' }, color: '#333' }
            }
        }
    };

    const pieOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'right', labels: { usePointStyle: true, padding: 20 } },
            title: { display: true, text: 'User Educational Background', font: { size: 18, weight: 'bold' }, color: '#36A2EB' }
        }
    };

    const zoomedBarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Detailed Career Analytics: Full Batches', font: { size: 24, weight: 'bold' }, padding: 20 }
        },
        scales: {
            y: { beginAtZero: true, max: 100, ticks: { stepSize: 20 }, title: { display: true, text: 'Percentage (%)' } },
            x: { ticks: { autoSkip: false, font: { size: 12, weight: '600' } } }
        }
    };

    return (
        <div style={{ padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: 'Nunito, sans-serif' }}>
            <h1>🚀 Admin Control Panel</h1>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div style={{ flex: 1, backgroundColor: '#2E8B57', color: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                    <h4>Total Predictions Analyzed</h4>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{statsSummary.totalUsers}</p>
                </div>
                <div style={{ flex: 1, backgroundColor: '#2c99edff', color: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                    <h4>Avg. System Accuracy</h4>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{statsSummary.avgRating} / 5</p>
                </div>
            </div>
            
            <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                <div 
                    onClick={() => setShowZoomedChart(true)} 
                    style={{ cursor: 'zoom-in', flex: 1, backgroundColor: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                >
                    <h3>Market Share Distribution (Top 5 Roles)</h3>
                    <div style={{ height: '400px' }}>
                        <Bar data={jobData} options={barOptions} />
                    </div>
                </div>
                <div style={{ flex: 1, backgroundColor: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                    <Pie data={degreeData} options={pieOptions} />
                </div>
            </div>

            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3>📂 Dataset Management</h3>
                    <input type="file" onChange={(e) => setFile(e.target.files[0])} accept=".csv" />
                    <button onClick={handleFileUpload} style={{ marginLeft: '10px', padding: '8px 15px', backgroundColor: '#4a90e2', color: 'white', border: 'none', borderRadius: '5px' }}>
                        Upload New CSV
                    </button>
                </div>
                <button onClick={handleRetrain} style={{ padding: '10px 20px', backgroundColor: '#2E8B57', color: 'white', border: 'none', borderRadius: '8px' }}>
                    Trigger ML Retraining
                </button>
            </div>

            <div style={{ backgroundColor: '#1e1414ff', padding: '20px', borderRadius: '12px' }}>
                <h3 style={{color: 'white'}}>💬 User Feedback Logs</h3>
                <table border="1" width="100%" style={{ borderCollapse: 'collapse', color: 'white' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#150b0bff' }}>
                            <th>Email</th><th>Rating</th><th>Comment</th><th>Suggested Job</th>
                        </tr>
                    </thead>
                    <tbody> 
                    {feedbacks.map((f, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #444' }}>
                            <td style={{ padding: '10px' }}>{f.userEmail || f.email || "N/A"}</td>
                            <td style={{ padding: '10px' }}>{f.rating} ⭐</td>
                            <td style={{ padding: '10px' }}>{f.comment}</td>
                            <td style={{ padding: '10px' }}>{f.suggestedJob || "N/A"}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

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
                        <button onClick={() => setShowZoomedChart(false)} style={{ position: 'absolute', right: '20px', top: '20px', fontSize: '24px', border: 'none', background: 'none' }}>✖</button>
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