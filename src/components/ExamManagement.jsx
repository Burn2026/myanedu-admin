import React, { useState, useEffect } from 'react';
import './ExamManagement.css'; 

function ExamManagement() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [studentBatches, setStudentBatches] = useState([]);
  const [searching, setSearching] = useState(false);

  const [newResult, setNewResult] = useState({
    phone: '',
    enrollment_id: '', 
    exam_title: '',  
    marks_obtained: '',
    total_marks: '100',
    grade: 'A'
  });

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://myanedu-backend.onrender.com/admin/exams');
      const data = await res.json();
      setExams(data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  // ✅ ဖုန်းနံပါတ်ရိုက်ပြီး အပြင်ကို Click လိုက်တာနဲ့ အတန်းတွေကို လှမ်းရှာမယ့် Function
  const handlePhoneBlur = async () => {
      const phoneNumber = newResult.phone.trim();
      if (!phoneNumber) return;
      
      setSearching(true);
      setStudentBatches([]); // အသစ်ရှာရင် အဟောင်းတွေ ဖျက်မည်
      setNewResult({ ...newResult, enrollment_id: '' }); 

      try {
          const res = await fetch(`https://myanedu-backend.onrender.com/admin/student-batches?phone=${phoneNumber}`);
          if (res.ok) {
              const data = await res.json();
              setStudentBatches(data);
              
              if(data.length === 0) {
                  alert("⚠️ ဤဖုန်းနံပါတ်ဖြင့် တက်ရောက်နေသော အတန်း မရှိပါ!");
              }
          }
      } catch (err) {
          console.error(err);
      } finally {
          setSearching(false);
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newResult.enrollment_id || !newResult.marks_obtained || !newResult.exam_title) {
        alert("Please select a course and fill all fields!");
        return;
    }

    try {
        const res = await fetch('https://myanedu-backend.onrender.com/admin/exams', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newResult)
        });

        if (res.ok) {
            alert("✅ Result Added Successfully!");
            setNewResult({ ...newResult, marks_obtained: '', exam_title: '', enrollment_id: '', grade: 'A' }); 
            fetchExams(); 
        } else {
            const errData = await res.json();
            alert("Failed: " + (errData.message || "Unknown Error"));
        }
    } catch (err) {
        alert("Connection Error");
    }
  };

  const handleDelete = async (id) => {
      if(!window.confirm("Delete this result?")) return;
      try {
          const res = await fetch(`https://myanedu-backend.onrender.com/admin/exams/${id}`, { method: 'DELETE' });
          if(res.ok) fetchExams();
      } catch (err) { alert("Error deleting"); }
  };

  return (
    <div className="em-container">
      <h2 className="em-title">
        <span>📝</span> Exam Results Management
      </h2>

      {/* --- ADD NEW RESULT FORM --- */}
      <div className="em-card">
        <div className="em-card-header">
            <h3>+ Add New Result</h3>
            <p>Record student exam marks and grades here.</p>
        </div>
        
        <form className="em-card-body" onSubmit={handleSubmit}>
            <div className="em-form-grid">
                
                {/* Phone Input */}
                <div className="em-form-group">
                    <label>Student Phone (Enter & click outside)</label>
                    <input 
                        type="text" 
                        placeholder="e.g. 09xxxxxxxxx" 
                        className={`em-input ${studentBatches.length > 0 ? 'border-green' : ''}`}
                        value={newResult.phone}
                        onChange={e => setNewResult({...newResult, phone: e.target.value})}
                        onBlur={handlePhoneBlur} 
                    />
                    {searching && <span className="em-status-text" style={{color: '#d97706'}}>🔍 Searching courses...</span>}
                    {!searching && studentBatches.length > 0 && <span className="em-status-text" style={{color: '#16a34a'}}>✅ Found {studentBatches.length} course(s)</span>}
                </div>

                {/* Select Course */}
                <div className="em-form-group">
                    <label>Select Course</label>
                    <select 
                        className="em-input"
                        value={newResult.enrollment_id}
                        onChange={e => setNewResult({...newResult, enrollment_id: e.target.value})}
                        disabled={studentBatches.length === 0}
                    >
                        <option value="">-- Choose Course --</option>
                        {studentBatches.map(batch => (
                            <option key={batch.enrollment_id} value={batch.enrollment_id}>
                                {batch.course_name} ({batch.batch_name})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Exam Title */}
                <div className="em-form-group">
                    <label>Exam Title</label>
                    <input 
                        type="text" 
                        placeholder="e.g. Mid-Term" 
                        className="em-input"
                        value={newResult.exam_title}
                        onChange={e => setNewResult({...newResult, exam_title: e.target.value})}
                    />
                </div>

                {/* Marks */}
                <div className="em-form-group">
                    <label>Marks Obtained</label>
                    <input 
                        type="number" 
                        placeholder="e.g. 85" 
                        className="em-input"
                        value={newResult.marks_obtained}
                        onChange={e => setNewResult({...newResult, marks_obtained: e.target.value})}
                    />
                </div>

                {/* Grade */}
                <div className="em-form-group">
                    <label>Grade</label>
                    <select 
                        className="em-input"
                        value={newResult.grade}
                        onChange={e => setNewResult({...newResult, grade: e.target.value})}
                    >
                        <option value="A+">A+ (Excellent)</option>
                        <option value="A">A (Very Good)</option>
                        <option value="B">B (Good)</option>
                        <option value="C">C (Average)</option>
                        <option value="D">D (Pass)</option>
                        <option value="F">F (Fail)</option>
                    </select>
                </div>

            </div>

            <button 
                type="submit" 
                className="em-btn-save"
                disabled={!newResult.enrollment_id}
            >
                Save Result
            </button>
        </form>
      </div>

      {/* --- RESULTS TABLE --- */}
      {loading ? (
          <div className="em-loading">Loading exam results...</div>
      ) : (
        <div className="em-table-wrapper">
          <table className="em-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Exam Title</th>
                <th>Marks</th>
                <th>Grade</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {exams.length === 0 ? (
                  <tr>
                      <td colSpan="6" className="em-empty">No exam results found.</td>
                  </tr>
              ) : (
                  exams.map(exam => (
                    <tr key={exam.id}>
                      <td data-label="Student">
                        <div className="em-fw-bold">{exam.student_name}</div>
                        <div className="em-text-small em-text-gray">{exam.course_name} ({exam.batch_name})</div>
                      </td>
                      <td data-label="Exam Title" className="em-fw-medium">{exam.exam_title}</td>
                      <td data-label="Marks">
                          <span className="em-fw-bold em-text-blue">{exam.marks_obtained}</span> 
                          <span className="em-text-small em-text-gray"> / {exam.total_marks}</span>
                      </td>
                      <td data-label="Grade">
                        <span className={`em-grade-badge ${exam.grade === 'F' ? 'grade-fail' : 'grade-pass'}`}>
                            {exam.grade}
                        </span>
                      </td>
                      <td data-label="Date" className="em-text-gray">
                          {new Date(exam.result_date).toLocaleDateString()}
                      </td>
                      <td data-label="Action" className="em-actions">
                          <button onClick={() => handleDelete(exam.id)} className="em-btn-delete">
                              Delete
                          </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ExamManagement;