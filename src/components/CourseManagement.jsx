import React, { useState, useEffect } from 'react';
import './CourseManagement.css';

function CourseManagement() {
  const [activeTab, setActiveTab] = useState('list'); 
  const [batches, setBatches] = useState([]);
  
  // Form States
  const [newCourseTitle, setNewCourseTitle] = useState(""); 
  const [batchName, setBatchName] = useState("");
  const [fees, setFees] = useState("");
  
  // Edit States
  const [editingBatch, setEditingBatch] = useState(null);

  // Dialog States
  const [dialog, setDialog] = useState({ 
      isOpen: false, 
      type: '', 
      title: '', 
      message: '',
      onConfirm: null 
  });

  const fetchData = async () => {
    try {
        const batchRes = await fetch('https://myanedu-backend.onrender.com/admin/batches');
        if (batchRes.ok) {
            const batchData = await batchRes.json();
            setBatches(batchData);
        }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const showDialog = (type, title, message, onConfirm = null) => {
      setDialog({ isOpen: true, type, title, message, onConfirm });
  };

  const closeDialog = () => {
      setDialog({ ...dialog, isOpen: false });
  };

  const handleAddBatch = async (e) => {
    e.preventDefault();
    if (!batchName || !fees || !newCourseTitle) return showDialog('error', 'Error', "အချက်အလက်များ ပြည့်စုံစွာဖြည့်ပါ");

    try {
        const courseRes = await fetch('https://myanedu-backend.onrender.com/admin/courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newCourseTitle, description: '' })
        });
        const courseData = await courseRes.json();

        const res = await fetch('https://myanedu-backend.onrender.com/admin/batches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: Date.now().toString(),
                course_id: courseData.id,
                batch_name: batchName,
                fees: fees
            })
        });

        if (res.ok) {
            showDialog('success', 'Success', "✅ အတန်းအသစ် ထည့်သွင်းပြီးပါပြီ!");
            setBatchName(""); setFees(""); setNewCourseTitle("");
            fetchData(); 
            setActiveTab('list');
        }
    } catch (err) { showDialog('error', 'Failed', "Error adding batch"); }
  };

  const confirmDelete = (id) => {
      showDialog(
          'confirm', 
          'Delete Class?', 
          "သတိပေးချက်: ဤအတန်းကိုဖျက်လိုက်လျှင် ကျောင်းသားများ၏ Main Page တွင် ချက်ချင်းပျောက်သွားပါမည်။",
          () => handleDelete(id)
      );
  };

  const handleDelete = async (id) => {
    try {
        const res = await fetch(`https://myanedu-backend.onrender.com/admin/batches/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showDialog('success', 'Deleted', "🗑️ ဖျက်ပြီးပါပြီ");
            fetchData();
        } else {
            showDialog('error', 'Cannot Delete', "မဖျက်နိုင်ပါ - ကျောင်းသားရှိနေသောကြောင့် ဖြစ်နိုင်သည်");
        }
    } catch (err) { showDialog('error', 'Error', "Error deleting"); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
        const res = await fetch(`https://myanedu-backend.onrender.com/admin/batches/${editingBatch.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                course_name: editingBatch.course_name,
                batch_name: editingBatch.batch_name,
                fees: editingBatch.fees,
                status: editingBatch.status
            })
        });

        if (res.ok) {
            setEditingBatch(null);
            showDialog('success', 'Updated', "✅ ပြင်ဆင်ပြီးပါပြီ");
            fetchData();
        }
    } catch (err) { showDialog('error', 'Error', "Error updating"); }
  };

  return (
    <div className="cm-container">
      <h2 className="cm-header">📚 သင်တန်းနှင့် အတန်းများ စီမံခန့်ခွဲခြင်း</h2>

      <div className="cm-tabs">
          <button className={`cm-tab-btn ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>
            📋 ရှိပြီးသား အတန်းများ (Manage)
          </button>
          <button className={`cm-tab-btn ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}>
            ➕ အတန်းအသစ် ထည့်ရန် (Add New)
          </button>
      </div>

      {activeTab === 'list' && (
        <div className="cm-content-area">
            <table className="cm-table">
                <thead>
                    <tr>
                        <th>Course Name</th>
                        <th>Batch Name</th>
                        <th>Fees</th>
                        <th>Status</th>
                        <th style={{textAlign:'center'}}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {batches.map(b => (
                        <tr key={b.id}>
                            <td style={{fontWeight:'bold', color:'#334155'}}>{b.course_name}</td>
                            <td>{b.batch_name}</td>
                            <td>{Number(b.fees).toLocaleString()} Ks</td>
                            <td><span className={`status-badge ${b.status}`}>{b.status}</span></td>
                            <td style={{textAlign:'center'}}>
                                <div className="action-buttons-wrapper">
                                    {/* ✅ BUTTON ICONS FIXED HERE */}
                                    <button className="icon-btn edit-btn" onClick={() => setEditingBatch(b)} title="Edit">
                                        ✏️
                                    </button>
                                    <button className="icon-btn del-btn" onClick={() => confirmDelete(b.id)} title="Delete">
                                        🗑️
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}

      {activeTab === 'add' && (
        <div className="cm-content-area">
            <div className="cm-form-card">
                <h3>အတန်းအသစ် ဖန်တီးရန်</h3>
                <form onSubmit={handleAddBatch}>
                    <div className="form-group">
                        <label>Course Name (ဘာသာရပ် ခေါင်းစဉ်):</label>
                        <input type="text" value={newCourseTitle} onChange={(e) => setNewCourseTitle(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Batch Name (အပတ်စဉ်):</label>
                        <input type="text" value={batchName} onChange={(e) => setBatchName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Fees (Ks):</label>
                        <input type="number" value={fees} onChange={(e) => setFees(e.target.value)} required />
                    </div>
                    <button type="submit" className="cm-submit-btn">အတန်းဖွင့်မည် (Create Class)</button>
                </form>
            </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingBatch && (
        <div className="cm-modal-overlay">
            <div className="cm-modal">
                <h3>Edit Class Details</h3>
                <form onSubmit={handleUpdate}>
                    <div className="form-group">
                        <label>Course Name (ခေါင်းစဉ်):</label>
                        <input 
                            type="text"
                            value={editingBatch.course_name} 
                            onChange={(e) => setEditingBatch({...editingBatch, course_name: e.target.value})} 
                            style={{fontWeight:'bold', color: '#2563eb'}}
                        />
                    </div>
                    <div className="form-group">
                        <label>Batch Name:</label>
                        <input 
                            value={editingBatch.batch_name} 
                            onChange={(e) => setEditingBatch({...editingBatch, batch_name: e.target.value})} 
                        />
                    </div>
                    <div className="form-group">
                        <label>Fees:</label>
                        <input 
                            type="number"
                            value={editingBatch.fees} 
                            onChange={(e) => setEditingBatch({...editingBatch, fees: e.target.value})} 
                        />
                    </div>
                    <div className="form-group">
                        <label>Status:</label>
                        <select 
                            value={editingBatch.status} 
                            onChange={(e) => setEditingBatch({...editingBatch, status: e.target.value})}
                        >
                            <option value="active">Active (ဖွင့်ထား)</option>
                            <option value="closed">Closed (ပိတ်ထား)</option>
                        </select>
                    </div>
                    <div className="cm-modal-actions">
                        <button type="submit" className="save-btn">Save Changes</button>
                        <button type="button" className="cancel-btn" onClick={() => setEditingBatch(null)}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {dialog.isOpen && (
        <div className="cm-dialog-overlay" onClick={closeDialog}>
            <div className="cm-dialog-box" onClick={(e) => e.stopPropagation()}>
                <div className={`cm-dialog-icon ${dialog.type}`}>
                    {dialog.type === 'success' && '✅'}
                    {dialog.type === 'error' && '❌'}
                    {dialog.type === 'confirm' && '⚠️'}
                </div>
                <h3>{dialog.title}</h3>
                <p>{dialog.message}</p>
                <div className="cm-dialog-actions">
                    {dialog.type === 'confirm' ? (
                        <>
                            <button className="cm-dialog-btn confirm" onClick={() => { dialog.onConfirm(); closeDialog(); }}>Confirm</button>
                            <button className="cm-dialog-btn cancel" onClick={closeDialog}>Cancel</button>
                        </>
                    ) : (
                        <button className="cm-dialog-btn confirm" onClick={closeDialog}>OK</button>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default CourseManagement;