import React, { useState, useEffect } from 'react';

function ExamManagement() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // (New) Student Batches State
  const [studentBatches, setStudentBatches] = useState([]);
  const [searching, setSearching] = useState(false);

  const [newResult, setNewResult] = useState({
    phone: '',
    enrollment_id: '', // (Changed) Exam Title အစား Enrollment ID သိမ်းမယ်
    exam_title: '',    // (New) Exam Title (Mid-term, Final) ကတော့ စာရိုက်ထည့်မယ်
    marks_obtained: '',
    total_marks: '100',
    grade: 'A'
  });

  // 1. Data ဆွဲထုတ်ခြင်း
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

  // (NEW) ဖုန်းနံပါတ်ရိုက်ပြီး Enter ခေါက်ရင် သို့မဟုတ် Focus လွတ်ရင် သင်တန်းရှာမယ်
  const handlePhoneBlur = async () => {
      if (!newResult.phone) return;
      setSearching(true);
      try {
          const res = await fetch(`https://myanedu-backend.onrender.com/admin/student-batches?phone=${newResult.phone}`);
          const data = await res.json();
          setStudentBatches(data);
          
          if(data.length === 0) alert("No active courses found for this student!");
      } catch (err) {
          console.error(err);
      } finally {
          setSearching(false);
      }
  };

  // 2. အမှတ်စာရင်း အသစ်ထည့်ခြင်း
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Enrollment ID မရှိရင် (သင်တန်းမရွေးရသေးရင်) ပေးမတင်ဘူး
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
            alert("Result Added Successfully! 🎉");
            // Reset Form but keep phone
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

  // 3. Delete Function
  const handleDelete = async (id) => {
      if(!window.confirm("Delete this result?")) return;
      try {
          const res = await fetch(`https://myanedu-backend.onrender.com/admin/exams/${id}`, { method: 'DELETE' });
          if(res.ok) fetchExams();
      } catch (err) { alert("Error deleting"); }
  };

  return (
    <div>
      <h2 className="dashboard-title">📝 Exam Results Management</h2>

      {/* --- ADD NEW RESULT FORM --- */}
      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#2563eb' }}>+ Add New Result</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            
            {/* 1. Phone Input */}
            <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>Student Phone (Enter to Search)</label>
                <input 
                    type="text" 
                    placeholder="09xxxxxxxxx" 
                    className="search-input"
                    value={newResult.phone}
                    onChange={e => setNewResult({...newResult, phone: e.target.value})}
                    onBlur={handlePhoneBlur} // ကွက်လပ်ကထွက်တာနဲ့ သင်တန်းရှာမယ်
                    style={{ width: '100%', marginTop: '5px', borderColor: studentBatches.length > 0 ? '#16a34a' : '#cbd5e1' }}
                />
                {searching && <small style={{color: '#2563eb'}}>Searching courses...</small>}
            </div>

            {/* 2. Select Course (NEW) */}
            <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>Select Course</label>
                <select 
                    className="search-input"
                    value={newResult.enrollment_id}
                    onChange={e => setNewResult({...newResult, enrollment_id: e.target.value})}
                    style={{ width: '100%', marginTop: '5px' }}
                    disabled={studentBatches.length === 0}
                >
                    <option value="">-- Select Course --</option>
                    {studentBatches.map(batch => (
                        <option key={batch.enrollment_id} value={batch.enrollment_id}>
                            {batch.course_name} ({batch.batch_name})
                        </option>
                    ))}
                </select>
            </div>

            {/* 3. Exam Title (Mid-term, etc.) */}
            <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>Exam Title</label>
                <input 
                    type="text" 
                    placeholder="e.g. Mid-Term" 
                    className="search-input"
                    value={newResult.exam_title}
                    onChange={e => setNewResult({...newResult, exam_title: e.target.value})}
                    style={{ width: '100%', marginTop: '5px' }}
                />
            </div>

            {/* 4. Marks */}
            <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>Marks</label>
                <input 
                    type="number" 
                    placeholder="85" 
                    className="search-input"
                    value={newResult.marks_obtained}
                    onChange={e => setNewResult({...newResult, marks_obtained: e.target.value})}
                    style={{ width: '100%', marginTop: '5px' }}
                />
            </div>

            {/* 5. Grade */}
            <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>Grade</label>
                <select 
                    className="search-input"
                    value={newResult.grade}
                    onChange={e => setNewResult({...newResult, grade: e.target.value})}
                    style={{ width: '100%', marginTop: '5px' }}
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
            onClick={handleSubmit}
            disabled={!newResult.enrollment_id}
            style={{ 
                marginTop: '20px', 
                background: newResult.enrollment_id ? '#2563eb' : '#94a3b8', 
                color: 'white', 
                border: 'none', padding: '10px 20px', borderRadius: '8px', 
                cursor: newResult.enrollment_id ? 'pointer' : 'not-allowed', 
                fontWeight: 'bold' 
            }}
        >
            Save Result
        </button>
      </div>

      {/* --- RESULTS TABLE --- */}
      {loading ? <p>Loading...</p> : (
        <div className="table-card" style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{background: '#f1f5f9', textAlign: 'left'}}>
                <th style={{padding: '12px'}}>Student</th>
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
                      <td colSpan="6" style={{textAlign: 'center', padding: '30px', color: '#94a3b8'}}>
                          No exam results yet.
                      </td>
                  </tr>
              ) : (
                  exams.map(exam => (
                    <tr key={exam.id} style={{borderBottom: '1px solid #e2e8f0'}}>
                      <td style={{padding: '12px'}}>
                        <div style={{fontWeight: 'bold', color: '#1e293b'}}>{exam.student_name}</div>
                        <div style={{fontSize: '12px', color: '#64748b'}}>{exam.course_name} ({exam.batch_name})</div>
                      </td>
                      <td style={{fontWeight: '500'}}>{exam.exam_title}</td>
                      <td>
                          <span style={{fontWeight: 'bold'}}>{exam.marks_obtained}</span> 
                          <span style={{color: '#94a3b8', fontSize: '12px'}}> / {exam.total_marks}</span>
                      </td>
                      <td>
                        <span style={{
                            background: exam.grade === 'F' ? '#fee2e2' : '#dcfce7',
                            color: exam.grade === 'F' ? '#b91c1c' : '#166534',
                            padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', fontSize: '12px'
                        }}>
                            {exam.grade}
                        </span>
                      </td>
                      <td style={{color: '#64748b', fontSize: '13px'}}>
                          {new Date(exam.result_date).toLocaleDateString()}
                      </td>
                      <td>
                          <button 
                            onClick={() => handleDelete(exam.id)}
                            style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
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