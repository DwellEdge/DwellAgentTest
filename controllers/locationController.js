const {
  searchLocations,
  getAreasByCity,
  getCustomersByArea,
} = require("../services/locationService");

const getLocations = async (req, res) => {
  try {
    const query = req.query.q?.trim();

    console.log("=================================");
    console.log("LOCATION API HIT");
    console.log("Search Query:", query);
    console.log("Time:", new Date().toISOString());
    console.log("=================================");

    if (!query || query.length < 2) {
      return res.json([]);
    }

    const startTime = Date.now();

    const locations = await searchLocations(query);

    console.log(
      `✅ Location search completed in ${
        Date.now() - startTime
      } ms`
    );

    res.json(locations);
  } catch (error) {
    console.error("❌ ERROR IN getLocations");
    console.error(error);

    res.status(500).json({
      message: "Error fetching locations",
      error: error.message,
    });
  }
};

const getAreas = async (req, res) => {
  try {
    const city = req.query.city?.trim();

    console.log("=================================");
    console.log("AREAS API HIT");
    console.log("City:", city);
    console.log("=================================");

    if (!city) {
      return res.json([]);
    }

    const startTime = Date.now();

    const areas = await getAreasByCity(city);

    console.log(
      `✅ Areas fetched in ${
        Date.now() - startTime
      } ms`
    );

    res.json(areas);
  } catch (error) {
    console.error("❌ ERROR IN getAreas");
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
};

const getCustomers = async (req, res) => {
  try {
    const city = req.query.city?.trim();
    const area = req.query.area?.trim();

    console.log("=================================");
    console.log("CUSTOMERS API HIT");
    console.log("City:", city);
    console.log("Area:", area);
    console.log("=================================");

    if (!city || !area) {
      return res.json([]);
    }

    const startTime = Date.now();

    const result = await getCustomersByArea(
      city,
      area
    );

    console.log(
      `✅ Customers fetched in ${
        Date.now() - startTime
      } ms`
    );

    res.json(result);
  } catch (error) {
    console.error("❌ ERROR IN getCustomers");
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getLocations,
  getAreas,
  getCustomers,
};