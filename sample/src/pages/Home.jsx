import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [locations, setLocations] = useState([]);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

  const getLocationLabel = (displayName) => displayName || "";

  const fetchCities = async (searchValue) => {
    const query = searchValue?.trim();
    if (!query || query.length < 2) {
      setCitySuggestions([]);
      return;
    }

    try {
      const res = await axios.get(`${API_BASE}/api/location`, {
        params: { q: `${query} India` }
      });
      const uniqueCities = new Map();
      (res.data || []).forEach((loc) => {
        const cityName = loc.display_name?.split(",").slice(-3, -1).join(",").trim() || loc.display_name;
        if (cityName && !uniqueCities.has(cityName)) {
          uniqueCities.set(cityName, { display_name: cityName, place_id: loc.place_id });
        }
      });
      setCitySuggestions(Array.from(uniqueCities.values()).slice(0, 8));
    } catch (err) {
      console.log(err);
      setCitySuggestions([]);
    }
  };

  const fetchAreas = async (areaValue, cityValue) => {
    const areaQuery = areaValue?.trim();
    const cityQuery = cityValue?.trim();
    const searchQuery = [areaQuery, cityQuery, "India"].filter(Boolean).join(" ");

    if (!areaQuery || areaQuery.length < 2) {
      setLocations([]);
      return;
    }

    try {
      const res = await axios.get(`${API_BASE}/api/location`, {
        params: { q: searchQuery }
      });
      setLocations(res.data || []);
    } catch (err) {
      console.log(err);
      setLocations([]);
    }
  };

  const fetchCustomers = async (areaValue, cityValue) => {
    try {
      setLoading(true);
      setSearchPerformed(true);
      console.log("Fetching customers - City:", cityValue, "Area:", areaValue);

      const res = await axios.get(`${API_BASE}/api/customers`, {
        params: { city: cityValue, area: areaValue }
      });

      console.log("API Response:", res.data);
      setCustomers(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setCustomers([]);
      setLoading(false);
    }
  };

  const handleCityChange = (val) => {
    setCity(val);
    fetchCities(val);
  };

  const handleCitySelect = (cityName) => {
    setCity(cityName);
    setSelectedCity(cityName);
    setCitySuggestions([]);
  };

  const handleAreaChange = (val) => {
    setArea(val);
    fetchAreas(val, selectedCity || city);
  };

  const handleAreaSelect = (fullAddress) => {
    setArea(fullAddress);
    setLocations([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const cityName = (selectedCity || city)
      .split(",")[0]
      .trim();

    const areaName = area
      .split(",")[0]
      .trim();

    console.log("Searching:");
    console.log("City:", cityName);
    console.log("Area:", areaName);

    fetchCustomers(areaName, cityName);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <nav className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="text-lg font-semibold text-slate-900">SAMPLE</div>
        <div className="flex items-center gap-3">
          <button className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50">
            Login / Signup
          </button>
          <button className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-700">
            Agent
          </button>
        </div>
      </nav>

      <main className="flex flex-col items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3"
          >
            <div className="relative">
              <div className="flex items-center gap-3 rounded-full bg-white p-2 shadow-lg shadow-slate-200/70 ring-1 ring-slate-200">
                <input
                  className="h-14 min-w-160px flex-1 rounded-full border border-sky-500 bg-white px-5 text-sm font-medium text-slate-900 outline-none transition focus:border-sky-600"
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  aria-label="Search city"
                />
              </div>

              {citySuggestions.length > 0 && (
                <div className="absolute top-full left-0 mt-2 max-w-xs rounded-2xl bg-white shadow-lg border border-slate-200 z-10">
                  {citySuggestions.map((loc, i) => (
                    <div
                      key={loc.place_id || i}
                      onClick={() => handleCitySelect(loc.display_name)}
                      className="px-4 py-3 text-sm cursor-pointer hover:bg-slate-100 border-b last:border-b-0 text-slate-900"
                    >
                      {loc.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <div className="flex items-center gap-3 rounded-full bg-white p-2 shadow-lg shadow-slate-200/70 ring-1 ring-slate-200">
                <input
                  className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  type="text"
                  placeholder="Area"
                  value={area}
                  onChange={(e) => handleAreaChange(e.target.value)}
                  aria-label="Search area"
                />

                <button
                  type="submit"
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-600 text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-700"
                  aria-label="Search"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21 21l-4.35-4.35"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="11"
                      cy="11"
                      r="6"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </button>
              </div>

              {locations.length > 0 && (
                <div className="absolute top-full left-0 mt-2 w-full rounded-2xl bg-white shadow-lg border border-slate-200 z-10 max-h-64 overflow-y-auto">
                  {locations.map((loc, i) => (
                    <div
                      key={loc.place_id || i}
                      onClick={() => handleAreaSelect(loc.display_name, loc.area)}
                      className="px-4 py-3 text-sm cursor-pointer hover:bg-slate-100 border-b last:border-b-0 text-slate-900"
                    >
                      {loc.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>

          <div className="mt-4 flex flex-wrap gap-3">
            <span className="rounded-full bg-sky-100 px-4 py-2 text-sm font-medium text-sky-700 ring-1 ring-sky-200">
              City: {city ? city.split(",")[0].trim() : "Type a city"}
            </span>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
              Area: {area ? area.split(",")[0].trim() : "Type an area"}
            </span>
          </div>

          {loading && (
            <div className="mt-6 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
            </div>
          )}

          {searchPerformed && !loading && customers.length === 0 && (
            <div className="mt-6 rounded-32px bg-red-50 border border-red-200 p-6 text-center">
              <p className="text-red-700 font-medium">No records found for City: <span className="font-semibold">{city ? city.split(",")[0].trim() : ""}</span> and Area: <span className="font-semibold">{area ? area.split(",")[0].trim() : ""}</span></p>
            </div>
          )}

          {customers.length > 0 && (
            <div className="mt-6 overflow-hidden rounded-32px bg-slate-950 text-slate-100 shadow-2xl shadow-slate-900/40 ring-1 ring-white/10">
              <div className="border-b border-white/10 px-6 py-4 text-sm font-semibold">
                Results ({customers.length})
              </div>
              <div className="divide-y divide-white/10">
                {customers.map((record, i) => (
                  <div key={i} className="px-6 py-4 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{record.firstName} {record.lastName}</div>
                      <span className={`text-xs px-2 py-1 rounded-full ${record.type === 'Agent'
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-600 text-slate-100'
                        }`}>
                        {record.type || 'Customer'}
                      </span>
                    </div>
                    <div className="text-slate-300 text-xs mt-1">{record.mobileNumber}</div>
                    <div className="text-slate-300 text-xs mt-1">{record.address}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
