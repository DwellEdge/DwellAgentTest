import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Payment() {
    const location = useLocation();
    const agents = location.state?.agents || [];
    const city = location.state?.city || "";
    const area = location.state?.area || "";
    const customers = location.state?.customers || [];
    const selectedCustomers = location.state?.selectedCustomers || [];
    const navigate = useNavigate();

    const amountPerAgent = 30;
    const totalAmount = agents.length * amountPerAgent;

    const [showMobilePopup, setShowMobilePopup] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg, #fff7f3 0%, #ffe8dc 50%, #fff7f3 100%)' }}>

      {/* Navbar */}
      <nav style={{ background: 'rgba(255,255,255,0.8)', borderBottom: '1px solid #fdd9c8', backdropFilter: 'blur(10px)' }}
        className="flex items-center justify-between px-4 sm:px-8 py-4 shadow-sm">
        <div
          style={{ color: "#c2511f" }}
          className="text-lg sm:text-xl font-extrabold tracking-wide cursor-pointer"
          onClick={() => navigate("/")}
        >
          DWELLAGENT
        </div>
        <button onClick={() => navigate(-1)}
          style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #fdd9c8', color: '#c2511f' }}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full shadow-md text-xs sm:text-sm font-bold hover:shadow-lg transition">
          &larr; Back
        </button>
      </nav>

      <div className="flex flex-1 justify-center px-4 py-6 sm:py-12">
        <div className="w-full max-w-3xl flex flex-col gap-5 sm:gap-6">

          {/* Header */}
          <div className="px-1">
            <div style={{ background: 'linear-gradient(135deg, #e8724a, #f59e6c)' }}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl shadow mb-2 sm:mb-3">
              💳
            </div>
            <h1 style={{ color: '#7c2d12' }} className="text-2xl sm:text-3xl font-extrabold">Payment Summary</h1>
            <p style={{ color: '#a8674a' }} className="mt-1 text-xs sm:text-sm">Review your selected agents and total amount</p>
          </div>

          {/* Responsive Table Card */}
          <div style={{ background: '#fff', border: '1px solid #fdd9c8' }}
            className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg">

            {/* Table Header */}
            <div style={{ background: '#fff8f5', borderBottom: '1px solid #fdd9c8' }}
              className="grid grid-cols-2 px-4 sm:px-6 py-3.5 sm:py-4">
              <div style={{ color: '#7c2d12' }} className="font-bold text-xs sm:text-sm">Selected Agents</div>
              <div style={{ color: '#7c2d12' }} className="font-bold text-xs sm:text-sm text-right">Amount</div>
            </div>

            {/* Agent Rows */}
            <div className="max-h-60 sm:max-h-none overflow-y-auto divide-y divide-orange-100">
              {agents.map((agent) => (
                <div key={agent._id} className="grid grid-cols-2 px-4 sm:px-6 py-3.5 sm:py-4">
                  <div style={{ color: '#7c2d12' }} className="text-xs sm:text-sm font-medium truncate pr-2">
                    {agent.firstName} {agent.lastName}
                  </div>
                  <div style={{ color: '#e8724a' }} className="text-xs sm:text-sm font-semibold text-right whitespace-nowrap">
                    &nbsp;₹{amountPerAgent}
                  </div>
                </div>
              ))}
            </div>

            {/* Total Row */}
            <div style={{ background: '#fff8f5', borderTop: '1px solid #fdd9c8' }}
              className="grid grid-cols-2 px-4 sm:px-6 py-4 sm:py-5">
              <div style={{ color: '#7c2d12' }} className="font-extrabold text-base sm:text-lg">Total Amount</div>
              <div style={{ color: '#e8724a' }} className="font-extrabold text-base sm:text-lg text-right">₹{totalAmount}</div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row gap-3 mt-1">
            <button
              onClick={() => setShowMobilePopup(true)}
              style={{ background: 'linear-gradient(135deg, #e8724a, #f59e6c)' }}
              className="w-full sm:flex-1 text-white py-3 rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition active:scale-98 text-center">
              Proceed To Pay &rarr;
            </button>
            <button
              onClick={() => navigate("/home", { state: { city, area, customers, selectedCustomers } })}
              style={{ borderColor: '#fdd9c8', color: '#c2511f' }}
              className="w-full sm:flex-1 border-2 py-3 rounded-xl text-sm font-bold hover:bg-orange-50 transition bg-white sm:bg-transparent active:scale-98 text-center">
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Payment Popup */}
      {showMobilePopup && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(124, 45, 18, 0.35)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', border: '1px solid #fdd9c8' }}
            className="w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">

            <div style={{ background: 'linear-gradient(135deg, #e8724a, #f59e6c)' }}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl shadow mb-4">
              💳
            </div>

            <h2 style={{ color: '#7c2d12' }} className="text-lg sm:text-xl font-extrabold mb-2">Confirm Payment</h2>
            <p style={{ color: '#a8674a' }} className="text-xs sm:text-sm mb-5 sm:mb-6 leading-relaxed">
              Proceed to enter your details and receive agent contacts via SMS & WhatsApp.
            </p>

            <div style={{ background: '#fdd9c8' }} className="w-full h-px mb-5 sm:mb-6" />

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setShowMobilePopup(false);
                  navigate("/phoneform", { state: { agents, city, area, customers, selectedCustomers } });
                }}
                style={{ background: 'linear-gradient(135deg, #e8724a, #f59e6c)' }}
                className="w-full text-white py-3 rounded-xl text-sm font-bold shadow hover:opacity-90 transition">
                Continue &rarr;
              </button>

              <button
                onClick={() => setShowMobilePopup(false)}
                style={{ borderColor: '#fdd9c8', color: '#c2511f' }}
                className="w-full border-2 py-3 rounded-xl text-sm font-bold hover:bg-orange-50 transition bg-white">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(124, 45, 18, 0.35)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', border: '1px solid #fdd9c8' }}
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl">

            <div style={{ background: 'linear-gradient(135deg, #e8724a, #f59e6c)' }}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl shadow mb-4">
              ✅
            </div>

            <h2 style={{ color: '#7c2d12' }} className="text-2xl sm:text-3xl font-extrabold mb-1">Thank You!</h2>
            <p style={{ color: '#a8674a' }} className="text-xs sm:text-sm mb-5">
              Your request has been submitted successfully 💐
            </p>

            <div style={{ background: '#fdd9c8' }} className="w-full h-px mb-5" />

            {/* Grid Layout on Desktop, stack on Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {agents.map((agent) => (
                <div key={agent._id}
                  style={{ background: '#fff8f5', border: '1px solid #fdd9c8' }}
                  className="rounded-xl p-3.5 text-left">
                  <div style={{ color: '#7c2d12' }} className="font-bold text-sm truncate">
                    {agent.firstName} {agent.lastName}
                  </div>
                  <div style={{ color: '#a8674a' }} className="text-xs mt-1 truncate">📞 {agent.mobileNumber}</div>
                  <div style={{ color: '#a8674a' }} className="text-xs mt-0.5 truncate">📍 {agent.address}</div>
                  <div style={{ color: '#a8674a' }} className="text-xs mt-0.5 truncate">🏘️ {agent.area}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate("/home")}
              style={{ background: 'linear-gradient(135deg, #e8724a, #f59e6c)' }}
              className="mt-6 w-full text-white py-3 rounded-xl text-sm font-bold shadow hover:opacity-90 transition">
              Back to Home &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}