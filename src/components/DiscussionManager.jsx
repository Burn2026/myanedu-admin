import React, { useState, useEffect } from 'react';
import './DiscussionManager.css'; // ✅ CSS အသစ် ချိတ်ဆက်ထားသည်

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
    const interval = setInterval(fetchDiscussions, 5000); // 5 စက္ကန့်တစ်ကြိမ် Refresh 
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
    <div className="dm-container">
      <h2 className="dm-title">
        <span>💬</span> Discussion Manager
      </h2>

      <div className="dm-layout">
        
        {/* --- Sidebar: List of Discussions --- */}
        {/* ဖုန်းတွင် Chat ရွေးထားပါက Sidebar ကို ဖျောက်ထားမည် */}
        <div className={`dm-sidebar ${selectedLesson ? 'dm-hidden-mobile' : ''}`}>
          <div className="dm-sidebar-header">
            📬 Inbox ({discussions.length})
          </div>
          <div className="dm-sidebar-list">
            {discussions.length === 0 ? (
                <div className="dm-empty-list">No discussions yet.</div>
            ) : (
                discussions.map(d => (
                <div 
                    key={d.id} 
                    onClick={() => loadChat(d)}
                    className={`dm-list-item ${selectedLesson?.id === d.id ? 'active' : ''}`}
                >
                    <div className="dm-item-course">
                        {d.course_name} • {d.batch_name}
                    </div>
                    <div className="dm-item-title">
                        📺 {d.lesson_title}
                    </div>
                    <div className="dm-item-count">
                        {d.total_comments} message(s)
                    </div>
                </div>
                ))
            )}
          </div>
        </div>

        {/* --- Main Chat Area --- */}
        {/* ဖုန်းတွင် Chat မရွေးရသေးပါက Chat Area ကို ဖျောက်ထားမည် */}
        <div className={`dm-chat-area ${!selectedLesson ? 'dm-hidden-mobile' : ''}`}>
          {selectedLesson ? (
            <>
              {/* Chat Header showing Details */}
              <div className="dm-chat-header">
                 {/* (Mobile Only) Back Button */}
                 <button className="dm-back-btn" onClick={() => setSelectedLesson(null)}>
                     ⬅ Back
                 </button>
                 <div className="dm-chat-info">
                     <div className="dm-chat-course">
                        {selectedLesson.course_name} / {selectedLesson.batch_name}
                     </div>
                     <div className="dm-chat-title">
                        Topic: {selectedLesson.lesson_title}
                     </div>
                 </div>
              </div>
              
              {/* Messages */}
              <div className="dm-chat-messages">
                {chatHistory.length === 0 ? (
                    <div className="dm-empty-chat">No messages in this discussion yet.</div>
                ) : (
                    chatHistory.map(c => (
                    <div key={c.id} className={`dm-message-row ${c.user_role === 'admin' ? 'is-admin' : 'is-student'}`}>
                        <div className="dm-message-sender">
                            {c.user_role === 'admin' ? 'You' : `👤 ${c.user_name}`}
                        </div>
                        <div className="dm-message-bubble">
                            {c.message}
                        </div>
                        <div className="dm-message-time">
                            {new Date(c.created_at).toLocaleTimeString()}
                        </div>
                    </div>
                    ))
                )}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleReply} className="dm-reply-form">
                <input 
                  type="text" 
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  placeholder="Type your reply..."
                  className="dm-input"
                />
                <button 
                  type="submit" 
                  disabled={loading || !reply.trim()}
                  className="dm-btn-send"
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="dm-no-selection">
              <div className="dm-no-icon">💬</div>
              <p>ဘယ်ဘက်ခြမ်းမှ ဆွေးနွေးမှုတစ်ခုကို ရွေးချယ်ပါ</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default DiscussionManager;