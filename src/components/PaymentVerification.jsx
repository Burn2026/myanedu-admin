import { useState, useEffect } from 'react';

function PaymentVerification() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null); // ဓာတ်ပုံကြီးကြည့်ရန် State

  // Backend URL
  const API_URL = "https://myanedu-backend.onrender.com";

  // ၁။ Payment Data များကို ဆွဲယူခြင်း
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
        console.error("Error fetching payments:", err);
        setLoading(false);
      });
  };

  // ၂။ Verify / Reject လုပ်ဆောင်ချက်များ
  const handleStatusChange = async (id, status) => {
    if(!window.confirm(`Are you sure you want to ${status} this payment?`)) return;

    try {
      const res = await fetch(`${API_URL}/admin/payments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }) // 'verified' or 'rejected'
      });

      if (res.ok) {
        alert(`Payment ${status} successfully!`);
        fetchPayments(); // Data ပြန်စစ်မည်
      } else {
        alert("Action failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server Error");
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-gray-800">💰 Verify Payments (ငွေလွှဲ စစ်ဆေးရန်)</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading payments...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Date</th>
                <th className="border p-2">Student</th>
                <th className="border p-2">Course / Batch</th>
                <th className="border p-2">Amount</th>
                <th className="border p-2">Method</th>
                <th className="border p-2">Receipt</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center p-4 text-gray-500">No pending payments.</td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="text-center hover:bg-gray-50">
                    <td className="border p-2 text-sm text-gray-600">
                      {new Date(p.payment_date).toLocaleDateString()}
                    </td>
                    <td className="border p-2 font-semibold">{p.student_name}<br/><span className="text-xs text-gray-500">{p.phone_primary}</span></td>
                    <td className="border p-2 text-sm">{p.course_name} - {p.batch_name}</td>
                    <td className="border p-2 font-bold text-blue-600">{Number(p.amount).toLocaleString()} Ks</td>
                    <td className="border p-2">{p.payment_method}</td>
                    
                    {/* --- Receipt Image Button --- */}
                    <td className="border p-2">
                        {p.receipt_image ? (
                            <button 
                                onClick={() => setSelectedImage(p.receipt_image)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm"
                            >
                                📸 View
                            </button>
                        ) : (
                            <span className="text-gray-400 text-sm">No Image</span>
                        )}
                    </td>

                    {/* Status Badge */}
                    <td className="border p-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold 
                        ${p.status === 'verified' ? 'bg-green-100 text-green-700' : 
                          p.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                          'bg-yellow-100 text-yellow-700'}`}>
                        {p.status.toUpperCase()}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="border p-2">
                        {p.status === 'pending' && (
                            <div className="flex justify-center gap-2">
                                <button 
                                    onClick={() => handleStatusChange(p.id, 'verified')}
                                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                                >
                                    Verify
                                </button>
                                <button 
                                    onClick={() => handleStatusChange(p.id, 'rejected')}
                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                                >
                                    Reject
                                </button>
                            </div>
                        )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* --- Image Modal (ဓာတ်ပုံကြီးပြမည့်နေရာ) --- */}
      {selectedImage && (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)} // အပြင်ဘက်နှိပ်ရင် ပိတ်မည်
        >
            <div className="bg-white p-2 rounded shadow-lg max-w-2xl w-full relative">
                {/* Close Button */}
                <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-[-15px] right-[-15px] bg-red-600 text-white w-8 h-8 rounded-full font-bold shadow hover:bg-red-700"
                >
                    ✕
                </button>
                
                <img 
                    src={selectedImage} 
                    alt="Receipt" 
                    className="w-full h-auto rounded"
                    style={{ maxHeight: '80vh', objectFit: 'contain' }}
                />
            </div>
        </div>
      )}

    </div>
  );
}

export default PaymentVerification;