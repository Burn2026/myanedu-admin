import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Existing Components
import PaymentVerification from '../components/PaymentVerification';
import StudentManagement from '../components/StudentManagement'; 
import ExamManagement from '../components/ExamManagement'; 
import LessonManagement from '../components/LessonManagement';

// (New Feature) Discussion Manager Component Import
import DiscussionManager from '../components/DiscussionManager'; 

import '../App.css';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState({ total_students: 0, total_income: 0 });
  const navigate = useNavigate();

  // Stats Data ဆွဲထုတ်ခြင်း
  useEffect(() => {
    fetch('https://myanedu-backend.onrender.com/admin/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Error:", err));
  }, []);

  const handleLogout = () => {
    if(window.confirm("Are you sure you want to logout?")) {
        localStorage.removeItem('adminAuth');
        navigate('/login');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div className="dashboard-layout" style={{ minHeight: '90vh' }}>
        
        {/* Sidebar */}
        <div className="dashboard-sidebar">
          <div className="sidebar-profile">
            <div className="sidebar-avatar" style={{ background: '#ef4444' }}>A</div>
            <div className="sidebar-name">Admin User</div>
            <div className="sidebar-phone">System Administrator</div>
          </div>

          <div className="sidebar-menu">
            <div className={`menu-item ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
              📊 Dashboard Stats
            </div>
            <div className={`menu-item ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>
              👨‍🎓 Manage Students
            </div>
            <div className={`menu-item ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>
              💰 Verify Payments
            </div>
            <div className={`menu-item ${activeTab === 'exams' ? 'active' : ''}`} onClick={() => setActiveTab('exams')}>
              📝 Exam Results
            </div>
            <div className={`menu-item ${activeTab === 'lessons' ? 'active' : ''}`} onClick={() => setActiveTab('lessons')}>
              📺 Manage Lessons
            </div>
            
            {/* (NEW) Discussion Tab */}
            <div className={`menu-item ${activeTab === 'discuss' ? 'active' : ''}`} onClick={() => setActiveTab('discuss')}>
              💬 Discussions
            </div>
            
            <div className="menu-item" style={{color: '#ef4444', marginTop: 'auto'}} onClick={handleLogout}>
              🚪 Logout
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="dashboard-content">
          
          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div>
              <h2 className="dashboard-title">Admin Overview</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon" style={{background: '#dbeafe', color: '#2563eb'}}>👥</div>
                  <div className="stat-info">
                    <h4>Total Students</h4>
                    <p>{stats.total_students}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{background: '#dcfce7', color: '#16a34a'}}>💵</div>
                  <div className="stat-info">
                    <h4>Total Income</h4>
                    <p>{Number(stats.total_income).toLocaleString()} Ks</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
             <StudentManagement /> 
          )}
          
          {/* Payments Tab */}
          {activeTab === 'payments' && (
             <PaymentVerification /> 
          )}

          {/* Exams Tab */}
          {activeTab === 'exams' && (
             <ExamManagement /> 
          )}

          {/* Lessons Tab */}
          {activeTab === 'lessons' && (
             <LessonManagement /> 
          )}

          {/* (NEW) Discussions Tab */}
          {activeTab === 'discuss' && (
             <DiscussionManager /> 
          )}
          
        </div>

      </div>
    </div>
  );
}

export default Dashboard;