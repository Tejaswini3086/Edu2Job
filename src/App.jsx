import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Importing the file we just edited
import EditProfile from './EditProfile'; 
import Login from './Login';
import Register from "./Signup";
import ViewProfile from './ViewProfile';
import CreateProfile from './CreateProfile';
import Roadmap from './Roadmap';
import Chatbot from './Chatbot';
import Signup from './Signup';
import AdminDashboard from './AdminDashboard';

function App() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route 
          path="/profile" 
          element={<ViewProfile darkMode={darkMode} toggleTheme={toggleTheme} />} 
        />
        
        
        <Route path="/edit-profile" element={<EditProfile />} />
        
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>

      <Chatbot />
    </Router>
  );
}

export default App;