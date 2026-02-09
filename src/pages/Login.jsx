// edu-admin/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; // ဒီဇိုင်းလှလှလေးတွေ ရဖို့

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Admin Password စစ်ဆေးခြင်း (နောက်ပိုင်း Database နဲ့ ချိတ်မယ်)
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('adminAuth', 'true'); // Login ဝင်ထားကြောင်း မှတ်ထားမယ်
      navigate('/dashboard'); // Dashboard ကို ပို့မယ်
    } else {
      setError("Username သို့မဟုတ် Password မှားယွင်းနေပါသည်");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
      <div className="search-card" style={{ width: '400px', padding: '40px' }}>
        <h2 style={{ color: '#1e293b', marginBottom: '10px' }}>🔐 Admin Portal</h2>
        <p style={{ color: '#64748b', marginBottom: '30px' }}>စီမံခန့်ခွဲသူစနစ်သို့ ဝင်ရောက်ရန်</p>
        
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{textAlign: 'left'}}>
            <label style={{fontWeight: 'bold', fontSize: '13px', color: '#64748b'}}>Username</label>
            <input 
                className="search-input" 
                style={{width: '100%', marginTop: '5px'}}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div style={{textAlign: 'left'}}>
            <label style={{fontWeight: 'bold', fontSize: '13px', color: '#64748b'}}>Password</label>
            <input 
                className="search-input" 
                type="password"
                style={{width: '100%', marginTop: '5px'}}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="search-btn" type="submit" style={{marginTop: '10px'}}>Login ဝင်မည်</button>
        </form>
      </div>
    </div>
  );
}

export default Login;