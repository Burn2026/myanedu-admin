import React, { useState, useEffect } from 'react';

function LessonManagement() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false); 

  const [formData, setFormData] = useState({
    title: "",
    description: ""
  });
  const [videoFile, setVideoFile] = useState(null); 

  useEffect(() => {
    fetch('https://myanedu-backend.onrender.com/public/batches')
      .then(res => res.json())
      .then(data => setBatches(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (!selectedBatch) return;
    fetchLessons();
  }, [selectedBatch]);

  const fetchLessons = () => {
    setLoading(true);
    fetch(`https://myanedu-backend.onrender.com/public/lessons?batch_id=${selectedBatch}`)
      .then(res => res.json())
      .then(data => {
        setLessons(data);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBatch) return alert("ကျေးဇူးပြု၍ အတန်း (Batch) ရွေးချယ်ပါ");
    if (!videoFile) return alert("Video File ရွေးချယ်ပေးပါ");

    setUploading(true); 

    try {
      const data = new FormData();
      data.append('batch_id', selectedBatch);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('video_file', videoFile); 

      const res = await fetch('https://myanedu-backend.onrender.com/admin/lessons', {
        method: 'POST',
        body: data 
      });
      
      const responseJson = await res.json(); 

      if (res.ok) {
        alert("✅ ဗီဒီယို တင်ခြင်း အောင်မြင်ပါသည်!");
        setFormData({ title: "", description: "" });
        setVideoFile(null);
        document.getElementById('videoInput').value = ""; 
        fetchLessons();
      } else {
        alert(`Upload Failed: ${responseJson.message || "Something went wrong"}`);
      }
    } catch (err) { 
        alert("Connection Error (Server Unreachable or Timeout). ဖိုင်ကြီးလွန်း၍ ကြာချိန်ပိုလိုအပ်နေခြင်း ဖြစ်နိုင်ပါသည်။"); 
    } finally { 
        setUploading(false); 
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure?")) return;
    await fetch(`https://myanedu-backend.onrender.com/admin/lessons/${id}`, { method: 'DELETE' });
    fetchLessons();
  };

  return (
    <div>
      <h2 className="dashboard-title">📺 Upload Video Lessons</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* --- Form --- */}
        <div>
          <div className="table-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <h3 style={{ marginTop: 0, color: '#334155' }}>Step 1: Select Class</h3>
            <select 
                className="search-input" 
                style={{ width: '100%', marginBottom: '20px' }}
                value={selectedBatch}
                onChange={e => setSelectedBatch(e.target.value)}
            >
                <option value="">-- အတန်း ရွေးချယ်ပါ --</option>
                {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.course_name} - {b.batch_name}</option>
                ))}
            </select>

            <h3 style={{ marginTop: '20px', color: '#334155' }}>Step 2: Upload Video</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label style={{fontWeight: 'bold', fontSize: '12px'}}>Lesson Title</label>
                    <input required className="search-input" style={{width: '100%'}} placeholder="e.g. Chapter 1"
                        value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                
                <div>
                    <label style={{fontWeight: 'bold', fontSize: '12px'}}>Select Video File (MP4)</label>
                    <input 
                        required 
                        id="videoInput"
                        type="file" 
                        accept="video/*"
                        className="search-input" 
                        style={{width: '100%', padding: '10px'}} 
                        onChange={e => setVideoFile(e.target.files[0])}
                    />
                </div>

                <div>
                    <label style={{fontWeight: 'bold', fontSize: '12px'}}>Description</label>
                    <textarea className="search-input" style={{width: '100%'}} rows="4"
                        value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>

                <button 
                    type="submit" 
                    className="search-btn" 
                    disabled={!selectedBatch || uploading}
                    style={{ opacity: uploading ? 0.7 : 1 }}
                > 
                    {uploading ? "Uploading Video... (Please Wait)" : "Upload Lesson"} 
                </button>
            </form>
          </div>
        </div>

        {/* --- List --- */}
        <div>
           <h3 style={{ marginTop: 0 }}>Existing Lessons</h3>
           {!selectedBatch && <p style={{color: '#64748b'}}>Please select a class to see lessons.</p>}
           
           {selectedBatch && (
             loading ? <p>Loading...</p> : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                 {lessons.length === 0 && <p style={{color: '#64748b'}}>No lessons uploaded yet.</p>}
                 {lessons.map((lesson, idx) => (
                    <div key={lesson.id} style={{ background: 'white', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{fontWeight: 'bold', color: '#2563eb'}}>Lesson {idx + 1}: {lesson.title}</div>
                            <div style={{fontSize: '11px', color: '#64748b', marginTop: '5px'}}>
                                📁 {lesson.video_url.split('/').pop()} 
                            </div>
                        </div>
                        <button onClick={() => handleDelete(lesson.id)} style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>
                            Delete
                        </button>
                    </div>
                 ))}
               </div>
             )
           )}
        </div>

      </div>
    </div>
  );
}

export default LessonManagement;