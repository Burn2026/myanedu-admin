import React, { useState, useEffect } from 'react';
import './CourseManagement.css';

function CourseManagement() {
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'add'
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]); // Course Titles for Dropdown
  
  // Form States
  const [newCourseTitle, setNewCourseTitle] = useState(""); // For creating brand new course
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [batchName, setBatchName] = useState("");
  const [fees, setFees] = useState("");
  
  // Edit States
  const [editingBatch, setEditingBatch] = useState(null);

  // 1. Fetch Data
  const fetchData = async () => {
    try {
        // Fetch Batches
        const batchRes = await fetch('https://myanedu-backend.onrender.com/admin/batches');
        if (batchRes.ok) {
            const batchData = await batchRes.json();
            setBatches(batchData);
        }
        
        // Fetch All Courses (for dropdown) - Backend မှာ ဒီ route မရှိရင် Create လုပ်ဖို့လိုနိုင်သည်
        // လောလောဆယ် batches ထဲက course တွေကို unique ယူပြီးပြမယ် (သို့) manual manage လုပ်မယ်
        // ဒီနေရာမှာ အဆင်ပြေအောင် Backend က /admin/batches ကနေပဲ data ယူသုံးထားပါတယ်
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  // 2. Handle Add New Batch
  const handleAddBatch = async (e) => {
    e.preventDefault();

    if (!batchName || !fees) return alert("အချက်အလက်များ ပြည့်စုံစွာဖြည့်ပါ");

    try {
        // Step A: Course အသစ်အရင်ဆောက်မလား၊ ရှိပြီးသားရွေးမလား
        let finalCourseId = selectedCourseId;

        if (!selectedCourseId && newCourseTitle) {
            // Course အသစ်ဆောက်ခြင်း API
            const courseRes = await fetch('https://myanedu-backend.onrender.com/admin/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newCourseTitle, description: '' })
            });
            const courseData = await courseRes.json();
            finalCourseId = courseData.id;
        }

        if (!finalCourseId) return alert("Course ရွေးချယ်ပါ သို့မဟုတ် အသစ်ထည့်ပါ");

        // Step B: Batch အသစ်ဆောက်ခြင်း
        const res = await fetch('https://myanedu-backend.onrender.com/admin/batches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: Date.now().toString(), // Simple ID gen
                course_id: finalCourseId,
                batch_name: batchName,
                fees: fees
            })
        });

        if (res.ok) {
            alert("✅ အတန်းအသစ် ထည့်သွင်းပြီးပါပြီ!");
            setBatchName("");
            setFees("");
            setNewCourseTitle("");
            fetchData(); // Refresh List
            setActiveTab('list'); // List ဘက်ကို ပြန်သွားမယ်
        }
    } catch (err) { alert("Error adding batch"); }
  };

  // 3. Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("သတိပေးချက်: ဤအတန်းကိုဖျက်လိုက်လျှင် ကျောင်းသားများ၏ Main Page တွင် ချက်ချင်းပျောက်သွားပါမည်။ ဖျက်မည်လား?")) return;

    try {
        const res = await fetch(`https://myanedu-backend.onrender.com/admin/batches/${id}`, {
            method: 'DELETE'
        });
        if (res.ok) {
            alert("🗑️ ဖျက်ပြီးပါပြီ");
            fetchData();
        } else {
            alert("မဖျက်နိုင်ပါ - ကျောင်းသားရှိနေသောကြောင့် ဖြစ်နိုင်သည်");
        }
    } catch (err) { alert("Error deleting"); }
  };

  // 4. Handle Edit
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
        const res = await fetch(`https://myanedu-backend.onrender.com/admin/batches/${editingBatch.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                batch_name: editingBatch.batch_name,
                fees: editingBatch.fees,
                status: editingBatch.status
            })
        });

        if (res.ok) {
            alert("✅ ပြင်ဆင်ပြီးပါပြီ");
            setEditingBatch(null);
            fetchData();
        }
    } catch (err) { alert("Error updating"); }
  };

  return (
    <div className="cm-container">
      <h2 className="cm-header">📚 သင်တန်းနှင့် အတန်းများ စီမံခန့်ခွဲခြင်း</h2>

      {/* Tab Navigation */}
      <div className="cm-tabs">
          <button 
            className={`cm-tab-btn ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            📋 ရှိပြီးသား အတန်းများ (Manage)
          </button>
          <button 
            className={`cm-tab-btn ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            ➕ အတန်းအသစ် ထည့်ရန် (Add New)
          </button>
      </div>

      {/* --- SECTION 1: MANAGE LIST --- */}
      {activeTab === 'list' && (
        <div className="cm-content-area">
            <table className="cm-table">
                <thead>
                    <tr>
                        <th>Course Name</th>
                        <th>Batch Name</th>
                        <th>Fees (Ks)</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {batches.map(b => (
                        <tr key={b.id}>
                            <td>{b.course_name}</td>
                            <td>{b.batch_name}</td>
                            <td>{Number(b.fees).toLocaleString()}</td>
                            <td>
                                <span className={`status-badge ${b.status}`}>{b.status}</span>
                            </td>
                            <td>
                                <button className="cm-action-btn edit" onClick={() => setEditingBatch(b)}>✏️ Edit</button>
                                <button className="cm-action-btn del" onClick={() => handleDelete(b.id)}>🗑️ Del</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}

      {/* --- SECTION 2: ADD NEW --- */}
      {activeTab === 'add' && (
        <div className="cm-content-area">
            <div className="cm-form-card">
                <h3>အတန်းအသစ် ဖန်တီးရန်</h3>
                <form onSubmit={handleAddBatch}>
                    <div className="form-group">
                        <label>Course Name (ဘာသာရပ် ခေါင်းစဉ်):</label>
                        {/* Course အသစ်ရိုက်ထည့်ရန် (သို့) ID ထည့်ရန် ရိုးရှင်းသောနည်းလမ်း */}
                        <input 
                            type="text" 
                            placeholder="ဥပမာ - Basic English / Korean Level 1"
                            value={newCourseTitle}
                            onChange={(e) => setNewCourseTitle(e.target.value)}
                            required
                        />
                        <small className="hint-text">* ရှိပြီးသား Course တွင်ထပ်ပေါင်းလိုပါက နာမည်တူပြန်ရိုက်ထည့်ပါ (Backend logic ပေါ်မူတည်သည်)</small>
                    </div>

                    <div className="form-group">
                        <label>Batch Name (အပတ်စဉ်):</label>
                        <input 
                            type="text" 
                            placeholder="ဥပမာ - Batch 5 (Mon-Wed)"
                            value={batchName}
                            onChange={(e) => setBatchName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Fees (သင်တန်းကြေး - ကျပ်):</label>
                        <input 
                            type="number" 
                            placeholder="30000"
                            value={fees}
                            onChange={(e) => setFees(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="cm-submit-btn">အတန်းဖွင့်မည် (Create Class)</button>
                </form>
            </div>
        </div>
      )}

      {/* --- EDIT MODAL POPUP --- */}
      {editingBatch && (
        <div className="cm-modal-overlay">
            <div className="cm-modal">
                <h3>Edit Class</h3>
                <form onSubmit={handleUpdate}>
                    <label>Batch Name:</label>
                    <input 
                        value={editingBatch.batch_name} 
                        onChange={(e) => setEditingBatch({...editingBatch, batch_name: e.target.value})} 
                    />
                    
                    <label>Fees:</label>
                    <input 
                        type="number"
                        value={editingBatch.fees} 
                        onChange={(e) => setEditingBatch({...editingBatch, fees: e.target.value})} 
                    />

                    <label>Status (Active မှ ကျောင်းသားများမြင်ရမည်):</label>
                    <select 
                        value={editingBatch.status} 
                        onChange={(e) => setEditingBatch({...editingBatch, status: e.target.value})}
                    >
                        <option value="active">Active (ဖွင့်ထား)</option>
                        <option value="closed">Closed (ပိတ်ထား)</option>
                        <option value="hidden">Hidden (ဖျောက်ထား)</option>
                    </select>

                    <div className="cm-modal-actions">
                        <button type="submit" className="save-btn">Save Changes</button>
                        <button type="button" className="cancel-btn" onClick={() => setEditingBatch(null)}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}

export default CourseManagement;