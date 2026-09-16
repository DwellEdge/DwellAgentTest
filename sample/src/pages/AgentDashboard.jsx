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

export default function AgentDashboard() {
  const navigate = useNavigate();

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
      return;
    }

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
    }
  };

  return (
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
                </div>
              </div>

              <div className="flex flex-col gap-1">
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
                </div>
              </div>

              <div className="flex flex-col gap-1">
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
    </div>
  );
}