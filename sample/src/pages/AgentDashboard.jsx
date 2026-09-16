<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from '../components/Footer'

const getInitialFormData = () => ({
  propertyAvailableFor: "",
  propertyCost: "",
  propertyAddress: "",
  area: "",
  pinCode: "",
  facing: "",
  propertyType: "",
  carParking: false,
  twoWheelerParking: false,
  amenities: { gym: false, pool: false, badminton: false, others: "" },
  security: false,
  landmark: "",
});

const safeGetStoredUser = () => {
  try {
    const raw = window.localStorage.getItem("dwellagent_user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (error) {
    console.warn("Invalid dwellagent_user in localStorage:", error);
    return null;
  }
};
=======
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from '../components/Footer'

const FACING_OPTIONS = ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"];
const PROPERTY_TYPE_OPTIONS = ["Apartment", "Villa", "Plot", "Independent House", "Commercial", "Other"];
const PURPOSE_OPTIONS = ["Rent", "Lease", "Sale"];
>>>>>>> 4cc777a5e1edbc22743d6431326b424d0b1c4726

export default function AgentDashboard() {
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5002";

<<<<<<< HEAD
  const [formData, setFormData] = useState(getInitialFormData);

  const [status, setStatus] = useState({ type: "", message: "" });
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5002';

  useEffect(() => {
    const savedUser = safeGetStoredUser();
    if (!savedUser || (!savedUser.agentId && !savedUser.agentid && !savedUser._id)) {
      navigate('/agent-login');
      return;
    }
  }, [navigate]);

  const getLoggedAgentId = () => {
    const savedUser = safeGetStoredUser();
    return savedUser?.agentId || savedUser?.agentid || savedUser?._id || '';
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setStatus({ type: "", message: "" });
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setSelectedImages((prev) => {
      const combined = [...prev, ...files];
      // remove duplicates by name+size
      const unique = [];
      const seen = new Set();
      for (const f of combined) {
        const key = `${f.name}_${f.size}`;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(f);
        }
      }
      return unique;
    });
    // reset input value to allow selecting the same file again if needed
    e.target.value = null;
  };

  const handleVideosChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setSelectedVideos((prev) => {
      const combined = [...prev, ...files];
      const unique = [];
      const seen = new Set();
      for (const f of combined) {
        const key = `${f.name}_${f.size}`;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(f);
        }
      }
      return unique;
    });
    e.target.value = null;
  };

  const handleAmenityCheckbox = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, amenities: { ...prev.amenities, [name]: checked } }));
  };

  const handleOtherAmenitiesChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, amenities: { ...prev.amenities, others: value } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.propertyAvailableFor ||
      !formData.propertyCost ||
      !formData.propertyAddress ||
      !formData.area ||
      !formData.pinCode ||
      !formData.propertyType
    ) {
      setStatus({ type: "error", message: "❌ Please fill in all required fields." });
=======
  const [agent, setAgent] = useState(null);
  const [properties, setProperties] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const [form, setForm] = useState({
    propertyAvailableFor: "Rent",
    propertyCost: "",
    propertyAddress: "",
    area: "",
    city: "",
    pinCode: "",
    facing: "",
    propertyType: "",
    carParking: false,
    twoWheelerParking: false,
    landmark: "",
    amenities: {
      gym: false,
      pool: false,
      badminton: false,
      security: false,
      others: "",
    },
  });

  useEffect(() => {
    const stored = sessionStorage.getItem("agentUser");
    if (!stored) {
      navigate("/agent-login", { replace: true });
>>>>>>> 4cc777a5e1edbc22743d6431326b424d0b1c4726
      return;
    }
    const agentData = JSON.parse(stored);
    setAgent(agentData);
    fetchProperties(agentData.agentId);
  }, []);

<<<<<<< HEAD
    try {
      let uploaded = { images: [], videos: [] };

      if (selectedImages.length > 0 || selectedVideos.length > 0) {
        const mediaForm = new FormData();
        selectedImages.forEach((f) => mediaForm.append('images', f));
        selectedVideos.forEach((f) => mediaForm.append('videos', f));

        setStatus({ type: 'info', message: 'Uploading media...' });
        const resp = await fetch(`${API_BASE}/api/upload/media`, { method: 'POST', body: mediaForm });
        let data = null;
        // Try to parse JSON, but handle HTML or plain-text error responses
        const text = await resp.text();
        try {
          data = JSON.parse(text);
        } catch (parseErr) {
          // not JSON (could be HTML error page)
          console.error('Non-JSON response from upload:', text);
        }

        if (!resp.ok) {
          const serverMsg = (data && data.message) ? data.message : (text ? text.trim().slice(0, 500) : 'Server error');
          setStatus({ type: 'error', message: `Upload failed: ${serverMsg}` });
          return;
        }

        if (!data || !data.success) {
          setStatus({ type: 'error', message: (data && data.message) || 'Media upload failed' });
          return;
        }

        uploaded = data.files || uploaded;
      }

      const loggedAgentId = getLoggedAgentId();
      if (!loggedAgentId) {
        setStatus({ type: 'error', message: 'Your login session expired. Please login again.' });
        navigate('/agent-login');
        return;
      }

      // Persist listing to backend
      const mediaPaths = { images: [], videos: [] };
      if (uploaded) {
        if (uploaded.images && Array.isArray(uploaded.images)) {
          mediaPaths.images = uploaded.images.map((f) => `/uploads/images/${f.filename}`);
        }
        if (uploaded.videos && Array.isArray(uploaded.videos)) {
          mediaPaths.videos = uploaded.videos.map((f) => `/uploads/videos/${f.filename}`);
        }
      }

      const listing = {
        ...formData,
        propertyCost: Number(formData.propertyCost) || 0,
        media: mediaPaths,
        agentId: loggedAgentId,
        city: formData.area || '',
      };
      console.log('Listing payload:', listing);

      const saveResp = await fetch(`${API_BASE}/api/properties`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(listing) });
      const saveData = await saveResp.json();
      if (!saveResp.ok || !saveData || !saveData.success) {
        setStatus({ type: 'error', message: saveData?.message || 'Failed saving listing' });
        return;
      }

      setStatus({ type: 'success', message: 'Listing submitted successfully.' });
      setSelectedImages([]);
      setSelectedVideos([]);
      setFormData(getInitialFormData());

    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'An unexpected error occurred.' });
