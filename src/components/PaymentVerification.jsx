import { useState, useEffect } from 'react';

// Heroicons မှ အပိတ် Icon ကို သုံးပါမည် (SVG)
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

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
    const actionText = status === 'verified' ? 'Verify (အတည်ပြု)' : 'Reject (ပယ်ဖျက်)';
    if(!window.confirm(`Are you sure you want to ${actionText} this payment?`)) return;

    try {
      const res = await fetch(`${API_URL}/admin/payments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        alert(`Payment ${status} successfully!`);
        fetchPayments();
      } else {
        alert("Action failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server Error");
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <span>💰</span> Verify Payments (ငွေလွှဲ စစ်ဆေးရန်)
      </h2>

      {loading ? (
        <div className="text-center py-10 text-gray-500 animate-pulse">Loading payments data...</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-sm font-semibold tracking-wide text-left text-gray-600">Date</th>
                <th className="p-3 text-sm font-semibold tracking-wide text-left text-gray-600">Student</th>
                <th className="p-3 text-sm font-semibold tracking-wide text-left text-gray-600">Course Info</th>
                <th className="p-3 text-sm font-semibold tracking-wide text-left text-gray-600">Amount</th>
                <th className="p-3 text-sm font-semibold tracking-wide text-center text-gray-600">Receipt</th>
                <th className="p-3 text-sm font-semibold tracking-wide text-center text-gray-600">Status</th>
                <th className="p-3 text-sm font-semibold tracking-wide text-center text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-8 text-gray-500">No payment records found.</td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(p.payment_date).toLocaleDateString()}
                      <div className="text-xs text-gray-400">{new Date(p.payment_date).toLocaleTimeString()}</div>
                    </td>
                    <td className="p-3">
                        <div className="font-semibold text-gray-800">{p.student_name}</div>
                        <div className="text-xs text-blue-600">{p.phone_primary}</div>
                    </td>
                    <td className="p-3 text-sm">
                        <div className="font-medium">{p.course_name}</div>
                        <div className="text-xs text-gray-500 bg-gray-100 inline-block px-2 py-0.5 rounded mt-1">{p.batch_name}</div>
                    </td>
                    <td className="p-3 font-bold text-blue-600 whitespace-nowrap">
                        {Number(p.amount).toLocaleString()} Ks
                        <div className="text-xs text-gray-500 font-normal">{p.payment_method}</div>
                    </td>
                    
                    {/* --- Receipt Image Button --- */}
                    <td className="p-3 text-center">
                        {p.receipt_image ? (
                            <button 
                                onClick={() => setSelectedImage(p.receipt_image)}
                                className="flex items-center gap-1 mx-auto bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-md text-sm transition-colors font-medium"
                            >
                                📸 View
                            </button>
                        ) : (
                            <span className="text-gray-400 text-xs">No Image</span>
                        )}
                    </td>

                    {/* Status Badge */}
                    <td className="p-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                        ${p.status === 'verified' ? 'bg-green-100 text-green-800' : 
                          p.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800 animate-pulse'}`}>
                        {p.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center">
                        {p.status === 'pending' ? (
                            <div className="flex justify-center gap-2">
                                <button 
                                    onClick={() => handleStatusChange(p.id, 'verified')}
                                    title="Verify Payment"
                                    className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition shadow-sm"
                                >
                                    ✅
                                </button>
                                <button 
                                    onClick={() => handleStatusChange(p.id, 'rejected')}
                                    title="Reject Payment"
                                    className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition shadow-sm"
                                >
                                    ❌
                                </button>
                            </div>
                        ) : (
                            <span className="text-gray-400 text-sm">-</span>
                        )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* --- Premium Image Modal (ပြင်ဆင်ထားသော အပိုင်း) --- */}
      {selectedImage && (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedImage(null)} // နောက်ခံကိုနှိပ်ရင် ပိတ်မည်
        >
            {/* Modal Container */}
            <div 
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()} // Modal ကိုနှိပ်ရင် မပိတ်အောင် တားမည်
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
                    <h3 className="text-lg font-bold text-gray-800">📄 Payment Receipt Evidence</h3>
                    <button 
                        onClick={() => setSelectedImage(null)}
                        className="text-gray-400 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-full transition-colors focus:outline-none"
                    >
                        <CloseIcon />
                    </button>
                </div>
                
                {/* Modal Body (Image Container) */}
                <div className="p-4 bg-gray-50 flex justify-center items-center">
                    <img 
                        src={selectedImage} 
                        alt="Receipt" 
                        className="rounded-lg shadow-sm object-contain"
                        // ဓာတ်ပုံသည် မျက်နှာပြင်အမြင့်၏ 75% ထက်မကျော်စေရ၊ အချိုးအစားမပျက်စေရ
                        style={{ maxHeight: '75vh', maxWidth: '100%', width: 'auto' }} 
                    />
                </div>
            </div>
        </div>
      )}

    </div>
  );
}

export default PaymentVerification;