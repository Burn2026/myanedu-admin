import React, { useState, useEffect } from 'react';
import './PaymentVerification.css'; 

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="pv-close-icon">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

function PaymentVerification() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ ရိုးရိုး Image အစား Payment တစ်ခုလုံးကို သိမ်းမည့် State
  const [selectedPayment, setSelectedPayment] = useState(null);

  const API_URL = "https://myanedu-backend.onrender.com";

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = () => {
    fetch(`${API_URL}/admin/payments`)
      .then(res => res.json())
      .then(data => {
        setPayments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error:", err);
        setLoading(false);
      });
  };

  const handleStatusChange = async (id, status) => {
    const actionText = status === 'verified' ? 'Verify' : 'Reject';
    if(!window.confirm(`Are you sure you want to ${actionText} this payment?`)) return;

    try {
      const res = await fetch(`${API_URL}/admin/payments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        alert(`Payment has been successfully ${status}!`);
        fetchPayments();
        setSelectedPayment(null); // ✅ လုပ်ဆောင်ပြီးပါက Modal ကို ပိတ်မည်
      } else {
        alert("Failed to update status.");
      }
    } catch (err) {
      alert("Server Error");
    }
  };

  const getImageUrl = (path) => {
    if (!path || path === "null" || path === "undefined") return null;
    let cleanPath = String(path).trim().replace(/\\/g, '/');
    
    const httpIndex = cleanPath.indexOf("http");
    if (httpIndex !== -1) return cleanPath.substring(httpIndex);
    
    if (cleanPath.includes("cloudinary.com")) return `https://${cleanPath.replace(/^\/+/, '')}`;
    
    return `${API_URL}/${cleanPath.replace(/^\/+/, '')}`;
  };

  return (
    <div className="pv-container">
      <h2 className="pv-title">
        <span>💰</span> Verify Payments
      </h2>

      {loading ? (
        <div className="pv-loading">Loading payments...</div>
      ) : payments.length === 0 ? (
        <div className="pv-empty">No payment records found.</div>
      ) : (
        /* ✅ Table အစား Card Grid ဖြင့် ပြသခြင်း */
        <div className="pv-grid">
          {payments.map((p) => (
            <div 
                key={p.id} 
                className="pv-card" 
                onClick={() => setSelectedPayment(p)} // နှိပ်လိုက်လျှင် Modal ပေါ်မည်
            >
                <div className="pv-card-header">
                    <span className={`pv-badge ${
                        p.status === 'verified' ? 'bg-green' : 
                        p.status === 'rejected' ? 'bg-red' : 'bg-yellow'
                    }`}>
                        {p.status}
                    </span>
                    <span className="pv-card-date">{new Date(p.payment_date).toLocaleDateString()}</span>
                </div>
                
                <div className="pv-card-body">
                    <div className="pv-card-icon">📘</div>
                    <div className="pv-card-info">
                        <h4>{p.course_name}</h4>
                        <p>{p.batch_name}</p>
                    </div>
                </div>

                <div className="pv-card-footer">
                    <span>View Details &rarr;</span>
                </div>
            </div>
          ))}
        </div>
      )}

      {/* --- ✅ PREMIUM PAYMENT DETAILS MODAL --- */}
      {selectedPayment && (
        <div className="pv-modal-overlay" onClick={() => setSelectedPayment(null)}>
            <div className="pv-modal-box" onClick={(e) => e.stopPropagation()}>
                
                <div className="pv-modal-header">
                    <h3>Payment Details</h3>
                    <button onClick={() => setSelectedPayment(null)} className="pv-btn-close">
                        <CloseIcon />
                    </button>
                </div>

                <div className="pv-modal-content">
                    {/* ဘယ်ဘက် - အချက်အလက်များ */}
                    <div className="pv-details-section">
                        <div className="pv-detail-row">
                            <span className="pv-label">Student Name:</span>
                            <span className="pv-value pv-fw-bold">{selectedPayment.student_name}</span>
                        </div>
                        <div className="pv-detail-row">
                            <span className="pv-label">Phone:</span>
                            <span className="pv-value pv-text-blue">{selectedPayment.phone_primary}</span>
                        </div>
                        <div className="pv-detail-row">
                            <span className="pv-label">Course:</span>
                            <span className="pv-value">{selectedPayment.course_name} ({selectedPayment.batch_name})</span>
                        </div>
                        <div className="pv-detail-row">
                            <span className="pv-label">Amount:</span>
                            <span className="pv-value pv-amount">{Number(selectedPayment.amount).toLocaleString()} Ks</span>
                        </div>
                        <div className="pv-detail-row">
                            <span className="pv-label">Method:</span>
                            <span className="pv-value pv-method">{selectedPayment.payment_method}</span>
                        </div>
                        <div className="pv-detail-row">
                            <span className="pv-label">Trans ID:</span>
                            <span className="pv-value pv-font-mono">{selectedPayment.transaction_id || 'N/A'}</span>
                        </div>
                    </div>

                    {/* ညာဘက်/အောက်ဘက် - ပြေစာပုံ */}
                    <div className="pv-receipt-section">
                        <span className="pv-label">Receipt Image:</span>
                        {selectedPayment.receipt_image ? (
                            <div className="pv-receipt-wrapper">
                                <img 
                                    src={getImageUrl(selectedPayment.receipt_image)} 
                                    alt="Receipt" 
                                    className="pv-receipt-img"
                                />
                            </div>
                        ) : (
                            <div className="pv-no-receipt">No Receipt Uploaded</div>
                        )}
                    </div>
                </div>

                {/* အောက်ဆုံး - Action Buttons */}
                <div className="pv-modal-actions">
                    {selectedPayment.status === 'pending' ? (
                        <>
                            <button 
                                onClick={() => handleStatusChange(selectedPayment.id, 'rejected')} 
                                className="pv-btn-reject-lg"
                            >
                                ❌ Reject
                            </button>
                            <button 
                                onClick={() => handleStatusChange(selectedPayment.id, 'verified')} 
                                className="pv-btn-verify-lg"
                            >
                                ✅ Verify Payment
                            </button>
                        </>
                    ) : (
                        <div className="pv-action-taken">
                            Status: <span className={`pv-badge ${selectedPayment.status === 'verified' ? 'bg-green' : 'bg-red'}`}>{selectedPayment.status}</span>
                        </div>
                    )}
                </div>

            </div>
        </div>
      )}

    </div>
  );
}

export default PaymentVerification;