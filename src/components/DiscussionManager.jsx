import React, { useState, useEffect, useRef } from 'react';
import './DiscussionManager.css'; 

function DiscussionManager() {
  const [discussions, setDiscussions] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const [readChats, setReadChats] = useState(() => {
      const saved = localStorage.getItem('adminReadChats');
      return saved ? JSON.parse(saved) : {};
  });

  const fetchDiscussions = async () => {
    try {
      const res = await fetch('https://myanedu-backend.onrender.com/admin/discussions');
      if (res.ok) {
        const data = await res.json();
        const activeDiscussions = data.filter(d => Number(d.total_comments) > 0);
        setDiscussions(activeDiscussions);
      }
    } catch (err) { console.error("Error fetching discussions:", err); }
  };

  useEffect(() => {
    fetchDiscussions();
    const interval = setInterval(fetchDiscussions, 5000); 
    return () => clearInterval(interval);
  }, []);

  const loadChat = async (thread) => {
    setSelectedThread(thread);
    const targetId = thread.lesson_id || thread.id; 
    const studentName = encodeURIComponent(thread.student_name);

    if (!targetId) return;

    try {
      const res = await fetch(`https://myanedu-backend.onrender.com/admin/comments?lesson_id=${targetId}&student_name=${studentName}`);
      if (res.ok) {
        const data = await res.json();
        let messages = Array.isArray(data) ? data : (data.data || data.comments || []);
        
        setChatHistory(messages);
        scrollToBottom();

        const uniqueKey = `${targetId}_${thread.student_name}`;
        const updatedReads = { ...readChats, [uniqueKey]: Number(thread.total_comments) };
        setReadChats(updatedReads);
        localStorage.setItem('adminReadChats', JSON.stringify(updatedReads));
      }
    } catch (err) { console.error("Error loading chat:", err); }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => { scrollToBottom(); }, [chatHistory]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim() || !selectedThread) return;

    setLoading(true);
    const targetId = selectedThread.lesson_id || selectedThread.id;

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
        loadChat(selectedThread); 
        fetchDiscussions(); 
      }
    } catch (err) { alert("Network Error"); } finally { setLoading(false); }
  };

  const getAvatarUrl = (path, name) => {
      if (!path || path === "null" || path === "undefined") {
          const safeName = encodeURIComponent(name || 'Student');
          return `https://ui-avatars.com/api/?name=${safeName}&background=2563eb&color=fff&bold=true&font-size=0.4`;
      }
      let cleanPath = String(path).trim().replace(/\\/g, '/');
      const httpIndex = cleanPath.indexOf("http");
      if (httpIndex !== -1) return cleanPath.substring(httpIndex);
      if (cleanPath.includes("cloudinary.com")) return `https://${cleanPath.replace(/^\/+/, '')}`;
      return `https://myanedu-backend.onrender.com/${cleanPath.replace(/^\/+/, '')}`;
  };

  return (
    <div className="dm-container">
      <h2 className="dm-title"><span>💬</span> Q&A Discussion</h2>

      <div className="dm-layout">
        
        {/* --- Sidebar --- */}
        <div className={`dm-sidebar ${selectedThread ? 'dm-hidden-mobile' : ''}`}>
          <div className="dm-sidebar-header">
            📬 Inbox ({discussions.length})
          </div>
          <div className="dm-sidebar-list">
            {discussions.length === 0 ? (
                <div className="dm-empty-list">No new questions yet.</div>
            ) : (
                discussions.map((d, index) => {
                  const currentId = d.lesson_id || d.id;
                  const isActive = selectedThread && (selectedThread.lesson_id === d.lesson_id && selectedThread.student_name === d.student_name);
                  
                  const uniqueKey = `${currentId}_${d.student_name}`;
                  const readCount = readChats[uniqueKey] || 0;
                  const unreadCount = Number(d.total_comments) - readCount;
                  const hasNewMessage = unreadCount > 0;
                  
                  return (
                    <div key={index} onClick={() => loadChat(d)} className={`dm-list-item ${isActive ? 'active' : ''}`}>
                        
                        <div className="dm-avatar-wrapper">
                            <img src={getAvatarUrl(d.profile_image, d.student_name)} alt="Avatar" className="dm-avatar-img" />
                        </div>

                        <div className="dm-item-content">
                            <div className="dm-item-header">
                                <span className="dm-item-student">{d.student_name}</span>
                                {hasNewMessage && <span className="dm-badge-new">{unreadCount} New</span>}
                            </div>

                            {/* ✅ ရှင်းလင်းသော သင်တန်းနှင့် ဗီဒီယို ပြသမှု */}
                            <div className="dm-item-course">
                                <span style={{color: '#94a3b8', fontWeight: 'normal', marginRight: '4px'}}>📚 သင်တန်း:</span> 
                                {d.course_name || "Course"} ({d.batch_name})
                            </div>

                            <div className="dm-item-title">
                                <span style={{color: '#94a3b8', fontWeight: 'normal', marginRight: '4px'}}>🎬 ဗီဒီယို:</span> 
                                {d.lesson_title}
                            </div>

                            {!hasNewMessage && (
                                <div className="dm-last-message" style={{marginTop: '5px'}}>
                                    {d.last_message || "📎 Message Attached"}
                                </div>
                            )}
                        </div>

                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* --- Main Chat Area --- */}
        <div className={`dm-chat-area ${!selectedThread ? 'dm-hidden-mobile' : ''}`}>
          {selectedThread ? (
            <>
              <div className="dm-chat-header">
                 {/* ✅ FIX: Back Button with explicit #0f172a (Dark) arrow color */}
                 <button className="dm-back-btn" onClick={() => setSelectedThread(null)} title="Back">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#0f172a" width="20" height="20">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                     </svg>
                 </button>

                 <div className="dm-chat-header-user">
                     <div className="dm-avatar-wrapper" style={{ width: '45px', height: '45px' }}>
                         <img src={getAvatarUrl(selectedThread.profile_image, selectedThread.student_name)} alt="Avatar" className="dm-avatar-img" />
                     </div>
                     <div className="dm-chat-info">
                         <div className="dm-chat-student-name">
                            {selectedThread.student_name}
                         </div>
                         {/* ✅ Chat Header တွင်လည်း ရှင်းလင်းစွာ ပြသခြင်း */}
                         <div className="dm-chat-course" style={{marginTop: '2px'}}>
                            <span style={{color: '#94a3b8'}}>📚 သင်တန်း -</span> {selectedThread.course_name} ({selectedThread.batch_name})
                         </div>
                         <div className="dm-chat-course" style={{marginTop: '2px', color: '#2563eb'}}>
                            <span style={{color: '#94a3b8'}}>🎬 ဗီဒီယို -</span> {selectedThread.lesson_title}
                         </div>
                     </div>
                 </div>
              </div>
              
              <div className="dm-chat-messages">
                {chatHistory.length === 0 ? (
                    <div className="dm-empty-chat">No messages yet.</div>
                ) : (
                    chatHistory.map((c, index) => {
                        const isAdmin = c.user_role === 'admin';
                        const senderName = isAdmin ? 'You (Admin)' : `👤 ${c.user_name}`;
                        const messageContent = c.message || c.comment || "No content";
                        const timeString = c.created_at ? new Date(c.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';

                        return (
                            <div key={index} className={`dm-message-row ${isAdmin ? 'is-admin' : 'is-student'}`}>
                                <div className="dm-message-sender">{senderName}</div>
                                <div className="dm-message-bubble">{messageContent}</div>
                                {timeString && <div className="dm-message-time">{timeString}</div>}
                            </div>
                        );
                    })
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleReply} className="dm-reply-form">
                <input 
                  type="text" 
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  placeholder={`Reply to ${selectedThread.student_name}...`}
                  className="dm-input"
                />
                <button type="submit" disabled={loading || !reply.trim()} className="dm-btn-send">
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
              <p>ကျောင်းသားတစ်ဦး၏ ဆွေးနွေးမှုကို ရွေးချယ်ပါ</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default DiscussionManager;