import React, { useState, useEffect } from 'react';

function DiscussionManager() {
  const [discussions, setDiscussions] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Discussion ရှိသော Lesson များကို ဆွဲယူခြင်း
  const fetchDiscussions = async () => {
    try {
      const res = await fetch('https://myanedu-backend.onrender.com/admin/discussions');
      if (res.ok) {
        const data = await res.json();
        setDiscussions(data);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchDiscussions();
    const interval = setInterval(fetchDiscussions, 5000); // 5 စက္ကန့်တစ်ကြိမ် Refresh (Faster Update)
    return () => clearInterval(interval);
  }, []);

  // 2. Lesson တစ်ခုကို ရွေးလိုက်ရင် Chat တွေကို ဆွဲယူခြင်း
  const loadChat = async (lesson) => {
    setSelectedLesson(lesson);
    try {
      const res = await fetch(`https://myanedu-backend.onrender.com/admin/comments?lesson_id=${lesson.id}`);
      if (res.ok) {
        const data = await res.json();
        setChatHistory(data);
      }
    } catch (err) { console.error(err); }
  };

  // 3. Admin စာပြန်ခြင်း
  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim() || !selectedLesson) return;

    setLoading(true);
    try {
      const res = await fetch('https://myanedu-backend.onrender.com/admin/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lesson_id: selectedLesson.id,
          message: reply
        })
      });

      if (res.ok) {
        setReply("");
        loadChat(selectedLesson); // Chat ပြန် Refresh လုပ်
      }
    } catch (err) {
      alert("Failed to send reply");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '80vh', gap: '20px' }}>
      
      {/* Sidebar: List of Discussions */}
      <div style={{ width: '320px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '15px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>
          💬 Inbox ({discussions.length})
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {discussions.map(d => (
            <div 
              key={d.id} 
              onClick={() => loadChat(d)}
              style={{ 
                padding: '15px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                background: selectedLesson?.id === d.id ? '#eff6ff' : 'white',
                borderLeft: selectedLesson?.id === d.id ? '4px solid #2563eb' : '4px solid transparent'
              }}
            >
              {/* (UPDATED) Course & Batch Info */}
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                 {d.course_name} • {d.batch_name}
              </div>
              
              {/* Lesson Title */}
              <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>
                 📺 {d.lesson_title}
              </div>
              
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '5px' }}>
                 {d.total_comments} message(s)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedLesson ? (
          <>
            {/* Chat Header showing Details */}
            <div style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
               <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>
                  {selectedLesson.course_name} / {selectedLesson.batch_name}
               </div>
               <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2563eb' }}>
                  Topic: {selectedLesson.lesson_title}
               </div>
            </div>
            
            {/* Messages */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', background: '#f1f5f9' }}>
              {chatHistory.map(c => (
                <div key={c.id} style={{ 
                    alignSelf: c.user_role === 'admin' ? 'flex-end' : 'flex-start',
                    maxWidth: '70%',
                    display: 'flex', flexDirection: 'column', 
                    alignItems: c.user_role === 'admin' ? 'flex-end' : 'flex-start' 
                }}>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                        {c.user_role === 'admin' ? 'You' : `👤 ${c.user_name}`}
                    </div>
                    <div style={{
                        background: c.user_role === 'admin' ? '#2563eb' : 'white',
                        color: c.user_role === 'admin' ? 'white' : '#1e293b',
                        padding: '12px 16px', borderRadius: '12px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                        borderTopLeftRadius: c.user_role === 'student' ? '0' : '12px',
                        borderTopRightRadius: c.user_role === 'admin' ? '0' : '12px',
                    }}>
                        {c.message}
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                        {new Date(c.created_at).toLocaleTimeString()}
                    </div>
                </div>
              ))}
            </div>

            {/* Reply Box */}
            <form onSubmit={handleReply} style={{ padding: '20px', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                value={reply}
                onChange={e => setReply(e.target.value)}
                placeholder="Type your reply..."
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
              />
              <button 
                type="submit" 
                disabled={loading}
                style={{ background: '#2563eb', color: 'white', border: 'none', padding: '0 25px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', flexDirection: 'column' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>💬</div>
            <p>ဘယ်ဘက်ခြမ်းမှ ဆွေးနွေးမှုတစ်ခုကို ရွေးချယ်ပါ</p>
          </div>
        )}
      </div>

    </div>
  );
}

export default DiscussionManager;