=======
  const fetchProperties = async (agentId) => {
    try {
      const res = await fetch(`${API_BASE}/api/properties/${agentId}`);
      const data = await res.json();
      setProperties(data || []);
    } catch (err) {
      console.error("Failed to fetch properties:", err.message);
>>>>>>> 4cc777a5e1edbc22743d6431326b424d0b1c4726
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setStatus("");
  };

  const handleAmenityChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      amenities: { ...prev.amenities, [key]: value },
    }));
  };

  const handleSubmit = async () => {
    const { propertyAvailableFor, propertyCost, propertyAddress, area, city, pinCode } = form;

    if (!propertyAvailableFor) { setStatus("❌ Please select purpose"); return; }
    if (!propertyCost || isNaN(propertyCost) || Number(propertyCost) <= 0) { setStatus("❌ Please enter a valid property cost"); return; }
    if (!propertyAddress.trim()) { setStatus("❌ Please enter property address"); return; }
    if (!area.trim()) { setStatus("❌ Please enter area"); return; }
    if (!city.trim()) { setStatus("❌ Please enter city"); return; }
    if (!/^\d{6}$/.test(pinCode.trim())) { setStatus("❌ Please enter a valid 6-digit pin code"); return; }

    setStatus("Submitting...");

    try {
      const res = await fetch(`${API_BASE}/api/properties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: agent.agentId,
          ...form,
          propertyCost: Number(form.propertyCost),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("");
        setShowSuccess(true);
        setShowForm(false);
        fetchProperties(agent.agentId);
        // Reset form
        setForm({
          propertyAvailableFor: "Rent",
          propertyCost: "",
          propertyAddress: "",
          area: "",
          city: "",
          pinCode: "",
          facing: "",
          propertyType: "",
          carParking: false,
          twoWheelerParking: false,
          landmark: "",
          amenities: { gym: false, pool: false, badminton: false, security: false, others: "" },
        });
      } else {
        setStatus("❌ " + (data.message || "Failed to add property"));
      }
    } catch (err) {
      setStatus("❌ Server error. Please try again.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("agentUser");
    navigate("/agent-login");
  };

  const daysLeft = (expiryDate) => {
    const diff = new Date(expiryDate) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (!agent) return null;

  return (
<<<<<<< HEAD
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #fff7f3 0%, #ffe8dc 50%, #fff7f3 100%)" }}>
      <main className="max-w-5xl mx-auto w-full px-4 py-10">
        <h2 className="text-2xl font-extrabold" style={{ color: '#7c2d12' }}>Agent Dashboard</h2>
        <p style={{ color: "#a8674a" }} className="mt-1 text-xs sm:text-sm">List new properties by filling out the details below</p>

        <div className="mt-6">
          <div style={{ background: "#fff", border: "1px solid #fdd9c8" }} className="rounded-2xl p-6 shadow-lg">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label style={{ color: "#7c2d12" }} className="text-[11px] font-bold uppercase">Property Available For *</label>
                  <select name="propertyAvailableFor" value={formData.propertyAvailableFor} onChange={handleInputChange} style={{ borderColor: "#fdd9c8", color: "#7c2d12" }} className="border-2 rounded-xl px-4 py-2 text-sm bg-orange-50/50 w-full">
                    <option value="">Select Option</option>
                    <option value="Rent">Rent</option>
                    <option value="Lease">Lease</option>
                    <option value="Sale">Sale</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label style={{ color: "#7c2d12" }} className="text-[11px] font-bold uppercase">Property Cost (₹) *</label>
                  <input type="number" name="propertyCost" placeholder="e.g. 25000" value={formData.propertyCost} onChange={handleInputChange} style={{ borderColor: "#fdd9c8", color: "#7c2d12" }} className="border-2 rounded-xl px-4 py-2 text-sm bg-orange-50/50 w-full" />
=======
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(135deg, #fff7f3 0%, #ffe8dc 50%, #fff7f3 100%)" }}
    >
      {/* Navbar */}
      <nav
        style={{ background: "rgba(255,255,255,0.8)", borderBottom: "1px solid #fdd9c8", backdropFilter: "blur(10px)" }}
        className="flex items-center justify-between px-8 py-4 shadow-sm"
      >
        <div
          style={{ color: "#c2511f" }}
          className="text-xl font-extrabold tracking-wide cursor-pointer"
          onClick={() => navigate("/")}
        >
          DWELLAGENT
        </div>
        <div className="flex items-center gap-3">
          <span style={{ color: "#a8674a" }} className="text-sm font-medium">
            Welcome, {agent.firstName} {agent.lastName}
          </span>
          <button
            onClick={handleLogout}
            style={{ border: "1px solid #fdd9c8", color: "#c2511f", background: "#fff" }}
            className="px-4 py-2 rounded-full text-sm font-bold hover:bg-orange-50 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="flex flex-col items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl flex flex-col gap-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 style={{ color: "#7c2d12" }} className="text-3xl font-extrabold">My Properties</h1>
              <p style={{ color: "#a8674a" }} className="mt-1 text-sm">
                {properties.length} active {properties.length === 1 ? "listing" : "listings"}
              </p>
            </div>
            <button
              onClick={() => { setShowForm(true); setStatus(""); }}
              style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }}
              className="text-white px-6 py-3 rounded-xl text-sm font-bold shadow hover:opacity-90 transition"
            >
              + Add Property
            </button>
          </div>

          {/* Properties list */}
          {properties.length === 0 && !showForm && (
            <div
              style={{ background: "#fff", border: "1px solid #fdd9c8" }}
              className="rounded-3xl p-10 text-center shadow-lg"
            >
              <div className="text-5xl mb-4">🏠</div>
              <h3 style={{ color: "#7c2d12" }} className="text-xl font-extrabold mb-2">No Properties Yet</h3>
              <p style={{ color: "#a8674a" }} className="text-sm">
                Click "Add Property" to list your first property.
              </p>
            </div>
          )}

          {properties.length > 0 && (
            <div className="flex flex-col gap-4">
              {properties.map((prop) => (
                <div
                  key={prop._id}
                  style={{ background: "#fff", border: "1px solid #fdd9c8" }}
                  className="rounded-2xl p-5 shadow-md flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)", color: "#fff" }}
                          className="text-xs font-bold px-3 py-1 rounded-full"
                        >
                          {prop.propertyAvailableFor}
                        </span>
                        {prop.propertyType && (
                          <span
                            style={{ background: "#fff8f5", color: "#c2511f", border: "1px solid #fdd9c8" }}
                            className="text-xs font-semibold px-3 py-1 rounded-full"
                          >
                            {prop.propertyType}
                          </span>
                        )}
                      </div>
                      <p style={{ color: "#7c2d12" }} className="font-bold text-base mt-2">
                        ₹{prop.propertyCost?.toLocaleString()}
                      </p>
                    </div>
                    <span style={{ color: "#a8674a" }} className="text-xs">
                      {daysLeft(prop.expiryDate)} days left
                    </span>
                  </div>
                  <p style={{ color: "#a8674a" }} className="text-sm">📍 {prop.propertyAddress}, {prop.area}, {prop.city} - {prop.pinCode}</p>
                  {prop.landmark && <p style={{ color: "#a8674a" }} className="text-xs">🗺️ Near {prop.landmark}</p>}
                  <div className="flex flex-wrap gap-2 mt-1">
                    {prop.carParking && <span style={{ color: "#c2511f", background: "#fff8f5", border: "1px solid #fdd9c8" }} className="text-xs px-2 py-1 rounded-full">🚗 Car Parking</span>}
                    {prop.twoWheelerParking && <span style={{ color: "#c2511f", background: "#fff8f5", border: "1px solid #fdd9c8" }} className="text-xs px-2 py-1 rounded-full">🛵 2-Wheeler Parking</span>}
                    {prop.amenities?.gym && <span style={{ color: "#c2511f", background: "#fff8f5", border: "1px solid #fdd9c8" }} className="text-xs px-2 py-1 rounded-full">💪 Gym</span>}
                    {prop.amenities?.pool && <span style={{ color: "#c2511f", background: "#fff8f5", border: "1px solid #fdd9c8" }} className="text-xs px-2 py-1 rounded-full">🏊 Pool</span>}
                    {prop.amenities?.badminton && <span style={{ color: "#c2511f", background: "#fff8f5", border: "1px solid #fdd9c8" }} className="text-xs px-2 py-1 rounded-full">🏸 Badminton</span>}
                    {prop.amenities?.security && <span style={{ color: "#c2511f", background: "#fff8f5", border: "1px solid #fdd9c8" }} className="text-xs px-2 py-1 rounded-full">🔒 Security</span>}
                  </div>
>>>>>>> 4cc777a5e1edbc22743d6431326b424d0b1c4726
                </div>
              ))}
            </div>
          )}

          {/* Add Property Form */}
          {showForm && (
            <div
              style={{ background: "#fff", border: "1px solid #fdd9c8" }}
              className="rounded-3xl p-8 shadow-lg flex flex-col gap-5"
            >
              <div className="flex items-center justify-between">
                <h2 style={{ color: "#7c2d12" }} className="text-xl font-extrabold">Add New Property</h2>
                <button
                  onClick={() => { setShowForm(false); setStatus(""); }}
                  style={{ color: "#a8674a" }}
                  className="text-sm hover:underline"
                >
                  Cancel
                </button>
              </div>

              {/* Property Available For */}
              <div className="flex flex-col gap-1">
                <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">
                  Property Available For *
                </label>
                <div className="flex gap-3 flex-wrap">
                  {PURPOSE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleChange("propertyAvailableFor", opt)}
                      style={
                        form.propertyAvailableFor === opt
                          ? { background: "linear-gradient(135deg, #e8724a, #f59e6c)", color: "#fff" }
                          : { background: "#fff8f5", color: "#c2511f", border: "1px solid #fdd9c8" }
                      }
                      className="px-5 py-2 rounded-full text-sm font-bold transition hover:opacity-90"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cost */}
              <div className="flex flex-col gap-1">
                <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">
                  Property Cost (₹) *
                </label>
                <input
                  type="number"
                  value={form.propertyCost}
                  onChange={(e) => handleChange("propertyCost", e.target.value)}
                  placeholder="e.g. 15000"
                  style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                  className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300"
                />
              </div>

              <div className="flex flex-col gap-1">
<<<<<<< HEAD
                <label style={{ color: "#7c2d12" }} className="text-[11px] font-bold uppercase">Property Address *</label>
                <textarea rows={2} name="propertyAddress" placeholder="Enter full property address" value={formData.propertyAddress} onChange={handleInputChange} style={{ borderColor: "#fdd9c8", color: "#7c2d12" }} className="border-2 rounded-xl px-4 py-2 text-sm bg-orange-50/50 w-full resize-none" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1">
                  <label style={{ color: "#7c2d12" }} className="text-[11px] font-bold uppercase">Area *</label>
                  <input type="text" name="area" placeholder="e.g. Indiranagar" value={formData.area} onChange={handleInputChange} style={{ borderColor: "#fdd9c8", color: "#7c2d12" }} className="border-2 rounded-xl px-4 py-2 text-sm bg-orange-50/50 w-full" />
                </div>

                <div className="flex flex-col gap-1">
                  <label style={{ color: "#7c2d12" }} className="text-[11px] font-bold uppercase">Pin Code *</label>
                  <input type="text" name="pinCode" maxLength={6} placeholder="e.g. 560038" value={formData.pinCode} onChange={handleInputChange} style={{ borderColor: "#fdd9c8", color: "#7c2d12" }} className="border-2 rounded-xl px-4 py-2 text-sm bg-orange-50/50 w-full" />
                </div>

                <div className="flex flex-col gap-1">
                  <label style={{ color: "#7c2d12" }} className="text-[11px] font-bold uppercase">Facing</label>
                  <input type="text" name="facing" placeholder="e.g. East" value={formData.facing} onChange={handleInputChange} style={{ borderColor: "#fdd9c8", color: "#7c2d12" }} className="border-2 rounded-xl px-4 py-2 text-sm bg-orange-50/50 w-full" />
                </div>

                <div className="flex flex-col gap-1">
                  <label style={{ color: "#7c2d12" }} className="text-[11px] font-bold uppercase">Property Type *</label>
                  <input type="text" name="propertyType" placeholder="e.g. 2 BHK Apartment" value={formData.propertyType} onChange={handleInputChange} style={{ borderColor: "#fdd9c8", color: "#7c2d12" }} className="border-2 rounded-xl px-4 py-2 text-sm bg-orange-50/50 w-full" />
=======
                <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">
                  Property Address *
                </label>
                <textarea
                  value={form.propertyAddress}
                  onChange={(e) => handleChange("propertyAddress", e.target.value)}
                  placeholder="Full property address"
                  rows={2}
                  style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                  className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300 resize-none"
                />
              </div>

              {/* Area + City */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">Area *</label>
                  <input
                    type="text"
                    value={form.area}
                    onChange={(e) => handleChange("area", e.target.value)}
                    placeholder="e.g. Miyapur"
                    style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                    className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">City *</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder="e.g. Hyderabad"
                    style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                    className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300"
                  />
                </div>
              </div>

              {/* Pin Code + Facing */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">Pin Code *</label>
                  <input
                    type="text"
                    value={form.pinCode}
                    onChange={(e) => handleChange("pinCode", e.target.value.replace(/\D/g, ""))}
                    placeholder="6-digit pin code"
                    maxLength={6}
                    style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                    className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">Facing</label>
                  <select
                    value={form.facing}
                    onChange={(e) => handleChange("facing", e.target.value)}
                    style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                    className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50"
                  >
                    <option value="">Select facing</option>
                    {FACING_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              {/* Property Type */}
              <div className="flex flex-col gap-1">
                <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">Property Type</label>
                <select
                  value={form.propertyType}
                  onChange={(e) => handleChange("propertyType", e.target.value)}
                  style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                  className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50"
                >
                  <option value="">Select property type</option>
                  {PROPERTY_TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Parking */}
              <div className="flex flex-col gap-2">
                <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">Parking</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.carParking}
                      onChange={(e) => handleChange("carParking", e.target.checked)}
                      className="h-4 w-4 accent-[#e8724a]"
                    />
                    <span style={{ color: "#7c2d12" }} className="text-sm font-medium">🚗 Car Parking</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.twoWheelerParking}
                      onChange={(e) => handleChange("twoWheelerParking", e.target.checked)}
                      className="h-4 w-4 accent-[#e8724a]"
                    />
                    <span style={{ color: "#7c2d12" }} className="text-sm font-medium">🛵 Two-Wheeler Parking</span>
                  </label>
                </div>
              </div>

              {/* Amenities */}
              <div className="flex flex-col gap-2">
                <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">Amenities</label>
                <div className="flex flex-wrap gap-4">
                  {["gym", "pool", "badminton", "security"].map((key) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.amenities[key]}
                        onChange={(e) => handleAmenityChange(key, e.target.checked)}
                        className="h-4 w-4 accent-[#e8724a]"
                      />
                      <span style={{ color: "#7c2d12" }} className="text-sm font-medium capitalize">
                        {key === "gym" ? "💪 Gym" : key === "pool" ? "🏊 Pool" : key === "badminton" ? "🏸 Badminton" : "🔒 Security"}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="flex flex-col gap-1 mt-1">
                  <label style={{ color: "#7c2d12" }} className="text-xs font-medium">
                    Others (space separated)
                  </label>
                  <input
                    type="text"
                    value={form.amenities.others}
                    onChange={(e) => handleAmenityChange("others", e.target.value)}
                    placeholder="e.g. Clubhouse Playground Garden"
                    style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                    className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300"
                  />
>>>>>>> 4cc777a5e1edbc22743d6431326b424d0b1c4726
                </div>
              </div>

              <div className="flex flex-col gap-1">
<<<<<<< HEAD
                <label style={{ color: "#7c2d12" }} className="text-[11px] font-bold uppercase">Landmark</label>
                <input type="text" name="landmark" placeholder="e.g. Near Metro" value={formData.landmark} onChange={handleInputChange} style={{ borderColor: "#fdd9c8", color: "#7c2d12" }} className="border-2 rounded-xl px-4 py-2 text-sm bg-orange-50/50 w-full" />
              </div>

              <div style={{ background: "#fdd9c8" }} className="w-full h-px my-1" />

              <div className="flex flex-col gap-2">
                <span style={{ color: "#7c2d12" }} className="text-[11px] font-bold uppercase">Parking Facilities</span>
                <div className="flex flex-wrap gap-6 mt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-800"><input type="checkbox" name="carParking" checked={formData.carParking} onChange={handleInputChange} className="h-5 w-5 rounded accent-[#e8724a]" /> Car Parking</label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-800"><input type="checkbox" name="twoWheelerParking" checked={formData.twoWheelerParking} onChange={handleInputChange} className="h-5 w-5 rounded accent-[#e8724a]" /> Two-wheeler Parking</label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-800"><input type="checkbox" name="security" checked={formData.security} onChange={handleInputChange} className="h-5 w-5 rounded accent-[#e8724a]" /> Security</label>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span style={{ color: "#7c2d12" }} className="text-[11px] font-bold uppercase">Amenities</span>
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-800"><input type="checkbox" name="gym" checked={formData.amenities.gym} onChange={handleAmenityCheckbox} className="h-5 w-5 rounded accent-[#e8724a]" /> Gym</label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-800"><input type="checkbox" name="pool" checked={formData.amenities.pool} onChange={handleAmenityCheckbox} className="h-5 w-5 rounded accent-[#e8724a]" /> Pool</label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-800"><input type="checkbox" name="badminton" checked={formData.amenities.badminton} onChange={handleAmenityCheckbox} className="h-5 w-5 rounded accent-[#e8724a]" /> Badminton</label>
                </div>

                <div className="flex flex-col gap-1 mt-2">
                  <label style={{ color: "#a8674a" }} className="text-xs font-semibold">Other Amenities (Space separated list):</label>
                  <input type="text" value={formData.amenities.others} onChange={handleOtherAmenitiesChange} placeholder="e.g. Clubhouse Lift Garden Generator" style={{ borderColor: "#fdd9c8", color: "#7c2d12" }} className="border-2 rounded-xl px-4 py-2 text-sm bg-orange-50/50 w-full" />
                </div>
              </div>

              {/* Media Inputs inside the form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-4 rounded-2xl border border-orange-100">
                <div>
                  <h4 className="text-sm font-semibold text-[#7c2d12] mb-2">Images</h4>
                  <p className="text-xs text-slate-600 mb-2">Select one or more images to attach to this listing.</p>
                  <label className="inline-block border-2 border-black rounded-md px-3 py-1.5 text-sm cursor-pointer bg-white">
                    Choose files
                    <input type="file" accept="image/*" multiple onChange={handleImagesChange} className="hidden" />
                  </label>
                  {selectedImages.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-3">
                      {selectedImages.map((file, i) => (
                        <div key={i} className="w-20 h-20 bg-slate-100 rounded overflow-hidden flex items-center justify-center">
                          <img src={URL.createObjectURL(file)} alt={file.name} className="object-cover w-full h-full" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-[#7c2d12] mb-2">Videos</h4>
                  <p className="text-xs text-slate-600 mb-2">Select one or more videos to attach to this listing.</p>
                  <label className="inline-block border-2 border-black rounded-md px-3 py-1.5 text-sm cursor-pointer bg-white">
                    Choose files
                    <input type="file" accept="video/*" multiple onChange={handleVideosChange} className="hidden" />
                  </label>
                  {selectedVideos.length > 0 && (
                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                      {selectedVideos.map((f, i) => (
                        <div key={i} className="truncate">{f.name}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {status.message && (
                <p className={`text-xs sm:text-sm font-semibold ${status.type === "error" ? "text-red-500" : "text-emerald-600"}`}>{status.message}</p>
              )}

              <button type="submit" style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }} className="w-full text-white py-3.5 rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition active:scale-98 mt-2">Submit Listing →</button>
            </form>
          </div>
        </div>
      </main>
=======
                <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">Landmark</label>
                <input
                  type="text"
                  value={form.landmark}
                  onChange={(e) => handleChange("landmark", e.target.value)}
                  placeholder="e.g. Near Metro Station"
                  style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                  className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300"
                />
              </div>

              {status && (
                <p
                  style={{ color: status.startsWith("❌") ? "#ef4444" : "#a8674a" }}
                  className="text-sm font-medium"
                >
                  {status}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={status === "Submitting..."}
                style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }}
                className="w-full text-white py-3 rounded-xl text-sm font-bold shadow hover:opacity-90 transition disabled:cursor-not-allowed"
              >
                {status === "Submitting..." ? "Submitting..." : "Submit Property →"}
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
      {/* Success Popup */}
      {showSuccess && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(124, 45, 18, 0.3)", backdropFilter: "blur(4px)" }}
        >
          <div
            style={{ background: "#fff", border: "1px solid #fdd9c8" }}
            className="rounded-3xl p-8 shadow-2xl w-full max-w-md text-center mx-4"
          >
            <div
              style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg mx-auto mb-4"
            >
              ✅
            </div>
            <h2 style={{ color: "#7c2d12" }} className="text-2xl font-extrabold mb-3">Property Listed!</h2>
            <p style={{ color: "#a8674a" }} className="text-sm mb-6 leading-relaxed">
              Your property has been successfully listed and will be visible to customers for 90 days.
            </p>
            <div style={{ background: "#fdd9c8" }} className="w-full h-px mb-6" />
            <button
              onClick={() => setShowSuccess(false)}
              style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }}
              className="w-full text-white px-8 py-3 rounded-xl text-sm font-bold shadow hover:opacity-90 transition"
            >
              OK →
            </button>
          </div>
        </div>
      )}
>>>>>>> 4cc777a5e1edbc22743d6431326b424d0b1c4726
    </div>
  );
}