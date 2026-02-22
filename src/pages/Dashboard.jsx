import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Existing Components
import PaymentVerification from '../components/PaymentVerification';
import StudentManagement from '../components/StudentManagement'; 
import ExamManagement from '../components/ExamManagement'; 
import LessonManagement from '../components/LessonManagement';
import DiscussionManager from '../components/DiscussionManager'; 
import CourseManagement from '../components/CourseManagement'; 

import './Dashboard.css'; // ✅ CSS အသစ်ချိတ်ဆက်ထားသည် (App.css အစား)

// Icons (SVG)
const MenuIcon = () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>;
const CloseIcon = () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;

function Dashboard() {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState({ total_students: 0, total_income: 0 });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile Menu State
  const navigate = useNavigate();

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

  const changeTab = (tabName) => {
    setActiveTab(tabName);
    setIsMobileMenuOpen(false); // Menu ရွေးပြီးရင် အလိုလိုပြန်ပိတ်မည်
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="admin-root">
      
      {/* --- Mobile Header --- */}
      <div className="mobile-header">
        <div className="mobile-logo">🛡️ Admin Panel</div>
        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      <div className="dashboard-layout">
        
        {/* --- Sidebar --- */}
        <div className={`dashboard-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="sidebar-profile">
            <div className="sidebar-avatar">A</div>
            <div className="sidebar-name">Admin User</div>
            <div className="sidebar-phone">System Administrator</div>
          </div>

          <div className="sidebar-menu">
            <div className={`menu-item ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => changeTab('stats')}>
              📊 Dashboard Stats
            </div>
            <div className={`menu-item ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => changeTab('courses')}>
              📚 Manage Courses
            </div>
            <div className={`menu-item ${activeTab === 'students' ? 'active' : ''}`} onClick={() => changeTab('students')}>
              👨‍🎓 Manage Students
            </div>
            <div className={`menu-item ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => changeTab('payments')}>
              💰 Verify Payments
            </div>
            <div className={`menu-item ${activeTab === 'exams' ? 'active' : ''}`} onClick={() => changeTab('exams')}>
              📝 Exam Results
            </div>
            <div className={`menu-item ${activeTab === 'lessons' ? 'active' : ''}`} onClick={() => changeTab('lessons')}>
              📺 Manage Lessons
            </div>
            <div className={`menu-item ${activeTab === 'discuss' ? 'active' : ''}`} onClick={() => changeTab('discuss')}>
              💬 Discussions
            </div>
            <div className="menu-item logout-btn" onClick={handleLogout}>
              🚪 Logout
            </div>
          </div>
        </div>

        {/* --- Background Overlay for Mobile Menu --- */}
        {isMobileMenuOpen && <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>}

        {/* --- Content Area --- */}
        <div className="dashboard-content">
          
          {activeTab === 'stats' && (
            <div className="animate-fade-in">
              <h2 className="dashboard-title">Admin Overview</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon icon-blue">👥</div>
                  <div className="stat-info">
                    <h4>Total Students</h4>
                    <p>{stats.total_students}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon icon-green">💵</div>
                  <div className="stat-info">
                    <h4>Total Income</h4>
                    <p>{Number(stats.total_income).toLocaleString()} Ks</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'courses' && <CourseManagement />}
          {activeTab === 'students' && <StudentManagement />}
          {activeTab === 'payments' && <PaymentVerification />}
          {activeTab === 'exams' && <ExamManagement />}
          {activeTab === 'lessons' && <LessonManagement />}
          {activeTab === 'discuss' && <DiscussionManager />}
          
        </div>
      </div>
    </div>
  );
}

export default Dashboard;