require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const agentRoutes = require("./routes/agentRoutes");
const customerRoutes = require("./routes/customerRoutes");
const messageRoutes = require("./routes/messageRoutes");
const propertyTypeGetRoutes = require("./routes/propertyType");
const propertyTypeCreateRoutes = require("./routes/propertyTypeRoutes");
const locationRoutes = require("./routes/locationRoutes");
const transactionHistoryRoutes = require("./routes/transactionHistoryRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server Running");
});

app.use("/api", locationRoutes);
app.use("/api/property-types", propertyTypeGetRoutes);
app.use("/api/property-types", propertyTypeCreateRoutes);
app.use("/api/transactions", transactionHistoryRoutes);
const locationRoutes =
  require("./routes/locationRoutes");

  app.use(
  "/api",
  locationRoutes
);



app.use(
  "/api/property-types",
  propertyTypeRoutes
);

const transactionHistoryRoutes =
require("./routes/transactionHistoryRoutes");

app.use(
  "/api/transactions",
  transactionHistoryRoutes
);

app.use("/api/agents", agentRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api", messageRoutes);

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`);
});