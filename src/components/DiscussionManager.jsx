import React, { useState, useEffect, useRef } from 'react';
import './DiscussionManager.css'; 

function DiscussionManager() {
  const [discussions, setDiscussions] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const fetchDiscussions = async () => {
    try {
      const res = await fetch('https://myanedu-backend.onrender.com/admin/discussions');
      if (res.ok) {
        const data = await res.json();
        
        // ✅ FIX: စာမဝင်ထားသော (0 message) သင်ခန်းစာများကို ဖျောက်ထားရန် Filter လုပ်ခြင်း
        const activeDiscussions = data.filter(d => Number(d.total_comments) > 0);
        
        setDiscussions(activeDiscussions); // Filter လုပ်ပြီးသားကိုသာ ပြသမည်
      }
    } catch (err) { console.error("Error fetching discussions:", err); }
  };

  useEffect(() => {
    fetchDiscussions();
    const interval = setInterval(fetchDiscussions, 5000); 
    return () => clearInterval(interval);
  }, []);

  const loadChat = async (lesson) => {
    setSelectedLesson(lesson);
    
    const targetId = lesson.lesson_id || lesson.id; 
    
    if (!targetId) {
        console.error("Lesson ID ပျောက်ဆုံးနေပါသည်:", lesson);
        return;
    }

    try {
      const res = await fetch(`https://myanedu-backend.onrender.com/admin/comments?lesson_id=${targetId}`);
      if (res.ok) {
        const data = await res.json();
        
        let messages = [];
        if (Array.isArray(data)) {
            messages = data;
        } else if (data && Array.isArray(data.data)) {
            messages = data.data;
        } else if (data && Array.isArray(data.comments)) {
            messages = data.comments;
        } else if (data && Array.isArray(data.messages)) {
            messages = data.messages;
        }
        
        setChatHistory(messages);
        scrollToBottom();
      }
    } catch (err) { console.error("Error loading chat:", err); }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
      scrollToBottom();
  }, [chatHistory]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim() || !selectedLesson) return;

    setLoading(true);
    const targetId = selectedLesson.lesson_id || selectedLesson.id;

    try {
      const res = await fetch('https://myanedu-backend.onrender.com/admin/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lesson_id: targetId,
          message: reply,
          comment: reply, 
          user_role: 'admin'
        })
      });

      if (res.ok) {
        setReply("");
        loadChat(selectedLesson); 
        fetchDiscussions(); 
      } else {
        alert("စာပို့ခြင်း မအောင်မြင်ပါ။");
      }
    } catch (err) {
      alert("Network Error: အင်တာနက်ချိတ်ဆက်မှုကို စစ်ဆေးပါ။");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dm-container">
      <h2 className="dm-title">
        <span>💬</span> Q&A Discussion
      </h2>

      <div className="dm-layout">
        
        {/* --- Sidebar --- */}
        <div className={`dm-sidebar ${selectedLesson ? 'dm-hidden-mobile' : ''}`}>
          <div className="dm-sidebar-header">
            📬 Inbox ({discussions.length})
          </div>
          <div className="dm-sidebar-list">
            {discussions.length === 0 ? (
                <div className="dm-empty-list">No new questions yet.</div>
            ) : (
                discussions.map((d, index) => {
                  const currentId = d.lesson_id || d.id;
                  const isActive = selectedLesson && (selectedLesson.lesson_id || selectedLesson.id) === currentId;
                  
                  return (
                    <div 
                        key={currentId || index} 
                        onClick={() => loadChat(d)}
                        className={`dm-list-item ${isActive ? 'active' : ''}`}
                    >
                        <div className="dm-item-course">
                            {d.course_name} • {d.batch_name}
                        </div>
                        <div className="dm-item-title">
                            📺 {d.lesson_title}
                        </div>
                        <div className="dm-item-count">
                            <span className="dm-badge">{d.total_comments} message(s)</span>
                        </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* --- Main Chat Area --- */}
        <div className={`dm-chat-area ${!selectedLesson ? 'dm-hidden-mobile' : ''}`}>
          {selectedLesson ? (
            <>
              {/* Chat Header */}
              <div className="dm-chat-header">
                 <button className="dm-back-btn" onClick={() => setSelectedLesson(null)}>
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" width="18" height="18">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                     </svg>
                 </button>
                 <div className="dm-chat-info">
                     <div className="dm-chat-course">
                        {selectedLesson.course_name} / {selectedLesson.batch_name}
                     </div>
                     <div className="dm-chat-title">
                        {selectedLesson.lesson_title}
                     </div>
                 </div>
              </div>
              
              {/* Chat Messages */}
              <div className="dm-chat-messages">
                {chatHistory.length === 0 ? (
                    <div className="dm-empty-chat">No messages in this discussion yet.</div>
                ) : (
                    chatHistory.map((c, index) => {
                        const isAdmin = c.user_role === 'admin' || c.role === 'admin' || c.isAdmin === true;
                        const senderName = isAdmin ? 'You (Admin)' : `👤 ${c.user_name || c.student_name || c.name || 'Student'}`;
                        const messageContent = c.message || c.comment || c.text || c.comment_text || c.content || "No content";
                        const timeString = c.created_at ? new Date(c.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';

                        return (
                            <div key={c.id || index} className={`dm-message-row ${isAdmin ? 'is-admin' : 'is-student'}`}>
                                <div className="dm-message-sender">{senderName}</div>
                                <div className="dm-message-bubble">{messageContent}</div>
                                {timeString && <div className="dm-message-time">{timeString}</div>}
                            </div>
                        );
                    })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Reply Box */}
              <form onSubmit={handleReply} className="dm-reply-form">
                <input 
                  type="text" 
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  placeholder="Type your reply here..."
                  className="dm-input"
                />
                <button 
                  type="submit" 
                  disabled={loading || !reply.trim()}
                  className="dm-btn-send"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                  </svg>
                </button>
              </form>
            </>
          ) : (
            <div className="dm-no-selection">
              <div className="dm-no-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#cbd5e1" width="80" height="80">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                  </svg>
              </div>
              <p>ဘယ်ဘက်ခြမ်းမှ ဆွေးနွေးမှုတစ်ခုကို ရွေးချယ်ပါ</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default DiscussionManager;