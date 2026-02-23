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
        setDiscussions(data);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchDiscussions();
    const interval = setInterval(fetchDiscussions, 5000); 
    return () => clearInterval(interval);
  }, []);

  const loadChat = async (lesson) => {
    setSelectedLesson(lesson);
    try {
      const res = await fetch(`https://myanedu-backend.onrender.com/admin/comments?lesson_id=${lesson.id}`);
      if (res.ok) {
        const data = await res.json();
        setChatHistory(data);
        scrollToBottom();
      }
    } catch (err) { console.error(err); }
  };

  // စာအသစ်ဝင်လာတိုင်း အောက်ဆုံးသို့ အလိုအလျောက် ရွှေ့ပေးမည်
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
    try {
      const res = await fetch('https://myanedu-backend.onrender.com/admin/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lesson_id: selectedLesson.id,
          // Backend က message လို့တောင်းတာလား comment လို့တောင်းတာလား သေချာစေရန် နှစ်ခုလုံးပို့ထားပါသည်
          message: reply,
          comment: reply 
        })
      });

      if (res.ok) {
        setReply("");
        loadChat(selectedLesson); 
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
                        <span className="dm-badge">{d.total_comments} message(s)</span>
                    </div>
                </div>
                ))
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
                    chatHistory.map(c => {
                        const isAdmin = c.user_role === 'admin';
                        // ✅ FIX: Backend မှ message (သို့) comment (သို့) text ကြိုက်သည့်နာမည်ဖြင့်လာပါစေ ဖမ်းယူပြသပေးမည်
                        const messageContent = c.message || c.comment || c.text || c.comment_text || "No content";

                        return (
                            <div key={c.id} className={`dm-message-row ${isAdmin ? 'is-admin' : 'is-student'}`}>
                                <div className="dm-message-sender">
                                    {isAdmin ? 'You (Admin)' : `👤 ${c.user_name || 'Student'}`}
                                </div>
                                <div className="dm-message-bubble">
                                    {messageContent}
                                </div>
                                <div className="dm-message-time">
                                    {new Date(c.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
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