import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from '../components/Footer'

export default function AgentDashboard() {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    propertyAvailableFor: "",
    propertyCost: "",
    propertyAddress: "",
    area: "",
    pinCode: "",
    facing: "",
    propertyType: "",
    carParking: false,
    twoWheelerParking: false,
    amenities: {
      gym: false,
      pool: false,
      badminton: false,
      others: "",
    },
    security: false,
    landmark: "",
  });

  const [status, setStatus] = useState({ type: "", message: "" });

  // Input Change Handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setStatus({ type: "", message: "" });
  };

  const handleAmenityCheckbox = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [name]: checked,
      },
    }));
  };

  const handleOtherAmenitiesChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        others: value,
      },
    }));
  };

  // Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic Validation
    if (
      !formData.propertyAvailableFor ||
      !formData.propertyCost ||
      !formData.propertyAddress ||
      !formData.area ||
      !formData.pinCode ||
      !formData.propertyType
    ) {
      setStatus({ type: "error", message: "❌ Please fill in all required fields." });
      return;
    }

    console.log("Submitted Property Details:", formData);
    setStatus({ type: "success", message: "✅ Property listing submitted successfully!" });
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(135deg, #fff7f3 0%, #ffe8dc 50%, #fff7f3 100%)" }}
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/agent-login")}
            style={{
              background: "rgba(255,255,255,0.9)",
              border: "1px solid #fdd9c8",
              color: "#c2511f",
            }}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full shadow-md text-xs sm:text-sm font-bold hover:shadow-lg transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content Form */}
      <main className="flex flex-1 justify-center px-4 py-6 sm:py-12">
        <div className="w-full max-w-4xl flex flex-col gap-6">
          {/* Header Banner */}
          <div className="px-1 text-left">
            <div
              style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }}
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg mb-3"
            >
              🏢
            </div>
            <h1 style={{ color: "#7c2d12" }} className="text-2xl sm:text-3xl font-extrabold">
              Agent Dashboard
            </h1>
            <p style={{ color: "#a8674a" }} className="mt-1 text-xs sm:text-sm">
              List new properties by filling out the details below
            </p>
          </div>

          {/* Form Card Container */}
          <div
            style={{ background: "#fff", border: "1px solid #fdd9c8" }}
            className="rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-lg text-left"
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Grid 1: Basic Property Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Dropdown: Property available for */}
                <div className="flex flex-col gap-1">
                  <label style={{ color: "#7c2d12" }} className="text-[11px] font-bold uppercase tracking-wide">
                    Property Available For *
                  </label>
                  <select
                    name="propertyAvailableFor"
                    value={formData.propertyAvailableFor}
                    onChange={handleInputChange}
                    style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                    className="border-2 rounded-xl px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50/50 w-full"
                  >
                    <option value="">Select Option</option>
                    <option value="Rent">Rent</option>
                    <option value="Lease">Lease</option>
                    <option value="Sale">Sale</option>
                  </select>
                </div>

                {/* Property Cost */}
                <div className="flex flex-col gap-1">
                  <label style={{ color: "#7c2d12" }} className="text-[11px] font-bold uppercase tracking-wide">
                    Property Cost (₹) *
                  </label>
                  <input
                    type="number"
                    name="propertyCost"
                    placeholder="e.g. 25000 or 8500000"
                    value={formData.propertyCost}
                    onChange={handleInputChange}
                    style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                    className="border-2 rounded-xl px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50/50 w-full placeholder-orange-300"
                  />
                </div>
              </div>

              {/* Property Address */}
              <div className="flex flex-col gap-1">
                <label style={{ color: "#7c2d12" }} className="text-[11px] font-bold uppercase tracking-wide">
                  Property Address *
                </label>
                <textarea
                  rows={2}
                  name="propertyAddress"
                  placeholder="Enter full property address"
                  value={formData.propertyAddress}
                  onChange={handleInputChange}
                  style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                  className="border-2 rounded-xl px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50/50 w-full placeholder-orange-300 resize-none"
                />
              </div>

              {/* Grid 2: Area, Pin Code, Facing, Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Area */}
                <div className="flex flex-col gap-1">
                  <label style={{ color: "#7c2d12" }} className="text-[11px] font-bold uppercase tracking-wide">
                    Area *
                  </label>
                  <input
                    type="text"
                    name="area"
                    placeholder="e.g. Indiranagar"
                    value={formData.area}
                    onChange={handleInputChange}
                    style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                    className="border-2 rounded-xl px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50/50 w-full placeholder-orange-300"
                  />
                </div>

                {/* Pin Code */}
                <div className="flex flex-col gap-1">
                  <label style={{ color: "#7c2d12" }} className="text-[11px] font-bold uppercase tracking-wide">
                    Pin Code *
                  </label>
                  <input
                    type="text"
                    name="pinCode"
                    maxLength={6}
                    placeholder="e.g. 560038"
                    value={formData.pinCode}
                    onChange={handleInputChange}
                    style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                    className="border-2 rounded-xl px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50/50 w-full placeholder-orange-300"
                  />
                </div>

                {/* Facing */}
                <div className="flex flex-col gap-1">
                  <label style={{ color: "#7c2d12" }} className="text-[11px] font-bold uppercase tracking-wide">
                    Facing
                  </label>
                  <input
                    type="text"
                    name="facing"
                    placeholder="e.g. East / North"
                    value={formData.facing}
                    onChange={handleInputChange}
                    style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                    className="border-2 rounded-xl px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50/50 w-full placeholder-orange-300"
                  />
                </div>

                {/* Property Type */}
                <div className="flex flex-col gap-1">
                  <label style={{ color: "#7c2d12" }} className="text-[11px] font-bold uppercase tracking-wide">
                    Property Type *
                  </label>
                  <input
                    type="text"
                    name="propertyType"
                    placeholder="e.g. 2 BHK Apartment / Villa"
                    value={formData.propertyType}
                    onChange={handleInputChange}
                    style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                    className="border-2 rounded-xl px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50/50 w-full placeholder-orange-300"
                  />
                </div>
              </div>

              {/* Landmark */}
              <div className="flex flex-col gap-1">
                <label style={{ color: "#7c2d12" }} className="text-[11px] font-bold uppercase tracking-wide">
                  Landmark
                </label>
                <input
                  type="text"
                  name="landmark"
                  placeholder="e.g. Near Metro Station / Behind Central Mall"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                  className="border-2 rounded-xl px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50/50 w-full placeholder-orange-300"
                />
              </div>

              <div style={{ background: "#fdd9c8" }} className="w-full h-px my-1" />

              {/* Parking Options Section */}
              <div className="flex flex-col gap-2">
                <span style={{ color: "#7c2d12" }} className="text-[11px] font-bold uppercase tracking-wide">
                  Parking Facilities
                </span>
                <div className="flex flex-wrap gap-6 mt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-800">
                    <input
                      type="checkbox"
                      name="carParking"
                      checked={formData.carParking}
                      onChange={handleInputChange}
                      className="h-5 w-5 rounded accent-[#e8724a]"
                    />
                    Car Parking
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-800">
                    <input
                      type="checkbox"
                      name="twoWheelerParking"
                      checked={formData.twoWheelerParking}
                      onChange={handleInputChange}
                      className="h-5 w-5 rounded accent-[#e8724a]"
                    />
                    Two-wheeler Parking
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-800">
                    <input
                      type="checkbox"
                      name="security"
                      checked={formData.security}
                      onChange={handleInputChange}
                      className="h-5 w-5 rounded accent-[#e8724a]"
                    />
                    Security
                  </label>
                </div>
              </div>

              {/* Amenities Section */}
              <div className="flex flex-col gap-3">
                <span style={{ color: "#7c2d12" }} className="text-[11px] font-bold uppercase tracking-wide">
                  Amenities
                </span>

                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-800">
                    <input
                      type="checkbox"
                      name="gym"
                      checked={formData.amenities.gym}
                      onChange={handleAmenityCheckbox}
                      className="h-5 w-5 rounded accent-[#e8724a]"
                    />
                    Gym
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-800">
                    <input
                      type="checkbox"
                      name="pool"
                      checked={formData.amenities.pool}
                      onChange={handleAmenityCheckbox}
                      className="h-5 w-5 rounded accent-[#e8724a]"
                    />
                    Pool
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-800">
                    <input
                      type="checkbox"
                      name="badminton"
                      checked={formData.amenities.badminton}
                      onChange={handleAmenityCheckbox}
                      className="h-5 w-5 rounded accent-[#e8724a]"
                    />
                    Badminton
                  </label>
                </div>

                {/* Custom Amenities Text Input */}
                <div className="flex flex-col gap-1 mt-2">
                  <label style={{ color: "#a8674a" }} className="text-xs font-semibold">
                    Other Amenities (Space separated list):
                  </label>
                  <input
                    type="text"
                    value={formData.amenities.others}
                    onChange={handleOtherAmenitiesChange}
                    placeholder="e.g. Clubhouse Lift Garden Generator"
                    style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                    className="border-2 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-300 bg-orange-50/50 w-full placeholder-orange-300"
                  />
                </div>
              </div>

              {/* Status Banner */}
              {status.message && (
                <p
                  className={`text-xs sm:text-sm font-semibold ${
                    status.type === "error" ? "text-red-500" : "text-emerald-600"
                  }`}
                >
                  {status.message}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }}
                className="w-full text-white py-3.5 rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition active:scale-98 mt-2"
              >
                Submit Listing →
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}