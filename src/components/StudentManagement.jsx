import React, { useState, useEffect } from 'react';

function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // ပြင်ဆင်ရန် (Edit) အတွက် State များ
  const [editData, setEditData] = useState(null); // null ဆိုရင် Edit Modal မပေါ်ဘူး

  // Data ဆွဲထုတ်ခြင်း
  const fetchStudents = () => {
    setLoading(true);
    fetch('/https://myanedu-backend.onrender.com/students')
      .then(res => res.json())
      .then(data => {
        // ID ငယ်စဉ်ကြီးလိုက် စီပါမယ်
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
      const res = await fetch(`https://myanedu-backend.onrender.com/students/${editData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });

      if(res.ok) {
        alert("ပြင်ဆင်ခြင်း အောင်မြင်သည်!");
        setEditData(null); // Modal ပိတ်မည်
        fetchStudents();
      } else {
        alert("Update Failed");
      }
    } catch(err) { alert("Connection Error"); }
  };

  return (
    <div>
      <h2 className="dashboard-title">👨‍🎓 Student Management</h2>
      
      {loading ? <p>Loading...</p> : (
        <div className="table-card" style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{background: '#f1f5f9', textAlign: 'left'}}>
                <th style={{padding: '10px'}}>ID</th>
                <th>Name</th>
                <th>Phone (Login)</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(std => (
                <tr key={std.id} style={{borderBottom: '1px solid #e2e8f0'}}>
                  <td style={{padding: '10px'}}>#{std.id}</td>
                  <td style={{fontWeight: 'bold', color: '#1e293b'}}>{std.name}</td>
                  <td style={{color: '#2563eb'}}>{std.phone_primary}</td>
                  <td style={{color: '#64748b', fontSize: '13px'}}>{std.address}</td>
                  <td>
                    <div style={{display: 'flex', gap: '5px'}}>
                        <button 
                            onClick={() => setEditData(std)}
                            style={{background: '#f59e0b', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>
                            ✎ Edit
                        </button>
                        <button 
                            onClick={() => handleDelete(std.id)}
                            style={{background: '#dc2626', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>
                            🗑️ Delete
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{textAlign: 'center', color: '#64748b', fontSize: '12px', marginTop: '10px'}}>
             စုစုပေါင်း ကျောင်းသား ({students.length}) ဦး
          </p>
        </div>
      )}

      {/* --- Edit Modal --- */}
      {editData && (
        <div className="modal-overlay">
            <div className="modal-box" style={{width: '400px', padding: '30px'}}>
                <h3 style={{marginTop: 0}}>✏️ Edit Student Info</h3>
                <form onSubmit={handleUpdate} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                    <div>
                        <label style={{fontSize: '12px', fontWeight: 'bold'}}>Name</label>
                        <input 
                            className="search-input" style={{width: '100%'}}
                            value={editData.name} 
                            onChange={e => setEditData({...editData, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label style={{fontSize: '12px', fontWeight: 'bold'}}>Phone (Primary)</label>
                        <input 
                            className="search-input" style={{width: '100%'}}
                            value={editData.phone_primary} 
                            onChange={e => setEditData({...editData, phone_primary: e.target.value})}
                        />
                    </div>
                    <div>
                        <label style={{fontSize: '12px', fontWeight: 'bold'}}>Address</label>
                        <textarea 
                            className="search-input" style={{width: '100%'}} rows="3"
                            value={editData.address} 
                            onChange={e => setEditData({...editData, address: e.target.value})}
                        />
                    </div>
                    <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                        <button type="button" onClick={() => setEditData(null)} style={{flex: 1, padding: '10px', cursor: 'pointer'}}>Cancel</button>
                        <button type="submit" style={{flex: 1, padding: '10px', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer'}}>Update</button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}

export default StudentManagement;