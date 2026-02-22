import React, { useState, useEffect } from 'react';
import './LessonManagement.css'; // ✅ CSS ဖိုင်အသစ် ချိတ်ဆက်ထားသည်

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

  // Helper Function for File Name
  const extractFileName = (url) => {
    if (!url) return "Unknown File";
    const parts = url.split('/');
    const fullFileName = parts[parts.length - 1];
    // Remove query params or extra string if needed, keeping it simple here
    return fullFileName;
  };

  return (
    <div className="lm-container">
      <h2 className="lm-title">
        <span>📺</span> Upload Video Lessons
      </h2>

      <div className="lm-grid">
        
        {/* --- Left: Form Section --- */}
        <div className="lm-card">
          <div className="lm-card-header">
            <h3>Step 1: Select Class</h3>
            <select 
                className="lm-select" 
                value={selectedBatch}
                onChange={e => setSelectedBatch(e.target.value)}
            >
                <option value="">-- အတန်း ရွေးချယ်ပါ --</option>
                {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.course_name} - {b.batch_name}</option>
                ))}
            </select>
          </div>

          <div className="lm-card-body">
            <h3>Step 2: Upload Video</h3>
            <form onSubmit={handleSubmit} className="lm-form">
                
                <div className="lm-form-group">
                    <label>Lesson Title <span>*</span></label>
                    <input 
                        required 
                        type="text"
                        className="lm-input" 
                        placeholder="e.g. Chapter 1: Introduction"
                        value={formData.title} 
                        onChange={e => setFormData({...formData, title: e.target.value})} 
                    />
                </div>
                
                <div className="lm-form-group">
                    <label>Select Video File (MP4, MKV) <span>*</span></label>
                    <input 
                        required 
                        id="videoInput"
                        type="file" 
                        accept="video/*"
                        className="lm-file-input" 
                        onChange={e => setVideoFile(e.target.files[0])}
                    />
                </div>

                <div className="lm-form-group">
                    <label>Description (Optional)</label>
                    <textarea 
                        className="lm-input lm-textarea" 
                        rows="3"
                        placeholder="Brief summary of the lesson..."
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})} 
                    />
                </div>

                <button 
                    type="submit" 
                    className="lm-btn-submit" 
                    disabled={!selectedBatch || uploading}
                > 
                    {uploading ? "⏳ Uploading Video... (Please Wait)" : "📤 Upload Lesson"} 
                </button>
            </form>
          </div>
        </div>

        {/* --- Right: List Section --- */}
        <div className="lm-list-section">
           <div className="lm-list-header">
               <h3>Existing Lessons</h3>
               <span className="lm-badge">{lessons.length} Lessons</span>
           </div>
           
           <div className="lm-list-body">
               {!selectedBatch && (
                   <div className="lm-empty-state">
                       Please select a class from the left to see lessons.
                   </div>
               )}
               
               {selectedBatch && (
                 loading ? <div className="lm-loading">Loading lessons...</div> : (
                   <div className="lm-lessons-container">
                     {lessons.length === 0 && (
                         <div className="lm-empty-state">No lessons uploaded for this class yet.</div>
                     )}
                     
                     {lessons.map((lesson, idx) => (
                        <div key={lesson.id} className="lm-lesson-item">
                            <div className="lm-lesson-info">
                                <div className="lm-lesson-title">
                                    <span className="lm-lesson-num">{idx + 1}</span>
                                    {lesson.title}
                                </div>
                                <div className="lm-lesson-file">
                                    <span className="lm-icon">📁</span> {extractFileName(lesson.video_url)} 
                                </div>
                            </div>
                            <button onClick={() => handleDelete(lesson.id)} className="lm-btn-delete" title="Delete Lesson">
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
    </div>
  );
}

export default LessonManagement;