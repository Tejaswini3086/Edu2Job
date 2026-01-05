import React, { useState } from 'react';
import { auth, googleProvider } from './firebase'; 
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import './App.css'; 

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
     
      await signInWithEmailAndPassword(auth, email, password);
      
      
      navigate('/profile'); 
    } catch (error) {
      console.error("Login Error:", error.code);
      
     
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        alert("❌ Account not found! You must SIGN UP first before logging in.");
      } else if (error.code === 'auth/wrong-password') {
        alert("❌ Wrong password. Please try again.");
      } else {
        alert("Login failed: " + error.message);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/profile'); 
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="bg-login-img">
      <div className="glass-card">
        <h1 className="brand-title">Edu2Job</h1>
        <p className="brand-subtitle">Welcome Back, Scholar</p>

        <form onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="Enter your email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Enter your password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button type="submit" className="glass-btn">Access Dashboard</button>
        </form>

        <button onClick={handleGoogleLogin} className="google-btn">
          Sign in with Google
        </button>

        <p className="glass-footer">
          Don't have a Login yet? <Link to="/signup">Sign Up Here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;