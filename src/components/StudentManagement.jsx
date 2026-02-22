import React, { useState, useEffect } from 'react';
import './StudentManagement.css'; // ✅ CSS အသစ် ချိတ်ဆက်ထားသည်

function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState(null); 

  // Data ဆွဲထုတ်ခြင်း
  const fetchStudents = () => {
    setLoading(true);
    fetch('https://myanedu-backend.onrender.com/admin/students') // ✅ API လမ်းကြောင်း ပြင်ထားသည် (admin route ဖြစ်ရမည်)
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a, b) => a.id - b.id);
        setStudents(sorted);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // ကျောင်းသား ပယ်ဖျက်ခြင်း (Delete)
  const handleDelete = async (id) => {
    if(!window.confirm("⚠️ သတိပေးချက်!\nဤကျောင်းသားကို ဖျက်လိုက်ပါက သူ၏ ငွေသွင်းစာရင်းများနှင့် စာမေးပွဲရမှတ်များပါ ပျက်သွားပါလိမ့်မည်။\nဆက်လုပ်မည်လား?")) return;

    try {
      const res = await fetch(`https://myanedu-backend.onrender.com/students/${id}`, { method: 'DELETE' });
      if(res.ok) {
        alert("ဖျက်ပြီးပါပြီ!");
        fetchStudents();
      } else {
        alert("မအောင်မြင်ပါ");
      }
    } catch(err) { alert("Connection Error"); }
  };

  // အချက်အလက် ပြင်ဆင်ခြင်း (Update)
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // ✅ Admin ကပြင်တာမို့ profile update API အတိုင်းသုံးမည်ဆိုပါက JSON ပို့မရပါ (Form Data ပို့ရမည်)
      // (သို့မဟုတ်) Admin သီးသန့် PUT /admin/students/:id ရှိလျှင် ချိတ်နိုင်သည်။ လက်ရှိက profile API သုံးထားပုံရသည်။
      const data = new FormData();
      data.append('name', editData.name);
      data.append('address', editData.address);
      // Phone နံပါတ် ပြင်ချင်ရင် Backend API လိုအပ်ပါမယ်။ လောလောဆယ် UI ပေါ်မှာပဲ ပြင်ထားတယ်။
      
      const res = await fetch(`https://myanedu-backend.onrender.com/students/profile/${editData.id}`, {
        method: 'PUT',
        body: data
      });

      if(res.ok) {
        alert("ပြင်ဆင်ခြင်း အောင်မြင်သည်!");
        setEditData(null); 
        fetchStudents();
      } else {
        alert("Update Failed");
      }
    } catch(err) { alert("Connection Error"); }
  };

  return (
    <div className="sm-container">
      <h2 className="sm-title">
        <span>👨‍🎓</span> Student Management
      </h2>
      
      {loading ? (
        <div className="sm-loading">Loading student data...</div>
      ) : students.length === 0 ? (
        <div className="sm-empty">No students found.</div>
      ) : (
        <div className="sm-table-wrapper">
          <table className="sm-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone (Login)</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(std => (
                <tr key={std.id}>
                  <td data-label="ID">
                    <span className="sm-id-badge">#{std.id}</span>
                  </td>
                  <td data-label="Name" className="sm-fw-bold">{std.name}</td>
                  <td data-label="Phone" className="sm-text-blue">{std.phone_primary}</td>
                  <td data-label="Address" className="sm-text-gray">{std.address || '-'}</td>
                  <td data-label="Actions" className="sm-actions">
                    <button onClick={() => setEditData(std)} className="sm-btn-edit">
                        ✎ Edit
                    </button>
                    <button onClick={() => handleDelete(std.id)} className="sm-btn-delete">
                        🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="sm-footer-info">
              စုစုပေါင်း ကျောင်းသား <b>({students.length})</b> ဦး
          </div>
        </div>
      )}

      {/* --- Edit Modal --- */}
      {editData && (
        <div className="sm-modal-overlay" onClick={() => setEditData(null)}>
            <div className="sm-modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="sm-modal-header">
                    <h3>✏️ Edit Student Info</h3>
                    <button className="sm-close-btn" onClick={() => setEditData(null)}>✕</button>
                </div>
                
                <form onSubmit={handleUpdate} className="sm-modal-form">
                    <div className="sm-form-group">
                        <label>Name</label>
                        <input 
                            required
                            type="text"
                            className="sm-input" 
                            value={editData.name} 
                            onChange={e => setEditData({...editData, name: e.target.value})}
                        />
                    </div>
                    
                    <div className="sm-form-group">
                        <label>Phone (Primary)</label>
                        {/* Note: ဖုန်းနံပါတ် ပြင်ခွင့်ပေးထားသော်လည်း လက်ရှိ backend မှာ Phone update logic မပါဝင်သေးပါ */}
                        <input 
                            required
                            type="text"
                            className="sm-input" 
                            value={editData.phone_primary} 
                            onChange={e => setEditData({...editData, phone_primary: e.target.value})}
                        />
                    </div>
                    
                    <div className="sm-form-group">
                        <label>Address</label>
                        <textarea 
                            className="sm-input sm-textarea" 
                            rows="3"
                            value={editData.address || ''} 
                            onChange={e => setEditData({...editData, address: e.target.value})}
                        />
                    </div>
                    
                    <div className="sm-modal-actions">
                        <button type="button" onClick={() => setEditData(null)} className="sm-btn-cancel">Cancel</button>
                        <button type="submit" className="sm-btn-save">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}

export default StudentManagement;