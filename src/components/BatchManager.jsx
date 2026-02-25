import React, { useState, useEffect } from 'react';
import './BatchManager.css'; 

function BatchManager() {
  const [batches, setBatches] = useState([]);
  const [editingBatch, setEditingBatch] = useState(null);
  const [formData, setFormData] = useState({ batch_name: '', fees: '', status: 'active' });

  const fetchBatches = async () => {
    try {
      const res = await fetch('https://myanedu-backend.onrender.com/admin/batches');
      const data = await res.json();
      setBatches(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchBatches(); }, []);

  // Delete Function
  const handleDelete = async (id) => {
    if (!window.confirm("ဤအတန်းကို တကယ်ဖျက်မည်လား?")) return;
    try {
        const res = await fetch(`https://myanedu-backend.onrender.com/admin/batches/${id}`, { method: 'DELETE' });
        if (res.ok) {
            alert("ဖျက်ပြီးပါပြီ");
            fetchBatches();
        } else {
            alert("ဤအတန်းတွင် ကျောင်းသားများ ရှိနေနိုင်ပါသည်။");
        }
    } catch (err) { alert("Server Error"); }
  };

  // Edit Click
  const handleEditClick = (batch) => {
    setEditingBatch(batch);
    setFormData({ batch_name: batch.batch_name, fees: batch.fees, status: batch.status });
  };

  // Save Update
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
        const res = await fetch(`https://myanedu-backend.onrender.com/admin/batches/${editingBatch.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if (res.ok) {
            alert("ပြင်ဆင်ပြီးပါပြီ");
            setEditingBatch(null);
            fetchBatches();
        }
    } catch (err) { alert("Error Updating"); }
  };

  return (
    <div className="bm-container">
      <h2>📚 အတန်းများ စီမံခန့်ခွဲရန် (Batch Manager)</h2>
      
      {/* Edit Form Modal */}
      {editingBatch && (
          <div className="bm-modal-overlay">
            <div className="bm-modal">
              <h3>Edit: {editingBatch.course_name}</h3>
              <form onSubmit={handleUpdate} className="bm-form">
                  <label>Batch Name:</label>
                  <input type="text" value={formData.batch_name} onChange={e => setFormData({...formData, batch_name: e.target.value})} />
                  
                  <label>Fees (Ks):</label>
                  <input type="number" value={formData.fees} onChange={e => setFormData({...formData, fees: e.target.value})} />
                  
                  <label>Status:</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="active">Active (ဖွင့်ထား)</option>
                      <option value="closed">Closed (ပိတ်ထား)</option>
                  </select>
                  
                  <div className="bm-actions">
                    <button type="submit" className="bm-btn save">Save Changes</button>
                    <button type="button" onClick={() => setEditingBatch(null)} className="bm-btn cancel">Cancel</button>
                  </div>
              </form>
            </div>
          </div>
      )}

      <table className="bm-table">
        <thead>
            <tr>
                <th>Course</th>
                <th>Batch</th>
                <th>Fees</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {batches.map(b => (
                <tr key={b.id}>
                    <td>{b.course_name}</td>
                    <td>{b.batch_name}</td>
                    <td>{Number(b.fees).toLocaleString()} Ks</td>
                    <td><span className={`status-badge ${b.status}`}>{b.status}</span></td>
                    <td>
                        <button onClick={() => handleEditClick(b)} className="bm-icon-btn edit">✏️</button>
                        <button onClick={() => handleDelete(b.id)} className="bm-icon-btn del">🗑️</button>
                    </td>
                </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default BatchManager;