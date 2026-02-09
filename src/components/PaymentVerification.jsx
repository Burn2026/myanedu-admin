// edu-admin/src/components/PaymentVerification.jsx
import React, { useState, useEffect } from 'react';

function PaymentVerification() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Data ဆွဲထုတ်ခြင်း
  const fetchPayments = () => {
    setLoading(true);
    fetch('https://myanedu-backend.onrender.com/admin/payments')
      .then(res => res.json())
      .then(data => {
        setPayments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // (Revised) Approve/Reject လုပ်မည့် Function
  const handleVerify = async (id, status) => {
    const action = status === 'verified' ? 'ACCEPT' : 'REJECT';
    if(!window.confirm(`Are you sure you want to ${action} this payment?`)) return;

    try {
      // Reject ဆိုရင် Backend Route ကွဲသွားပါမယ်
      const url = status === 'rejected' 
        ? `https://myanedu-backend.onrender.com/admin/reject-payment/${id}`  // Reject Route
        : `https://myanedu-backend.onrender.com/admin/verify-payment/${id}`; // Verify Route

      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }) // Reject Route အတွက် body မလိုပေမယ့် ထည့်ထားလည်း ကိစ္စမရှိပါ
      });

      if (res.ok) {
        alert(`${action} Successful!`);
        fetchPayments(); // ဇယားကို ပြန် Refresh လုပ်မည်
      } else {
        const errData = await res.json();
        alert("Failed: " + (errData.message || "Unknown Error"));
      }
    } catch (err) {
      alert("Connection Error");
    }
  };

  return (
    <div>
      <h2 className="dashboard-title">💰 Payment Verification</h2>
      
      {loading ? <p>Loading...</p> : (
        <div className="table-card" style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{background: '#f1f5f9', textAlign: 'left'}}>
                <th style={{padding: '10px'}}>Student</th>
                <th>Course</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th>Receipt</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(pay => (
                <tr key={pay.id} style={{borderBottom: '1px solid #e2e8f0'}}>
                  <td style={{padding: '10px'}}>
                    <div style={{fontWeight: 'bold'}}>{pay.student_name}</div>
                    <div style={{fontSize: '12px', color: '#64748b'}}>{pay.phone_primary}</div>
                  </td>
                  <td>{pay.course_name}<br/><span style={{fontSize:'11px', color:'#64748b'}}>{pay.batch_name}</span></td>
                  <td style={{fontWeight: 'bold', color: '#2563eb'}}>{Number(pay.amount).toLocaleString()} Ks</td>
                  <td>{pay.payment_method}</td>
                  <td>{new Date(pay.payment_date).toLocaleDateString()}</td>
                  <td>
                    {pay.receipt_image ? (
                        <a href={`https://myanedu-backend.onrender.com/${pay.receipt_image}`} target="_blank" rel="noreferrer" style={{color: '#2563eb', textDecoration: 'underline', fontSize: '13px'}}>
                            View Image
                        </a>
                    ) : <span style={{color:'#94a3b8'}}>No Image</span>}
                  </td>
                  <td>
                    {/* Status Badge Logic */}
                    <span className={`status-badge ${
                        pay.status === 'verified' ? 'success' : 
                        pay.status === 'pending' ? 'pending' : 'error' // Rejected/Error
                      }`}
                          style={{
                              background: pay.status === 'verified' ? '#dcfce7' : pay.status === 'pending' ? '#fef9c3' : '#fee2e2',
                              color: pay.status === 'verified' ? '#166534' : pay.status === 'pending' ? '#854d0e' : '#991b1b',
                              padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold'
                          }}
                    >
                        {pay.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {pay.status === 'pending' && (
                        <div style={{display: 'flex', gap: '5px'}}>
                            <button 
                                onClick={() => handleVerify(pay.id, 'verified')}
                                style={{background: '#16a34a', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>
                                ✓ Accept
                            </button>
                            <button 
                                onClick={() => handleVerify(pay.id, 'rejected')}
                                style={{background: '#dc2626', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>
                                ✕ Reject
                            </button>
                        </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {payments.length === 0 && <p style={{textAlign: 'center', padding: '20px', color: '#64748b'}}>No payment records found.</p>}
        </div>
      )}
    </div>
  );
}

export default PaymentVerification;