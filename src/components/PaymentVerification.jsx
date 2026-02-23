import React, { useState, useEffect } from 'react';
import './PaymentVerification.css'; // ✅ သီးသန့် CSS ဖိုင်ချိတ်ဆက်ထားသည်

// Heroicons Close Icon
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="pv-close-icon">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

function PaymentVerification() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

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
        <div className="pv-table-wrapper">
          <table className="pv-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Student</th>
                <th>Course</th>
                <th>Payment Info</th> 
                <th>Receipt</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                   
                    {/* Date */}
                    <td data-label="Date" className="pv-text-gray">
                      <div className="pv-td-value">
                          {new Date(p.payment_date).toLocaleDateString()}
                      </div>
                    </td>
                    
                    {/* Student */}
                    <td data-label="Student">
                        <div className="pv-td-value pv-flex-col">
                            <span className="pv-fw-bold pv-text-dark">{p.student_name}</span>
                            <span className="pv-text-small pv-text-blue pv-font-mono">{p.phone_primary}</span>
                        </div>
                    </td>
                    
                    {/* Course */}
                    <td data-label="Course">
                        <div className="pv-td-value pv-flex-col">
                            <span className="pv-fw-medium pv-text-dark">{p.course_name}</span>
                            <span className="pv-text-small pv-text-gray">{p.batch_name}</span>
                        </div>
                    </td>
                    
                    {/* Payment Info */}
                    <td data-label="Amount">
                        <div className="pv-td-value pv-flex-col">
                            <span className="pv-fw-bold pv-text-blue">{Number(p.amount).toLocaleString()} Ks</span>
                            <div className="pv-payment-meta">
                                <span className="pv-method-badge">{p.payment_method}</span>
                                {p.transaction_id ? (
                                    <span className="pv-text-small pv-text-gray pv-mt-1">
                                        TID: <span className="pv-font-mono pv-fw-bold pv-text-dark">{p.transaction_id}</span>
                                    </span>
                                ) : (
                                    <span className="pv-text-small pv-text-gray pv-italic pv-mt-1">No Trans ID</span>
                                )}
                            </div>
                        </div>
                    </td>
                    
                    {/* Receipt */}
                    <td data-label="Receipt" className="pv-center">
                        <div className="pv-td-value">
                            {p.receipt_image ? (
                                <button 
                                    onClick={() => setSelectedImage(p.receipt_image)}
                                    className="pv-btn-receipt"
                                >
                                    📸 View
                                </button>
                            ) : (
                                <span className="pv-text-small pv-text-gray pv-italic">N/A</span>
                            )}
                        </div>
                    </td>

                    {/* Status */}
                    <td data-label="Status" className="pv-center">
                      <div className="pv-td-value">
                          <span className={`pv-status-badge ${
                              p.status === 'verified' ? 'status-verified' : 
                              p.status === 'rejected' ? 'status-rejected' : 
                              'status-pending'
                          }`}>
                            {p.status}
                          </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td data-label="Action" className="pv-actions-cell">
                        <div className="pv-td-value pv-action-group">
                            {p.status === 'pending' ? (
                                <>
                                    <button 
                                        onClick={() => handleStatusChange(p.id, 'verified')} 
                                        className="pv-btn-verify"
                                    >
                                        Verify ✅
                                    </button>
                                    <button 
                                        onClick={() => handleStatusChange(p.id, 'rejected')} 
                                        className="pv-btn-reject"
                                    >
                                        Reject ❌
                                    </button>
                                </>
                            ) : (
                                <span className="pv-text-small pv-text-gray pv-italic">Action Taken</span>
                            )}
                        </div>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- RECEIPT MODAL --- */}
      {selectedImage && (
        <div className="pv-modal-overlay" onClick={() => setSelectedImage(null)}>
            <div className="pv-modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="pv-modal-header">
                    <h3>📄 Payment Receipt</h3>
                    <button onClick={() => setSelectedImage(null)} className="pv-btn-close">
                        <CloseIcon />
                    </button>
                </div>
                <div className="pv-modal-body">
                    <img 
                        src={getImageUrl(selectedImage)} 
                        alt="Evidence" 
                        className="pv-receipt-img"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML += `<div class="pv-error-msg">🚨 Unable to load receipt image.</div>`;
                        }}
                    />
                </div>
            </div>
        </div>
      )}

    </div>
  );
}

export default PaymentVerification;