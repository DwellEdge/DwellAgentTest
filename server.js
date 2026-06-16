console.log("=================================");
console.log("THIS IS MY CURRENT SERVER FILE");
console.log(__filename);
console.log("=================================");

const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
console.log("MONGO URL:", process.env.MONGO_URL);
const twilio = require("twilio");

const app = express();

const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

app.get("/api/test-payment", (req, res) => {
  console.log("TEST PAYMENT HIT");
  res.send("PAYMENT ROUTE EXISTS");
});

app.get("/vijaytest", (req, res) => {
  res.send("VIJAY TEST ROUTE");
});

app.get("/", (req, res) => {
  res.send("ROOT ROUTE WORKING");
});

console.log("========== MY SERVER FILE LOADED ==========");
console.log(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

if (!process.env.ATLAS_URI) {
  console.error("❌ ATLAS_URI missing in .env file");
  process.exit(1);
}

mongoose
  .connect(process.env.ATLAS_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.log("❌ DB Connection Error:", err.message);
    process.exit(1);
  });

// Schemas
const customerSchema = new mongoose.Schema({
  Id: Number,
  name: String,
  mobileNumber: String,
  createdDateAndTime: { type: Date, default: Date.now },
});

const agentSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  city: String,
  area: String,
  address: String,
  mobileNumber: String,
  propertyCount: Number,
});

const Customer = mongoose.model("Customer", customerSchema, "Customers");
const Agent = mongoose.model("Agent", agentSchema, "Agents");

app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running", port: 5002 });
});

app.get("/api/location", async (req, res) => {
  try {
    const query = req.query.q?.trim();
    if (!query || query.length < 2) return res.json([]);

    try {
      const dbAgentCities = await Agent.find({ city: { $regex: query, $options: "i" } }).distinct("city");
      const dbCustomerCities = await Customer.find({ city: { $regex: query, $options: "i" } }).distinct("city");
      const dbCities = [...new Set([...dbAgentCities, ...dbCustomerCities])];

      if (dbCities.length > 0) {
        return res.json(dbCities.map((cityName, index) => ({
          display_name: cityName,
          place_id: `db_${index}`,
          lat: "0",
          lon: "0",
          source: "database",
        })));
      }

      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: { q: `${query}, India`, format: "json", addressdetails: 1, limit: 8, countrycodes: "in" },
        headers: { "User-Agent": "DwellEdge/1.0" },
      }, { timeout: 3000 });

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

      res.json(Array.from(cityMap.values()).slice(0, 8));
    } catch (nominatimError) {
      console.error("Nominatim error:", nominatimError.message);
      res.json([]);
    }
  } catch (error) {
    console.error("Error in /api/location:", error.message);
    res.status(500).json({ message: "Error fetching locations", error: error.message });
  }
});

app.get("/api/areas", async (req, res) => {
  try {
    const city = req.query.city?.trim();
    if (!city) return res.json([]);

    const areas = await Agent.find({ city: { $regex: `^${city}$`, $options: "i" } }).distinct("area");
    const customerAreas = await Customer.find({ city: { $regex: `^${city}$`, $options: "i" } }).distinct("area");
    const allAreas = [...new Set([...areas, ...customerAreas])].sort();

    res.json(allAreas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/customers", async (req, res) => {
  try {
    const city = req.query.city?.trim();
    const area = req.query.area?.trim();
    if (!city || !area) return res.json([]);

    const areaName = area.split(",")[0].trim();

    const agentResults = await Agent.find({
      city: { $regex: `^${city}$`, $options: "i" },
      area: { $regex: `^${areaName}$`, $options: "i" },
    }).lean();

    const customerResults = await Customer.find({
      city: { $regex: `^${city}$`, $options: "i" },
      area: { $regex: `^${areaName}$`, $options: "i" },
    }).lean();

    res.json([
      ...agentResults.map((a) => ({ ...a, type: "Agent" })),
      ...customerResults.map((c) => ({ ...c, type: "Customer" })),
    ]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/debug/data", async (req, res) => {
  try {
    res.json({
      customerCount: await Customer.countDocuments(),
      agentCount: await Agent.countDocuments(),
      sampleCustomers: await Customer.find().limit(3),
      sampleAgents: await Agent.find().limit(3),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/debug/collections", async (req, res) => {
  try {
    res.json(await mongoose.connection.db.listCollections().toArray());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/debug/database", (req, res) => {
  res.json({ database: mongoose.connection.db.databaseName });
});

app.get("/api/raw", async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const result = {};
    for (const col of collections) {
      result[col.name] = await mongoose.connection.db.collection(col.name).find({}).toArray();
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/test123", (req, res) => res.send("TEST ROUTE WORKING"));

app.post("/api/agents", async (req, res) => {
  try {
    const { firstName, lastName, city, area, address, mobileNumber, propertyCount } = req.body;
    const agent = new Agent({ firstName, lastName, city, area, address, mobileNumber, propertyCount });
    await agent.save();
    res.status(201).json({ success: true, message: "Agent Added Successfully", data: agent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/customers", async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json({ success: true, message: "Customer Added Successfully", data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/agents", async (req, res) => {
  try {
    const city = req.query.city?.trim();
    const area = req.query.area?.trim();
    const query = {};
    if (city) query.city = { $regex: `^${city}$`, $options: "i" };
    if (area) query.area = { $regex: `^${area}$`, $options: "i" };
    res.json(await Agent.find(query).lean());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// /api/payment-request — no longer used for DB save (handled by /api/send-message)
app.post("/api/payment-request", (req, res) => {
  res.status(200).json({ success: true, message: "Acknowledged" });
});

// Twilio
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// ✅ /api/send-message — saves to DB once + sends SMS & WhatsApp
app.post("/api/send-message", async (req, res) => {
  const { phone, name, agents } = req.body;

  if (!phone || phone.length !== 10 || isNaN(phone)) {
    return res.status(400).json({ success: false, error: "Invalid phone number" });
  }

  try {
    // Save to DB (single source of truth)
    const lastCustomer = await Customer.findOne().sort({ Id: -1 });
    const nextId = lastCustomer ? lastCustomer.Id + 1 : 1001;

    const customer = new Customer({
      Id: nextId,
      name: name,
      mobileNumber: phone,
      createdDateAndTime: new Date(),
    });

    await customer.save();

    // Build agent details for message
    const agentDetails = agents && agents.length > 0
      ? agents.map((agent, i) =>
          `Agent ${i + 1}:\nName: ${agent.firstName} ${agent.lastName}\nCity: ${agent.city}\nArea: ${agent.area}\nAddress: ${agent.address}\nMobile: ${agent.mobileNumber}`
        ).join("\n\n")
      : "No agents selected";

    // Short message for SMS (under 160 chars)
    const smsMessage = `Hi ${name}! Thank you for using DwellAgent. Our agents will contact you shortly.`;

    // Full message for WhatsApp
    const whatsappMessage = `Hi ${name}! 👋\n\nThank you for using DwellAgent! 🏠\n\nYour selected agents:\n\n${agentDetails}\n\nOur team will reach out to you shortly.`;

    // Send SMS
    await client.messages.create({
      body: smsMessage,
      from: process.env.TWILIO_PHONE,
      to: `+91${phone}`,
    });

    // Send WhatsApp
    await client.messages.create({
      body: whatsappMessage,
      from: "whatsapp:+14155238886",
      to: `whatsapp:+91${phone}`,
    });

    res.json({ success: true });

  } catch (err) {
    console.error("Error in /api/send-message:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server Running on port ${PORT}`);
});