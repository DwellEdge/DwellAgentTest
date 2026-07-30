import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AgentLogin = () => {
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5002";

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [errorStatus, setErrorStatus] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = () => navigate("/agent-register");

  const handleLogin = async (e) => {
  e.preventDefault();

  if (!formData.username || !formData.password) {
    setErrorStatus("❌ Please enter both Username and Password");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/agent-auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: formData.username,
        password: formData.password,
      }),
    });

    const data = await response.json();

    console.log(data);

    if (!response.ok) {
      setErrorStatus(data.message);
      return;
    }

    sessionStorage.setItem(
      "agentUser",
      JSON.stringify(data.agent)
    );

    navigate("/agent-dashboard");
  } catch (err) {
    console.error(err);
    setErrorStatus("Server error");
  }
};
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, #fff7f3 0%, #ffe8dc 50%, #fff7f3 100%)",
      }}
    >
      {/* Navigation */}
      <nav
        style={{
          background: "rgba(255,255,255,0.8)",
          borderBottom: "1px solid #fdd9c8",
          backdropFilter: "blur(10px)",
        }}
        className="flex items-center justify-between px-4 sm:px-8 py-4 shadow-sm"
      >
        <div
          style={{ color: "#c2511f" }}
          className="text-lg sm:text-xl font-extrabold tracking-wide cursor-pointer"
          onClick={() => navigate("/")}
        >
          DWELLAGENT
        </div>

        <button
          onClick={() => navigate(-1)}
          style={{
            background: "rgba(255,255,255,0.9)",
            border: "1px solid #fdd9c8",
            color: "#c2511f",
          }}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full shadow-md text-xs sm:text-sm font-bold hover:shadow-lg transition"
        >
          &larr; Back
        </button>
      </nav>

      {/* Main Container */}
      <div className="flex flex-1 items-center justify-center px-4 py-6 sm:py-12">
        <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 lg:gap-12 items-center">

          {/* Left Section */}
          <div className="flex-1 hidden md:flex flex-col gap-5 text-left">
            <div
              style={{
                background: "linear-gradient(135deg, #e8724a, #f59e6c)",
              }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
            >
              💼
            </div>

            <h1
              style={{ color: "#7c2d12" }}
              className="text-3xl lg:text-4xl font-extrabold leading-tight"
            >
              Agent Portal
            </h1>

            <p
              style={{ color: "#a8674a" }}
              className="text-sm lg:text-base leading-relaxed"
            >
              Log in to access your properties, lead lists, customer
              requirements, and match profiles across your assigned areas.
            </p>

            <div className="flex flex-col gap-3 mt-1">
              {[
                {
                  icon: "📈",
                  text: "Track hot property leads instantly",
                },
                {
                  icon: "👥",
                  text: "Match buyer requirements directly",
                },
                {
                  icon: "🛡️",
                  text: "Verified agent network features",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    background: "#fff",
                    border: "1px solid #fdd9c8",
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-sm text-sm font-medium text-orange-900"
                >
                  <span>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Login Card */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #fdd9c8",
            }}
            className="w-full md:flex-1 rounded-2xl sm:rounded-3xl p-6 sm:p-10 flex flex-col gap-5 shadow-lg"
          >
            <div>
              <div
                style={{
                  background: "linear-gradient(135deg, #e8724a, #f59e6c)",
                }}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl shadow mb-3"
              >
                🔐
              </div>

              <h2
                style={{ color: "#7c2d12" }}
                className="text-xl sm:text-2xl font-extrabold"
              >
                Agent Login
              </h2>

              <p
                style={{ color: "#a8674a" }}
                className="mt-1 text-xs sm:text-sm"
              >
                Provide credentials to sign in to your real estate portal
              </p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              {/* Username */}
              <div className="flex flex-col gap-1 text-left">
                <label
                  style={{ color: "#7c2d12" }}
                  className="text-[11px] font-bold uppercase tracking-wide"
                >
                  Login ID or Email
                </label>

                <input
                  type="text"
                  name="username"
                  placeholder="Enter login ID or email"
                  value={formData.username}
                  onChange={handleChange}
                  style={{
                    borderColor: "#fdd9c8",
                    color: "#7c2d12",
                  }}
                  className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50/50 w-full placeholder-orange-300"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1 text-left">
                <label
                  style={{ color: "#7c2d12" }}
                  className="text-[11px] font-bold uppercase tracking-wide"
                >
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={handleChange}
                  style={{
                    borderColor: "#fdd9c8",
                    color: "#7c2d12",
                  }}
                  className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50/50 w-full placeholder-orange-300"
                />
              </div>

              {/* Validation Message */}
              {errorStatus && (
                <p className="text-red-500 text-sm">{errorStatus}</p>
              )}

              {/* Buttons */}
              <div className="flex flex-col gap-3 mt-2">
                <button
                  type="submit"
                  style={{
                    background:
                      "linear-gradient(135deg, #e8724a, #f59e6c)",
                  }}
                  className="w-full text-white py-3 rounded-xl text-sm font-bold shadow hover:opacity-90 transition"
                >
                  Login →
                </button>

                <button
                  type="button"
                  onClick={handleRegister}
                  style={{
                    borderColor: "#fdd9c8",
                    color: "#c2511f",
                  }}
                  className="w-full border-2 py-3 rounded-xl text-sm font-bold hover:bg-orange-50 transition bg-white"
                >
                  Register New Account
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <p
        style={{ color: "#d4a090" }}
        className="text-xs sm:text-sm text-center pb-6"
      >
        © 2026 DwellAgent
      </p>
    </div>
  );
};

export default AgentLogin;