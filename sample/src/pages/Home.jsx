import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

export default function Home() {
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [areaSuggestions, setAreaSuggestions] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [city, setCity] = useState("");
  const [area, setArea] = useState("");

  // Full cache of every (agent, purpose) row ever fetched in this session.
  // Each entry: { rowKey, _id, firstName, lastName, area, propertyTypeId, propertyTypeName, filteredCount }
  const [agentRows, setAgentRows] = useState([]);
  // rowKeys (agentId::purposeId) the user has checked — preserved even when
  // a purpose is temporarily deselected, so re-selecting it restores the tick.
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [selectedPropertyTypeIds, setSelectedPropertyTypeIds] = useState([]);

  // rowKeys (agentId::purposeId) previously chosen by ANY user for this
  // city/area/purpose — used to sink already-picked agents to the bottom
  const [previouslySelectedKeys, setPreviouslySelectedKeys] = useState(new Set());

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5002";

  const makeRowKey = (agentId, ptId) => `${agentId}::${ptId}`;

  const fetchCities = async (searchValue) => {
    const query = searchValue?.trim();
    if (!query || query.length < 1) {
      setCitySuggestions([]);
      return;
    }
    try {
      const res = await axios.get(`${API_BASE}/api/location`, {
        params: { q: query },
        timeout: 10000,
      });
      setCitySuggestions(res.data || []);
    } catch (err) {
      console.error("Error fetching cities:", err.message);
      setCitySuggestions([]);
    }
  };

  const fetchAreas = async (cityValue) => {
    if (!cityValue || cityValue.length < 1) {
      setAreaSuggestions([]);
      setLoadingAreas(false);
      return;
    }
    setLoadingAreas(true);
    try {
      const res = await axios.get(`${API_BASE}/api/areas`, {
        params: { city: cityValue },
        timeout: 15000,
      });
      setAreaSuggestions(res.data || []);
    } catch (err) {
      console.error("Error fetching areas:", err.message);
      setAreaSuggestions([]);
    } finally {
      setLoadingAreas(false);
    }
  };

  // Fetch agents for every selected purpose. Each purpose's results become
  // their own rows (one row per agent+purpose), merged into the existing
  // cache so previously fetched purposes/selections aren't lost. Also fetches
  // which agents were previously chosen (by any user) for this city/area/purpose,
  // so they can be sunk to the bottom of the results.
  const fetchAgents = useCallback(async () => {
    if (!selectedCity || !area) {
      alert("Please select both city and area");
      return;
    }
    if (selectedPropertyTypeIds.length === 0) {
      alert("Please select at least one purpose");
      return;
    }

    try {
      setLoading(true);
      setSearchPerformed(true);

      const responses = await Promise.all(
        selectedPropertyTypeIds.map((ptId) =>
          axios
            .get(`${API_BASE}/api/agents`, {
              params: { city: selectedCity, area, propertyTypeId: ptId },
              timeout: 5000,
            })
            .then((res) => ({ ptId, data: res.data || [] }))
            .catch((err) => {
              console.error(`Failed to fetch agents for ${ptId}:`, err.message);
              return { ptId, data: [] };
            })
        )
      );

      setAgentRows((prevRows) => {
        const merged = new Map(prevRows.map((r) => [r.rowKey, r]));

        responses.forEach(({ ptId, data }) => {
          const ptName =
            propertyTypes.find((t) => t.propertyTypeId === ptId)?.propertyType || ptId;

          data.forEach((record) => {
            const rowKey = makeRowKey(record._id, ptId);
            merged.set(rowKey, {
              rowKey,
              _id: record._id,
              firstName: record.firstName,
              lastName: record.lastName,
              area: record.area,
              propertyTypeId: ptId,
              propertyTypeName: ptName,
              filteredCount: record.filteredCount ?? 0,
            });
          });
        });

        return Array.from(merged.values());
      });

      const prevResponses = await Promise.all(
        selectedPropertyTypeIds.map((ptId) =>
          axios
            .get(`${API_BASE}/api/transactions/previous-agents`, {
              params: { city: selectedCity, area, propertyTypeId: ptId },
              timeout: 5000,
            })
            .then((res) => ({ ptId, agentIds: res.data || [] }))
            .catch((err) => {
              console.error(`Failed to fetch previous agents for ${ptId}:`, err.message);
              return { ptId, agentIds: [] };
            })
        )
      );

      setPreviouslySelectedKeys((prev) => {
        const next = new Set(prev);
        prevResponses.forEach(({ ptId, agentIds }) => {
          agentIds.forEach((agentId) => next.add(makeRowKey(agentId, ptId)));
        });
        return next;
      });
    } catch (err) {
      console.error("Failed to fetch agents:", err.message);
    } finally {
      setLoading(false);
    }
  }, [API_BASE, selectedCity, area, selectedPropertyTypeIds, propertyTypes]);

  // Reload detection — runs only once on mount
  useEffect(() => {
    const isReload = performance.getEntriesByType("navigation")[0]?.type === "reload";
    if (isReload) {
      setCity("");
      setArea("");
      setAgentRows([]);
      setSelectedAgents([]);
      setSelectedCity("");
      setSearchPerformed(false);
      setPreviouslySelectedKeys(new Set());
      window.history.replaceState(null, "");
    }
  }, []);

  // Restore state when navigating back from Payment
  useEffect(() => {
    const isReload = performance.getEntriesByType("navigation")[0]?.type === "reload";
    if (isReload) return;

    if (location.state) {
      setCity(location.state.city || "");
      setArea(location.state.area || "");
      setAgentRows(location.state.agentRows || []);
      setSelectedAgents(location.state.selectedAgents || []);
      setSelectedCity(location.state.city || "");
      setSearchPerformed((location.state.agentRows || []).length > 0);
      if (location.state.propertyTypeIds) {
        setSelectedPropertyTypeIds(location.state.propertyTypeIds);
      } else if (location.state.propertyTypeId) {
        setSelectedPropertyTypeIds([location.state.propertyTypeId]);
      }
    }
  }, [location.state]);

  useEffect(() => {
    if (selectedCity) {
      fetchAreas(selectedCity);
    }
  }, [selectedCity]);

  // Fetch property types from API, default to first one selected
  useEffect(() => {
    axios
      .get(`${API_BASE}/api/property-types`)
      .then((res) => {
        const types = res.data || [];
        setPropertyTypes(types);
        setSelectedPropertyTypeIds((prev) =>
          prev.length > 0 ? prev : types[0] ? [types[0].propertyTypeId] : []
        );
      })
      .catch((err) => console.error("Failed to load property types", err));
  }, []);

  // Re-fetch agents whenever the set of selected purposes changes (only if
  // a search has already been performed). Rows already cached for a purpose
  // are reused via the merge in fetchAgents — no data loss on toggling.
  useEffect(() => {
    if (selectedCity && area && searchPerformed) {
      fetchAgents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPropertyTypeIds]);

  const handleCityChange = (val) => {
    setCity(val);
    setSelectedCity("");
    setArea("");
    setAreaSuggestions([]);
    setAgentRows([]);
    setSelectedAgents([]);
    setSearchPerformed(false);
    setPreviouslySelectedKeys(new Set());
    if (val.length > 0) {
      fetchCities(val);
    } else {
      setCitySuggestions([]);
    }
  };

  const handleCitySelect = (cityName) => {
    setCity(cityName);
    setSelectedCity(cityName);
    setCitySuggestions([]);
    setArea("");
    setAgentRows([]);
    setSelectedAgents([]);
    setSearchPerformed(false);
    setPreviouslySelectedKeys(new Set());
  };

  const handleAreaChange = (val) => {
    setArea(val);
  };

  const handleAreaSelect = (areaName) => {
    setArea(areaName);
    setAreaSuggestions([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchAgents();
  };

  const togglePurpose = (propertyTypeId) => {
    setSelectedPropertyTypeIds((prev) => {
      if (prev.includes(propertyTypeId)) {
        if (prev.length === 1) return prev; // keep at least one purpose active
        return prev.filter((id) => id !== propertyTypeId);
      }
      return [...prev, propertyTypeId];
    });
  };

  // Only rows matching a currently-selected purpose are shown/counted.
  // Deselecting a purpose hides its rows immediately (no re-fetch needed);
  // reselecting it brings them back from cache, ticks intact.
  // Rows previously selected (by any user) for this city/area/purpose are
  // sorted to the bottom, while preserving original order otherwise.
  const visibleRows = agentRows
    .filter((row) => selectedPropertyTypeIds.includes(row.propertyTypeId))
    .slice()
    .sort((a, b) => {
      const aPrev = previouslySelectedKeys.has(a.rowKey) ? 1 : 0;
      const bPrev = previouslySelectedKeys.has(b.rowKey) ? 1 : 0;
      return aPrev - bPrev;
    });

  const handleContinue = () => {
    // Only carry forward selections that belong to a currently active purpose
    const chosenRows = visibleRows.filter((row) => selectedAgents.includes(row.rowKey));
    navigate("/payment", {
      state: {
        agents: chosenRows,
        agentRows,
        city,
        area,
        propertyTypeIds: selectedPropertyTypeIds,
        selectedAgents,
      },
    });
  };

  const handleCancel = () => {
    setSelectedAgents([]);
  };

  // Toggling one row never affects the same agent's row under a different purpose
  const toggleAgentSelection = (rowKey) => {
    setSelectedAgents((prev) =>
      prev.includes(rowKey) ? prev.filter((k) => k !== rowKey) : [...prev, rowKey]
    );
  };

  const selectedPurposeNames = propertyTypes
    .filter((t) => selectedPropertyTypeIds.includes(t.propertyTypeId))
    .map((t) => t.propertyType);

  const selectedPurposeLabel =
    selectedPurposeNames.length > 0 ? selectedPurposeNames.join(", ") : "Rent";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, #fff7f3 0%, #ffe8dc 50%, #fff7f3 100%)",
      }}
    >
      <nav
        style={{
          background: "rgba(255,255,255,0.8)",
          borderBottom: "1px solid #fdd9c8",
          backdropFilter: "blur(10px)",
        }}
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
          <button
            onClick={() => navigate("/agent")}
            style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }}
            className="px-5 py-2 rounded-xl text-sm font-bold text-white shadow-md hover:opacity-90 transition"
          >
            Agent
          </button>
        </div>
      </nav>

      <main className="flex flex-col items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* City Input */}
            <div className="relative w-full">
              <div className="flex items-center gap-3 rounded-full bg-white p-2 shadow-lg shadow-orange-100/70 ring-1 ring-orange-100">
                <input
                  className="h-14 min-w-40 flex-1 rounded-full border border-orange-200 bg-white px-5 text-sm font-medium text-slate-900 outline-none transition focus:border-[#e8724a]"
                  type="text"
                  placeholder="Search City (e.g. Bengaluru, Hyderabad)"
                  value={city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  autoComplete="off"
                />
              </div>

              {citySuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-orange-100 z-50">
                  {citySuggestions.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleCitySelect(item.display_name)}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-orange-50 border-b last:border-b-0 text-slate-900 transition"
                    >
                      {item.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {city.length > 1 && citySuggestions.length === 0 && !selectedCity && (
              <p className="text-sm mt-1 ml-2" style={{ color: "#a8674a" }}>
                No cities found for "<span className="font-semibold">{city}</span>". Try a different name.
              </p>
            )}

            {/* Area Input */}
            <div className="relative w-full">
              <div className="flex items-center gap-3 rounded-full bg-white p-2 shadow-lg shadow-orange-100/70 ring-1 ring-orange-100">
                <input
                  className={`flex-1 rounded-full border px-5 py-4 text-sm outline-none transition ${
                    !selectedCity
                      ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                      : "border-slate-200 bg-white text-slate-900 focus:border-[#e8724a] focus:ring-4 focus:ring-orange-50"
                  }`}
                  type="text"
                  placeholder={selectedCity ? "Type to search area..." : "Area"}
                  value={area}
                  onChange={(e) => handleAreaChange(e.target.value)}
                  disabled={!selectedCity}
                  autoComplete="off"
                />
              </div>

              {areaSuggestions.length > 0 && selectedCity && !area && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-orange-100 z-50 max-h-64 overflow-y-auto">
                  <div className="p-2 text-xs text-slate-500 border-b">
                    {areaSuggestions.length} areas found
                  </div>
                  {areaSuggestions.map((areaName, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAreaSelect(areaName)}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-orange-50 border-b last:border-b-0 text-slate-900 transition"
                    >
                      {areaName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end mt-1">
              <button
                type="submit"
                disabled={!selectedCity || !area || loading}
                style={
                  selectedCity && area && !loading
                    ? { background: "linear-gradient(135deg, #e8724a, #f59e6c)" }
                    : {}
                }
                className={`flex h-12 px-8 items-center justify-center rounded-full text-white font-bold text-sm tracking-wider shadow-md shadow-orange-200/50 transition duration-200 ${
                  !selectedCity || !area || loading
                    ? "bg-slate-300 cursor-not-allowed shadow-none"
                    : "hover:opacity-95 transform hover:-translate-y-0.5"
                }`}
              >
                🔍 SEARCH
              </button>
            </div>
          </form>

          {/* Purpose Buttons — multi-select */}
          <div className="mt-4">
            <label style={{ color: "#7c2d12", fontWeight: "bold", fontSize: "14px" }}>
              Purpose (select one or more)
            </label>
            <div className="flex gap-3 mt-2 flex-wrap">
              {propertyTypes.map((type) => {
                const isActive = selectedPropertyTypeIds.includes(type.propertyTypeId);
                return (
                  <button
                    key={type.propertyTypeId}
                    type="button"
                    onClick={() => togglePurpose(type.propertyTypeId)}
                    style={
                      isActive
                        ? { background: "linear-gradient(135deg, #e8724a, #f59e6c)", color: "#fff" }
                        : { background: "#fff", color: "#c2511f", border: "1px solid #fdd9c8" }
                    }
                    className="px-5 py-2 rounded-full text-sm font-bold shadow-sm transition hover:opacity-90 flex items-center gap-2"
                  >
                    {isActive && <span>✓</span>}
                    {type.propertyType}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-[#c2511f] ring-1 ring-orange-200">
              City: {selectedCity || "Not selected"}
            </span>
            <span className="rounded-full bg-orange-50 px-4 py-2 text-sm font-medium text-slate-600 ring-1 ring-orange-100">
              Area: {area || "Not selected"}
            </span>
            <span className="rounded-full bg-orange-50 px-4 py-2 text-sm font-medium text-slate-600 ring-1 ring-orange-100">
              Purpose: {selectedPurposeLabel}
            </span>
          </div>

          {loading && (
            <div className="mt-6 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e8724a]"></div>
            </div>
          )}

          {/* No Results — based on the currently-visible (purpose-filtered) rows */}
          {searchPerformed && !loading && visibleRows.length === 0 && (
            <div className="mt-6 rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-lg">
              <div className="text-5xl mb-4">🏠</div>
              <h3 style={{ color: "#7c2d12" }} className="text-xl font-extrabold mb-2">
                No Agents Found
              </h3>
              <p style={{ color: "#a8674a" }} className="text-sm mb-1">
                We couldn't find any agents in{" "}
                <span className="font-bold">{area ? area.split(",")[0].trim() : ""}</span>,{" "}
                <span className="font-bold">{city ? city.split(",")[0].trim() : ""}</span>{" "}
                for {selectedPurposeLabel}.
              </p>
              <p style={{ color: "#a8674a" }} className="text-sm">
                Try searching a different city, area, or purpose.
              </p>
            </div>
          )}

          {/* Results — one row per (agent, purpose), filtered to active purposes,
              previously-selected agents sorted to the bottom (no visible label) */}
          {visibleRows.length > 0 && (
            <div className="mt-6 overflow-hidden rounded-3xl bg-white text-slate-800 shadow-xl border border-orange-100">
              <div className="border-b border-orange-100 bg-orange-50/50 px-6 py-4 text-sm font-bold text-slate-700">
                Results ({visibleRows.length})
              </div>

              <div className="divide-y divide-orange-100">
                {visibleRows.map((row) => (
                  <label
                    key={row.rowKey}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-orange-50/30 transition cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAgents.includes(row.rowKey)}
                      onChange={() => toggleAgentSelection(row.rowKey)}
                      className="h-5 w-5 accent-[#e8724a]"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-slate-800">
                        {row.firstName} {row.lastName}
                      </div>
                      <div className="text-sm text-slate-500">
                        Area: {row.area}
                      </div>
                      <div className="text-sm text-[#c2511f] font-semibold mt-0.5">
                        {row.propertyTypeName}: {row.filteredCount}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex justify-center gap-4 border-t border-orange-100 bg-orange-50/20 px-6 py-5">
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={selectedAgents.length === 0}
                  style={
                    selectedAgents.length > 0
                      ? { background: "linear-gradient(135deg, #e8724a, #f59e6c)" }
                      : {}
                  }
                  className={`rounded-full px-8 py-2.5 font-bold text-white shadow-md transition ${
                    selectedAgents.length > 0
                      ? "hover:opacity-90"
                      : "cursor-not-allowed bg-slate-300 shadow-none"
                  }`}
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={selectedAgents.length === 0}
                  className={`rounded-full px-8 py-2.5 font-bold border transition ${
                    selectedAgents.length > 0
                      ? "border-red-200 text-red-500 bg-red-50 hover:bg-red-100"
                      : "cursor-not-allowed border-slate-200 text-slate-400 bg-slate-50"
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}