import { useState, useEffect } from 'react';
import './CourseManagement.css'; // ✅ CSS အသစ် ချိတ်ဆက်ထားသည်

function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  
  const [selectedCourse, setSelectedCourse] = useState("");
  const [batchName, setBatchName] = useState("");
  const [batchFees, setBatchFees] = useState("");

  const API_URL = "https://myanedu-backend.onrender.com";

  // ၁။ ရှိပြီးသား Course များကို ဆွဲထုတ်ခြင်း
  useEffect(() => {
    fetch(`${API_URL}/public/promo-courses`) 
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error("Error fetching courses:", err));
  }, []);

  // ၂။ Course အသစ် ဖန်တီးခြင်း
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/admin/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: courseTitle, description: courseDesc }),
      });
      if (res.ok) {
        alert("Course Created Successfully!");
        window.location.reload();
      } else {
        alert("Failed to create course");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ၃။ Batch အသစ် ဖန်တီးခြင်း
  const handleCreateBatch = async (e) => {
    e.preventDefault();
    try {
      // Batch ID ကို unique ဖြစ်အောင် auto ပေးပါမည်
      const batchId = `${selectedCourse}-${batchName.replace(/\s/g, '')}`; 
      
      const res = await fetch(`${API_URL}/admin/batches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: batchId,
          course_id: selectedCourse,
          batch_name: batchName,
          fees: batchFees
        }),
      });
      if (res.ok) {
        alert("Batch Created Successfully!");
        setBatchName("");
        setBatchFees("");
      } else {
        alert("Failed to create batch");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="cm-container">
      <h2 className="cm-title">
        <span>📚</span> Manage Courses & Batches
      </h2>

      <div className="cm-grid">
        
        {/* --- Create Course Section --- */}
        <div className="cm-card">
          <div className="cm-card-header">
            <h3>1. Create New Course</h3>
            <p>Add a main subject or course category.</p>
          </div>
          <div className="cm-card-body">
            <form onSubmit={handleCreateCourse} className="cm-form">
              <div className="cm-form-group">
                <label>Course Title <span>*</span></label>
                <input 
                  type="text" 
                  placeholder="e.g. Spoken English" 
                  className="cm-input"
                  value={courseTitle} 
                  onChange={e => setCourseTitle(e.target.value)} 
                  required 
                />
              </div>
              <div className="cm-form-group">
                <label>Description</label>
                <textarea 
                  placeholder="Short description about the course..." 
                  className="cm-input cm-textarea"
                  value={courseDesc} 
                  onChange={e => setCourseDesc(e.target.value)} 
                ></textarea>
              </div>
              <button type="submit" className="cm-btn cm-btn-blue">
                ➕ Add Course
              </button>
            </form>
          </div>
        </div>

        {/* --- Create Batch Section --- */}
        <div className="cm-card">
          <div className="cm-card-header">
            <h3>2. Create New Batch</h3>
            <p>Open a new class under an existing course.</p>
          </div>
          <div className="cm-card-body">
            <form onSubmit={handleCreateBatch} className="cm-form">
              <div className="cm-form-group">
                <label>Select Course <span>*</span></label>
                <select 
                  className="cm-input"
                  value={selectedCourse} 
                  onChange={e => setSelectedCourse(e.target.value)} 
                  required
                >
                  <option value="" disabled>-- Choose Course --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="cm-form-row">
                <div className="cm-form-group flex-1">
                  <label>Batch Name <span>*</span></label>
                  <input 
                    type="text" 
                    placeholder="e.g. Batch 1" 
                    className="cm-input"
                    value={batchName} 
                    onChange={e => setBatchName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="cm-form-group flex-1">
                  <label>Fees (Ks) <span>*</span></label>
                  <input 
                    type="number" 
                    placeholder="e.g. 50000" 
                    className="cm-input"
                    value={batchFees} 
                    onChange={e => setBatchFees(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <button type="submit" className="cm-btn cm-btn-green">
                🚀 Open Batch
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CourseManagement;