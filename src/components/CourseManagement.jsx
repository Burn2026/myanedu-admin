import { useState, useEffect } from 'react';

function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  
  const [selectedCourse, setSelectedCourse] = useState("");
  const [batchName, setBatchName] = useState("");
  const [batchFees, setBatchFees] = useState("");

  // Backend URL (Render Link)
  const API_URL = "https://myanedu-backend.onrender.com";

  // ၁။ ရှိပြီးသား Course များကို ဆွဲထုတ်ခြင်း
  useEffect(() => {
    fetch(`${API_URL}/public/promo-courses`) // သို့မဟုတ် admin route သုံးနိုင်သည်
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error("Error fetching courses:", err));
  }, []);

  // ၂။ Course အသစ် ဖန်တီးခြင်း
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/admin/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: courseTitle, description: courseDesc }),
      });
      if (res.ok) {
        alert("Course Created Successfully!");
        window.location.reload();
      } else {
        alert("Failed to create course");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ၃။ Batch အသစ် ဖန်တီးခြင်း
  const handleCreateBatch = async (e) => {
    e.preventDefault();
    try {
      // Batch ID ကို unique ဖြစ်အောင် auto ပေးပါမည် (ဥပမာ - C1-B1)
      const batchId = `${selectedCourse}-${batchName.replace(/\s/g, '')}`; 
      
      const res = await fetch(`${API_URL}/admin/batches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: batchId,
          course_id: selectedCourse,
          batch_name: batchName,
          fees: batchFees
        }),
      });
      if (res.ok) {
        alert("Batch Created Successfully!");
        setBatchName("");
        setBatchFees("");
      } else {
        alert("Failed to create batch");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Manage Courses & Batches</h2>

      {/* --- Create Course Section --- */}
      <div className="mb-8 p-4 border rounded shadow bg-white">
        <h3 className="font-semibold mb-2">1. Create New Course</h3>
        <form onSubmit={handleCreateCourse} className="space-y-2">
          <input 
            type="text" placeholder="Course Title (e.g. English)" 
            className="border p-2 w-full"
            value={courseTitle} onChange={e => setCourseTitle(e.target.value)} required 
          />
          <input 
            type="text" placeholder="Description" 
            className="border p-2 w-full"
            value={courseDesc} onChange={e => setCourseDesc(e.target.value)} 
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Course</button>
        </form>
      </div>

      {/* --- Create Batch Section --- */}
      <div className="p-4 border rounded shadow bg-white">
        <h3 className="font-semibold mb-2">2. Create New Batch</h3>
        <form onSubmit={handleCreateBatch} className="space-y-2">
          <select 
            className="border p-2 w-full"
            value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} required
          >
            <option value="">-- Select Course --</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>

          <input 
            type="text" placeholder="Batch Name (e.g. Batch 1)" 
            className="border p-2 w-full"
            value={batchName} onChange={e => setBatchName(e.target.value)} required 
          />
          <input 
            type="number" placeholder="Fees (e.g. 50000)" 
            className="border p-2 w-full"
            value={batchFees} onChange={e => setBatchFees(e.target.value)} required 
          />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Add Batch</button>
        </form>
      </div>
    </div>
  );
}

export default CourseManagement;