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
    if(!window.confirm(`Confirm ${actionText}?`)) return;

    try {
      const res = await fetch(`${API_URL}/admin/payments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        alert("Success!");
        fetchPayments();
      }
    } catch (err) {
      alert("Error");
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <span>💰</span> Verify Payments
      </h2>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-sm font-semibold text-left text-gray-600">Date</th>
                <th className="p-3 text-sm font-semibold text-left text-gray-600">Student</th>
                <th className="p-3 text-sm font-semibold text-left text-gray-600">Course</th>
                <th className="p-3 text-sm font-semibold text-left text-gray-600">Amount</th>
                <th className="p-3 text-sm font-semibold text-center text-gray-600">Receipt</th>
                <th className="p-3 text-sm font-semibold text-center text-gray-600">Status</th>
                <th className="p-3 text-sm font-semibold text-center text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                   <td className="p-3 text-sm text-gray-600">
                      {new Date(p.payment_date).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                        <div className="font-semibold text-gray-800">{p.student_name}</div>
                        <div className="text-xs text-blue-600">{p.phone_primary}</div>
                    </td>
                    <td className="p-3 text-sm">
                        <div className="font-medium">{p.course_name}</div>
                        <div className="text-xs text-gray-500">{p.batch_name}</div>
                    </td>
                    <td className="p-3 font-bold text-blue-600">
                        {Number(p.amount).toLocaleString()} Ks
                        <div className="text-xs text-gray-400 font-normal">{p.payment_method}</div>
                    </td>
                    
                    <td className="p-3 text-center">
                        {p.receipt_image ? (
                            <button 
                                onClick={() => setSelectedImage(p.receipt_image)}
                                className="bg-blue-50 text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-blue-100 transition"
                            >
                                📸 View
                            </button>
                        ) : (
                            <span className="text-gray-400 text-xs">-</span>
                        )}
                    </td>

                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                          p.status === 'verified' ? 'bg-green-100 text-green-700' : 
                          p.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                          'bg-yellow-100 text-yellow-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                        {p.status === 'pending' && (
                            <div className="flex justify-center gap-2">
                                <button onClick={() => handleStatusChange(p.id, 'verified')} className="text-green-600 hover:bg-green-50 p-1 rounded">✅</button>
                                <button onClick={() => handleStatusChange(p.id, 'rejected')} className="text-red-600 hover:bg-red-50 p-1 rounded">❌</button>
                            </div>
                        )}
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- REAL PREMIUM MODAL (Inline Styles for Guaranteed Layout) --- */}
      {selectedImage && (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.85)', // Dark Overlay
            backdropFilter: 'blur(5px)', // Blur effect
            zIndex: 9999, // Always on top
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
        }}
        onClick={() => setSelectedImage(null)}
        >
            <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                overflow: 'hidden',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                animation: 'popIn 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside box
            >
                {/* Header */}
                <div style={{
                    padding: '15px 20px',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#fff'
                }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                        📄 Receipt Evidence
                    </h3>
                    <button 
                        onClick={() => setSelectedImage(null)}
                        style={{
                            background: '#f3f4f6',
                            border: 'none',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#666'
                        }}
                    >
                        <CloseIcon />
                    </button>
                </div>

                {/* Image Area */}
                <div style={{
                    padding: '20px',
                    backgroundColor: '#f9fafb',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'auto'
                }}>
                    <img 
                        src={selectedImage} 
                        alt="Evidence" 
                        style={{
                            maxWidth: '100%',
                            maxHeight: '70vh',
                            borderRadius: '8px',
                            objectFit: 'contain',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                    />
                </div>
            </div>
        </div>
      )}

      {/* Animation Keyframes (Optional) */}
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