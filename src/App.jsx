// edu-admin/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CourseManagement from './components/CourseManagement'; // (၁) ဒီလိုင်းအသစ်တိုးပါတယ်
import './App.css';

// Login ဝင်ထားမှ Dashboard ကို ပေးသွားမည့် Function
const ProtectedRoute = ({ children }) => {
  const isAuth = localStorage.getItem('adminAuth');
  return isAuth ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Dashboard လမ်းကြောင်း */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* (၂) Course Management လမ်းကြောင်း အသစ်ထည့်ထားပါတယ် */}
        <Route path="/admin/courses" element={
          <ProtectedRoute>
            <CourseManagement />
          </ProtectedRoute>
        } />
        
        {/* ဘာမှမရိုက်ရင် Login ကို အရင်ပို့မယ် */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;