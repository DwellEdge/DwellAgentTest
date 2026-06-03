const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL)
.then(() => {
  console.log("✓ MongoDB Connected Successfully");

  console.log(
    "Database:",
    mongoose.connection.db.databaseName
  );
})
.catch((err) => {
  console.error(err);
});

// Define Customer Schema
const customerSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  city: String,
  area: String,
  address: String,
  mobileNumber: String,
});

// Define Agent Schema
const agentSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  city: String,
  area: String,
  address: String,
  mobileNumber: String,
});

const Customer = mongoose.model("Customer", customerSchema, "Customers");
const Agent = mongoose.model("Agent", agentSchema, "Agents");

app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running", port: 5000 });
});

app.get("/api/debug/data", async (req, res) => {
  try {
    const customerCount = await Customer.countDocuments();
    const agentCount = await Agent.countDocuments();
    const sampleCustomers = await Customer.find().limit(3);
    const sampleAgents = await Agent.find().limit(3);

    res.json({
      customerCount,
      agentCount,
      sampleCustomers,
      sampleAgents,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/location", async (req, res) => {
  try {
    const query = req.query.q?.trim();

    console.log("Location search query:", query);

    if (!query || query.length < 2) {
      console.log("Query too short");
      return res.json([]);
    }

    // Use Nominatim API to search for locations in India
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search`,
      {
        params: {
          q: query,
          format: "json",
          addressdetails: 1,
          limit: 8,
          countrycodes: "in",
        },
        headers: {
          "User-Agent": "DwellEdge",
        },
      },
    );

    console.log("Found locations from Nominatim:", response.data.length);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching locations:", error.message);
    res.status(500).json({
      message: "Error fetching locations",
      error: error.message,
    });
  }
});
app.get("/api/customers", async (req, res) => {
  try {
    const rawCity = req.query.city?.trim();
    const rawArea = req.query.area?.trim();

    console.log("RAW CITY:", rawCity);
    console.log("RAW AREA:", rawArea);

    const city = rawCity?.split(",")[0].trim();
    const area = rawArea?.split(",")[0].trim();

    console.log("FINAL CITY:", city);
    console.log("FINAL AREA:", area);

    if (!city || !area) {
      return res.json([]);
    }

    const customerResults = await Customer.find({
      city: { $regex: `^${city}$`, $options: "i" },
      area: { $regex: `^${area}$`, $options: "i" },
    }).lean();

    const agentResults = await Agent.find({
      city: { $regex: `^${city}$`, $options: "i" },
      area: { $regex: `^${area}$`, $options: "i" },
    }).lean();

    console.log("Customers Found:", customerResults.length);
    console.log("Agents Found:", agentResults.length);

    const combinedResults = [
      ...customerResults.map((c) => ({
        ...c,
        type: "Customer",
      })),
      ...agentResults.map((a) => ({
        ...a,
        type: "Agent",
      })),
    ];

    console.log("TOTAL RESULTS:", combinedResults.length);

    res.json(combinedResults);
  } catch (error) {
    console.error("CUSTOMER API ERROR:", error);

    res.status(500).json({
      message: "Error fetching data",
      error: error.message,
    });
  }
});
app.get("/api/debug/database", async (req, res) => {
  try {
    res.json({
      database: mongoose.connection.db.databaseName,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

app.get("/api/debug/collections", async (req, res) => {
  try {
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();

    res.json(collections);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

app.get("/api/debug/database", async (req, res) => {
  console.log("DEBUG DATABASE API HIT");

  res.json({
    database: mongoose.connection.db.databaseName,
  });
});

app.listen(5000, () => {
  console.log("Server Running on port 5000");
});
