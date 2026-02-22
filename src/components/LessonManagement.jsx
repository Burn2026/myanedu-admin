import React, { useState, useEffect, useRef } from 'react';
import './LessonManagement.css'; 

function LessonManagement() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false); 
  const [uploadProgress, setUploadProgress] = useState(0); 
  
  // ✅ 1. Premium Success Dialog အတွက် State
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const xhrRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    description: ""
  });
  const [videoFile, setVideoFile] = useState(null); 

  useEffect(() => {
    fetch('https://myanedu-backend.onrender.com/admin/batches')
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
    fetch(`https://myanedu-backend.onrender.com/students/lessons?batch_id=${selectedBatch}`)
      .then(res => {
          if (!res.ok) throw new Error("Network response was not ok");
          return res.json();
      })
      .then(data => {
        setLessons(data);
        setLoading(false);
      })
      .catch(err => {
          console.error("Fetch lessons error:", err);
          setLessons([]); 
          setLoading(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedBatch) return alert("ကျေးဇူးပြု၍ အတန်း (Batch) ရွေးချယ်ပါ");
    if (!videoFile) return alert("Video File ရွေးချယ်ပေးပါ");

    setUploading(true); 
    setUploadProgress(0); 

    const data = new FormData();
    data.append('batch_id', selectedBatch);
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('video_file', videoFile); 

    xhrRef.current = new XMLHttpRequest();
    const xhr = xhrRef.current;

    xhr.open('POST', 'https://myanedu-backend.onrender.com/admin/lessons', true);

    xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentComplete);
        }
    };

    xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
            // ✅ 2. ရိုးရိုး alert အစား Premium Dialog ဖွင့်မည်
            setShowSuccessModal(true);
            
            setFormData({ title: "", description: "" });
            setVideoFile(null);
            document.getElementById('videoInput').value = ""; 
            fetchLessons();
            
            fetch('https://myanedu-backend.onrender.com/admin/batches')
              .then(res => res.json())
              .then(data => setBatches(data));

        } else {
            let errorMsg = "Something went wrong";
            try {
                const resJson = JSON.parse(xhr.responseText);
                errorMsg = resJson.message || errorMsg;
            } catch(e) {}
            alert(`Upload Failed: ${errorMsg}`);
        }
        setUploading(false);
        setUploadProgress(0);
        xhrRef.current = null;
    };

    xhr.onerror = () => {
        alert("Connection Error (Server Unreachable or Timeout)."); 
        setUploading(false);
        setUploadProgress(0);
        xhrRef.current = null;
    };

    xhr.onabort = () => {
        setUploading(false);
        setUploadProgress(0);
        xhrRef.current = null;
    };

    xhr.send(data); 
  };

  const handleCancelUpload = () => {
      if (xhrRef.current) {
          xhrRef.current.abort(); 
      }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure?")) return;
    await fetch(`https://myanedu-backend.onrender.com/admin/lessons/${id}`, { method: 'DELETE' });
    fetchLessons();
    
    fetch('https://myanedu-backend.onrender.com/admin/batches')
      .then(res => res.json())
      .then(data => setBatches(data));
  };

  const extractFileName = (url) => {
    if (!url) return "Unknown File";
    const parts = url.split('/');
    return parts[parts.length - 1];
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
                disabled={uploading}
            >
                <option value="">-- အတန်း ရွေးချယ်ပါ --</option>
                {batches.map(b => (
                    <option key={b.id} value={b.id}>
                        {b.course_name} - {b.batch_name} ({b.lesson_count || 0} Lessons)
                    </option>
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
                        disabled={uploading}
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
                        disabled={uploading}
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
                        disabled={uploading}
                    />
                </div>

                {uploading && (
                    <div className="lm-progress-container">
                        <div 
                            className="lm-progress-bar" 
                            style={{ width: `${uploadProgress}%` }}
                        >
                            {uploadProgress > 5 ? `${uploadProgress}%` : ''}
                        </div>
                    </div>
                )}

                {uploading ? (
                    <button 
                        type="button" 
                        onClick={handleCancelUpload}
                        className="lm-btn-cancel-upload"
                    > 
                        ❌ Cancel
                    </button>
                ) : (
                    <button 
                        type="submit" 
                        className="lm-btn-submit" 
                        disabled={!selectedBatch}
                    > 
                        📤 Upload Lesson 
                    </button>
                )}
            </form>
          </div>
        </div>

        {/* --- Right: List Section --- */}
        <div className="lm-list-section">
           <div className="lm-list-header">
               <h3>Existing Lessons</h3>
               <span className="lm-badge">
                   {selectedBatch ? `${lessons.length} Lessons` : "0 Lessons"}
               </span>
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

      {/* ✅ 3. PREMIUM SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="lm-modal-overlay">
          <div className="lm-modal-content">
            <div className="lm-modal-icon">✅</div>
            <h3 className="lm-modal-title">အောင်မြင်ပါသည်</h3>
            <p className="lm-modal-text">သင်ခန်းစာ ဗီဒီယိုကို အောင်မြင်စွာ တင်ပြီးပါပြီ။</p>
            <button 
                className="lm-modal-btn" 
                onClick={() => setShowSuccessModal(false)}
            >
                OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default LessonManagement;