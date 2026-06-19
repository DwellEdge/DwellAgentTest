import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function PhoneForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const agents = location.state?.agents || [];

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setStatus("❌ Please enter your name");
      return;
    }

    if (phone.length !== 10 || isNaN(phone)) {
      setStatus("❌ Enter a valid 10-digit number");
      return;
    }

    setStatus("Sending...");

    try {
      // Send WhatsApp & SMS + Save to DB
      const API_BASE =
        import.meta.env.VITE_API_URL || "http://localhost:5002";

      const res = await fetch(`${API_BASE}/api/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name, agents }),
      });

      const data = await res.json();

      if (data.success) {
        setShowSuccessPopup(true);
        setName("");
        setPhone("");
        setStatus("");
      } else {
        setStatus("❌ Failed: " + data.error);
      }
    } catch (err) {
      setStatus("❌ Server error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(135deg, #fff7f3 0%, #ffe8dc 50%, #fff7f3 100%)" }}
    >
      {/* Navbar */}
      <nav style={{ background: "rgba(255,255,255,0.8)", borderBottom: "1px solid #fdd9c8", backdropFilter: "blur(10px)" }}
        className="flex items-center justify-between px-4 sm:px-8 py-4 shadow-sm"
      >
        <div
          style={{ color: "#c2511f" }}
          className="text-lg sm:text-xl font-extrabold tracking-wide cursor-pointer"
          onClick={() => navigate("/")}
        >
          DWELLAGENT
        </div>
        <button onClick={() => navigate(-1)}
          style={{ background: "rgba(255,255,255,0.9)", border: "1px solid #fdd9c8", color: "#c2511f" }}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full shadow-md text-xs sm:text-sm font-bold hover:shadow-lg transition"
        >
          &larr; Back
        </button>
      </nav>

      {/* Main Framework Section */}
      <div className="flex flex-1 items-center justify-center px-4 py-6 sm:py-12">
        <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 lg:gap-12 items-center">

          {/* Left - Appears on iPad/Desktop, completely optimized context space */}
          <div className="flex-1 hidden md:flex flex-col gap-5 text-left">
            <div style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
            >
              📱
            </div>
            <h1 style={{ color: "#7c2d12" }} className="text-3xl lg:text-4xl font-extrabold leading-tight">
              Stay<br />Connected
            </h1>
            <p style={{ color: "#a8674a" }} className="text-sm lg:text-base leading-relaxed">
              Enter your name and phone number to receive instant agent contacts
              and property updates via SMS & WhatsApp.
            </p>
            
            <div className="flex flex-col gap-3 mt-1">
              {[
                { icon: "💬", text: "Instant WhatsApp notifications" },
                { icon: "📩", text: "SMS alerts for new listings" },
                { icon: "🏠", text: "Property updates in real time" },
              ].map((item, i) => (
                <div key={i}
                  style={{ background: "#fff", border: "1px solid #fdd9c8" }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-sm text-sm font-medium text-orange-900"
                >
                  <span className="shrink-0">{item.icon}</span> {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Right - Form Block (Takes full width on Mobile dynamically) */}
          <div style={{ background: "#fff", border: "1px solid #fdd9c8" }}
            className="w-full md:flex-1 rounded-2xl sm:rounded-3xl p-6 sm:p-10 flex flex-col gap-5 shadow-lg"
          >
            <div>
              <div style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl shadow mb-3"
              >
                📱
              </div>
              <h2 style={{ color: "#7c2d12" }} className="text-xl sm:text-2xl font-extrabold">
                Get In Touch
              </h2>
              <p style={{ color: "#a8674a" }} className="mt-1 text-xs sm:text-sm">
                Submit your details and we'll reach out via SMS & WhatsApp
              </p>
            </div>

            {/* Name Input */}
            <div className="flex flex-col gap-1 text-left">
              <label style={{ color: "#7c2d12" }} className="text-[11px] font-bold uppercase tracking-wide">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setStatus("");
                }}
                placeholder="Enter your full name"
                style={{
                  borderColor: status.startsWith("❌") && !name.trim() ? "#f87171" : "#fdd9c8",
                  color: "#7c2d12",
                }}
                className="border-2 rounded-xl px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50/50 w-full placeholder-orange-300"
              />
            </div>

            {/* Phone Input */}
            <div className="flex flex-col gap-1 text-left">
              <label style={{ color: "#7c2d12" }} className="text-[11px] font-bold uppercase tracking-wide">
                Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, ""));
                  setStatus("");
                }}
                placeholder="Mobile Number (10 digits)"
                maxLength={10}
                inputMode="numeric"
                style={{
                  borderColor: status.startsWith("❌") && name.trim() && phone.length < 10 ? "#f87171" : "#fdd9c8",
                  color: "#7c2d12",
                }}
                className="border-2 rounded-xl px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50/50 w-full placeholder-orange-300"
              />
            </div>

            {/* Form Error / Notification Status */}
            {status && (
              <p
                style={{
                  color: status.startsWith("❌") ? "#ef4444" : status === "Sending..." ? "#a8674a" : "#16a34a",
                }}
                className="text-xs sm:text-sm -mt-1 font-medium text-left"
              >
                {status}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={status === "Sending..."}
              style={{
                background: status === "Sending..." ? "#f5c4a8" : "linear-gradient(135deg, #e8724a, #f59e6c)",
              }}
              className="w-full text-white py-3 rounded-xl text-sm font-bold shadow hover:opacity-90 transition disabled:cursor-not-allowed active:scale-98"
            >
              {status === "Sending..." ? "Sending..." : "Submit →"}
            </button>
          </div>
        </div>
      </div>

      <p style={{ color: "#d4a090" }} className="text-xs sm:text-sm text-center pb-6">
        © 2026 DwellAgent
      </p>

      {/* Success Popup Modal */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(124, 45, 18, 0.35)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', border: '1px solid #fdd9c8' }}
            className="rounded-3xl p-6 sm:p-8 shadow-2xl w-full max-w-md text-center">

            <div style={{ background: 'linear-gradient(135deg, #e8724a, #f59e6c)' }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg mx-auto mb-4">
              ✅
            </div>

            <h2 style={{ color: '#7c2d12' }} className="text-xl sm:text-2xl font-extrabold mb-2">Success!</h2>
            <p style={{ color: '#a8674a' }} className="text-xs sm:text-sm mb-5 leading-relaxed px-1">
              SMS and WhatsApp message sent to your mobile successfully.
            </p>

            <div style={{ background: '#fdd9c8' }} className="w-full h-px mb-5" />

            <button
              onClick={() => { setShowSuccessPopup(false); navigate("/"); }}
              style={{ background: 'linear-gradient(135deg, #e8724a, #f59e6c)' }}
              className="w-full text-white py-3 rounded-xl text-sm font-bold shadow hover:opacity-90 transition">
              OK &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}