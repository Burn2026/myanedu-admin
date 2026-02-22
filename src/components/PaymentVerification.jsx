import { useState, useEffect } from 'react';

// Heroicons Close Icon
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
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
    // ✅ (Responsive) မျက်နှာပြင်ပြည့်မသွားအောင် max-w-7xl သတ်မှတ်ထားသည်
    <div className="p-4 md:p-6 bg-white rounded-xl shadow-sm border border-gray-100 max-w-7xl mx-auto">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-800 flex items-center gap-2">
        <span>💰</span> Verify Payments
      </h2>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading payments...</div>
      ) : payments.length === 0 ? (
        <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">No payment records found.</div>
      ) : (
        // ✅ (Responsive) ဖုန်းတွင် Table မဟုတ်ဘဲ Block အနေဖြင့် ပြမည်
        <div className="rounded-lg md:border md:border-gray-200">
          <table className="w-full border-collapse block md:table">
            
            {/* Desktop တွင်သာ Table Header ကို ပြမည် */}
            <thead className="hidden md:table-header-group bg-gray-50">
              <tr>
                <th className="p-3 text-sm font-semibold text-left text-gray-600">Date</th>
                <th className="p-3 text-sm font-semibold text-left text-gray-600">Student</th>
                <th className="p-3 text-sm font-semibold text-left text-gray-600">Course</th>
                <th className="p-3 text-sm font-semibold text-left text-gray-600">Payment Info</th> 
                <th className="p-3 text-sm font-semibold text-center text-gray-600">Receipt</th>
                <th className="p-3 text-sm font-semibold text-center text-gray-600">Status</th>
                <th className="p-3 text-sm font-semibold text-center text-gray-600">Actions</th>
              </tr>
            </thead>
            
            <tbody className="block md:table-row-group divide-y-0 md:divide-y divide-gray-100">
              {payments.map((p) => (
                // ✅ ဖုန်းတွင် Card ပုံစံပြောင်းမည် (border, shadow, margin များဖြင့်)
                <tr key={p.id} className="block md:table-row bg-white border border-gray-200 md:border-none rounded-xl md:rounded-none mb-4 md:mb-0 shadow-sm md:shadow-none hover:bg-gray-50 transition-colors">
                   
                    {/* Date */}
                    <td className="p-4 md:p-3 flex justify-between items-center md:table-cell border-b md:border-none border-gray-100 text-sm text-gray-600">
                      <span className="font-bold text-gray-500 md:hidden">Date</span>
                      <span>{new Date(p.payment_date).toLocaleDateString()}</span>
                    </td>
                    
                    {/* Student */}
                    <td className="p-4 md:p-3 flex justify-between items-center md:table-cell border-b md:border-none border-gray-100">
                        <span className="font-bold text-gray-500 md:hidden">Student</span>
                        <div className="text-right md:text-left">
                            <div className="font-semibold text-gray-800">{p.student_name}</div>
                            <div className="text-xs text-blue-600 font-mono mt-0.5">{p.phone_primary}</div>
                        </div>
                    </td>
                    
                    {/* Course */}
                    <td className="p-4 md:p-3 flex justify-between items-center md:table-cell border-b md:border-none border-gray-100 text-sm">
                        <span className="font-bold text-gray-500 md:hidden">Course</span>
                        <div className="text-right md:text-left">
                            <div className="font-medium text-gray-800">{p.course_name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{p.batch_name}</div>
                        </div>
                    </td>
                    
                    {/* Payment Info */}
                    <td className="p-4 md:p-3 flex justify-between items-center md:table-cell border-b md:border-none border-gray-100">
                        <span className="font-bold text-gray-500 md:hidden">Amount</span>
                        <div className="text-right md:text-left">
                            <div className="font-bold text-blue-600">{Number(p.amount).toLocaleString()} Ks</div>
                            <div className="flex flex-col items-end md:items-start gap-1 mt-1">
                                <div className="text-[11px] font-bold text-gray-600 uppercase tracking-wider bg-gray-200 px-2 py-0.5 rounded w-fit">
                                    {p.payment_method}
                                </div>
                                {p.transaction_id ? (
                                    <div className="text-[11px] text-gray-500 mt-0.5">
                                        TID: <span className="font-mono text-gray-800 font-bold">{p.transaction_id}</span>
                                    </div>
                                ) : (
                                    <div className="text-[11px] text-gray-400 italic mt-0.5">No Trans ID</div>
                                )}
                            </div>
                        </div>
                    </td>
                    
                    {/* Receipt */}
                    <td className="p-4 md:p-3 flex justify-between items-center md:justify-center md:table-cell border-b md:border-none border-gray-100 text-center">
                        <span className="font-bold text-gray-500 md:hidden">Receipt</span>
                        {p.receipt_image ? (
                            <button 
                                onClick={() => setSelectedImage(p.receipt_image)}
                                className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded text-xs font-semibold hover:bg-blue-100 transition-colors border border-blue-100"
                            >
                                📸 View
                            </button>
                        ) : (
                            <span className="text-gray-400 text-xs italic">N/A</span>
                        )}
                    </td>

                    {/* Status */}
                    <td className="p-4 md:p-3 flex justify-between items-center md:justify-center md:table-cell border-b md:border-none border-gray-100 text-center">
                      <span className="font-bold text-gray-500 md:hidden">Status</span>
                      <span className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${
                          p.status === 'verified' ? 'bg-green-100 text-green-700 border border-green-200' : 
                          p.status === 'rejected' ? 'bg-red-100 text-red-700 border border-red-200' : 
                          'bg-yellow-100 text-yellow-700 border border-yellow-200'
                      }`}>
                        {p.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 md:p-3 flex justify-between items-center md:justify-center md:table-cell text-center bg-gray-50 md:bg-transparent rounded-b-xl md:rounded-none">
                        <span className="font-bold text-gray-500 md:hidden">Action</span>
                        {p.status === 'pending' ? (
                            <div className="flex justify-end md:justify-center gap-2">
                                <button 
                                    onClick={() => handleStatusChange(p.id, 'verified')} 
                                    className="text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded text-xs font-semibold transition border border-green-100 shadow-sm"
                                >
                                    Verify ✅
                                </button>
                                <button 
                                    onClick={() => handleStatusChange(p.id, 'rejected')} 
                                    className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded text-xs font-semibold transition border border-red-100 shadow-sm"
                                >
                                    Reject ❌
                                </button>
                            </div>
                        ) : (
                            <span className="text-gray-400 text-xs italic">Action Taken</span>
                        )}
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- RECEIPT MODAL --- */}
      {selectedImage && (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(5px)',
            zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px'
        }}
        onClick={() => setSelectedImage(null)}
        >
            <div style={{
                backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden',
                maxWidth: '500px', width: '100%', maxHeight: '90vh', display: 'flex',
                flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                animation: 'popIn 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()} 
            >
                <div style={{
                    padding: '15px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex',
                    justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb'
                }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                        📄 Payment Receipt
                    </h3>
                    <button 
                        onClick={() => setSelectedImage(null)}
                        style={{
                            background: '#e5e7eb', border: 'none', borderRadius: '50%',
                            width: '32px', height: '32px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', cursor: 'pointer', color: '#4b5563', transition: '0.2s'
                        }}
                    >
                        <CloseIcon />
                    </button>
                </div>

                <div style={{
                    padding: '15px', backgroundColor: '#ffffff', display: 'flex',
                    justifyContent: 'center', alignItems: 'center', overflow: 'auto'
                }}>
                    <img 
                        src={getImageUrl(selectedImage)} 
                        alt="Evidence" 
                        style={{
                            maxWidth: '100%', maxHeight: '70vh', borderRadius: '8px',
                            objectFit: 'contain', border: '1px solid #f3f4f6'
                        }}
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML += `<div style="color:#dc2626; background:#fee2e2; padding:15px; border-radius:8px; font-size:14px; text-align:center;">🚨 Unable to load receipt image.</div>`;
                        }}
                    />
                </div>
            </div>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

    </div>
  );
}

export default PaymentVerification;