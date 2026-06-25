const axios = require("axios");

const Agent = require("../models/Agent");
const Customer = require("../models/Customer");
const PropertyType = require("../models/PropertyType");

const searchLocations = async (query) => {
  const dbAgentCities = await Agent.find({
    city: {
      $regex: query,
      $options: "i",
    },
  }).distinct("city");

  const dbCustomerCities = await Customer.find({
    city: {
      $regex: query,
      $options: "i",
    },
  }).distinct("city");

  const dbCities = [...new Set([...dbAgentCities, ...dbCustomerCities])];

  if (dbCities.length > 0) {
    return dbCities.map((cityName, index) => ({
      display_name: cityName,
      place_id: `db_${index}`,
      lat: "0",
      lon: "0",
      source: "database",
    }));
  }

  const response = await axios.get(
    "https://nominatim.openstreetmap.org/search",
    {
      params: {
        q: `${query}, India`,
        format: "json",
        addressdetails: 1,
        limit: 8,
        countrycodes: "in",
      },
      headers: {
        "User-Agent": "DwellEdge/1.0",
      },
      timeout: 1000,
    },
  );

  const cityMap = new Map();

  (response.data || []).forEach((location) => {
    const cityName = location.display_name.split(",")[0].trim();

    if (cityName && !cityMap.has(cityName.toLowerCase())) {
      cityMap.set(cityName.toLowerCase(), {
        display_name: cityName,
        place_id: location.place_id,
        lat: location.lat,
        lon: location.lon,
        source: "nominatim",
      });
    }
  });

  return Array.from(cityMap.values()).slice(0, 8);
};

const getAreasByCity = async (city) => {
  const areas = await Agent.find({
    city: {
      $regex: `^${city}$`,
      $options: "i",
    },
  }).distinct("area");

  const customerAreas = await Customer.find({
    city: {
      $regex: `^${city}$`,
      $options: "i",
    },
  }).distinct("area");

  return [...new Set([...areas, ...customerAreas])].sort();
};

const getCustomersByArea = async (
  city,
  area,
  propertyType
) => {

  const TransactionHistory =
    require("../models/TransactionHistory");

  const areaName =
    area.split(",")[0].trim();

  let propertyTypeId = null;

  if (propertyType) {

    const property =
      await PropertyType.findOne({
        propertyType: propertyType
      });

      console.log("Property Type From UI:", propertyType);
console.log("Property Record:", property);

console.log(
  "Property Record:",
  property
);

    if (property) {
      propertyTypeId =
        property.propertyTypeId;
    }
  }

  const agentFilter = {
    city: {
      $regex: `^${city}$`,
      $options: "i",
    },
    area: {
      $regex: `^${areaName}$`,
      $options: "i",
    },
  };

  if (propertyTypeId) {
  agentFilter["propertyTypes.propertyTypeId"] =
    propertyTypeId;
}

console.log(
  "Agent Filter:",
  JSON.stringify(agentFilter, null, 2)
);

  // -------------------------
  // GET AGENTS
  // -------------------------
console.log(
  "Agent Filter:",
  agentFilter
);

  const agentResults =
    await Agent.find(
      agentFilter
    ).lean();

    console.log(
  "Agent Results:",
  agentResults.map(a => ({
    agentid: a.agentid,
    agentId: a.agentId,
    propertyTypeId: a.propertyTypeId
  }))
);

    console.log(
  "Current Agents:",
  agentResults.map(a => ({
    agentId: a.agentId,
    firstName: a.firstName
  }))
);
  // -------------------------
  // GET PREVIOUSLY SHARED AGENTS
  // -------------------------

  const previousTransactions =
  await TransactionHistory.find({
    city: city,
    area: areaName,
    propertyType: propertyType
  }).lean();

const usedAgentIds =
  new Set(
    previousTransactions.flatMap(
      transaction =>
        transaction.agentIds || []
    )
  );

  console.log(
    "Used Agent IDs:",
    [...usedAgentIds]
  );

  // -------------------------
  // SORT AGENTS
  // USED AGENTS GO TO LAST
  // -------------------------

  const sortedAgents =
    [...agentResults].sort(
      (a, b) => {

        const aId =
          (
            a.agentId ||
            a.agentid
          )?.toString().trim();

        const bId =
          (
            b.agentId ||
            b.agentid
          )?.toString().trim();

        const aUsed =
          usedAgentIds.has(aId);

        const bUsed =
          usedAgentIds.has(bId);

        if (
          aUsed === bUsed
        ) {
          return 0;
        }

        return aUsed
          ? 1
          : -1;
      }
    );

  // -------------------------
  // CUSTOMERS
  // -------------------------

  const customerResults =
    await Customer.find({
      city: {
        $regex: `^${city}$`,
        $options: "i",
      },
      area: {
        $regex: `^${areaName}$`,
        $options: "i",
      },
    }).lean();

  return [

    ...sortedAgents.map(
      (a) => ({
        ...a,
        type: "Agent",
      })
    ),

    ...customerResults.map(
      (c) => ({
        ...c,
        type: "Customer",
      })
    ),

  ];
};

module.exports = {
  searchLocations,
  getAreasByCity,
  getCustomersByArea,
};
