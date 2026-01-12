import React, { useState } from 'react';
import { auth } from './firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import './App.css';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
  
      navigate('/edit-profile'); 
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
   
    <div className="bg-signup-img" style={{ minHeight: '100vh' }}>
      <div className="glass-card">
        <h1 className="brand-title">Edu2Job</h1>
        <p className="brand-subtitle">Start Your Journey Today</p>

        <form onSubmit={handleSignup}>
          <input 
            type="email" 
            placeholder="Student Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            required 
            autoComplete="email"
          />
          <input 
            type="password" 
            placeholder="Create Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            required 
            autoComplete="new-password"
          />
          <button type="submit" className="glass-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Register Account"}
          </button>
        </form>

        <p className="glass-footer">
          Already a member? <Link to="/">Log In</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
