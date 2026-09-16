require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const connectDB = require("./config/db");

<<<<<<< HEAD
app.use(cors());
app.use(express.json());

// Simple request logger to help debug routes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

=======
>>>>>>> 4cc777a5e1edbc22743d6431326b424d0b1c4726
const agentRoutes = require("./routes/agentRoutes");
const customerRoutes = require("./routes/customerRoutes");
const messageRoutes = require("./routes/messageRoutes");
const propertyTypeGetRoutes = require("./routes/propertyType");
const propertyTypeCreateRoutes = require("./routes/propertyTypeRoutes");
const locationRoutes = require("./routes/locationRoutes");
const transactionHistoryRoutes = require("./routes/transactionHistoryRoutes");
const agentAuthRoutes = require("./routes/agentAuthRoutes");
<<<<<<< HEAD
const uploadRoutes = require("./routes/uploadRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const { createProperty } = require('./controllers/propertyController');
=======
const propertyRoutes = require("./routes/propertyRoutes");

const app = express();
>>>>>>> 4cc777a5e1edbc22743d6431326b424d0b1c4726

connectDB();

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
// ensure subfolders for media
const imagesDir = path.join(uploadsDir, 'images');
const videosDir = path.join(uploadsDir, 'videos');
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Server Running");
});

app.use("/api", locationRoutes);
app.use("/api/property-types", propertyTypeGetRoutes);
app.use("/api/property-types", propertyTypeCreateRoutes);
app.use("/api/transactions", transactionHistoryRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api", messageRoutes);
app.use("/api/agent-auth", agentAuthRoutes);
<<<<<<< HEAD
app.use('/api/upload', uploadRoutes);
app.use('/api/properties', propertyRoutes);
console.log('Mounted route: /api/properties -> routes/propertyRoutes');

// Temporary debug endpoint to test POST reachability without DB
app.post('/api/properties/debug', express.json(), (req, res) => {
  console.log('DEBUG /api/properties/debug body:', req.body);
  res.json({ success: true, echo: req.body });
});

// Ensure POST /api/properties is available (explicit handler) in case router mounting fails
app.post('/api/properties', express.json(), async (req, res, next) => {
  try {
    console.log('Explicit /api/properties POST received');
    return createProperty(req, res, next);
  } catch (err) {
    next(err);
  }
});

// If no /api route matched, return JSON 404 for API paths to avoid HTML pages
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: `API route not found: ${req.originalUrl}` });
});

// Global error handler to return JSON
app.use((err, req, res, next) => {
  console.error('Global error:', err && err.message ? err.message : err);
  if (res.headersSent) return next(err);
  res.status(500).json({ success: false, message: err.message || 'Server error' });
});
=======
app.use("/api/properties", propertyRoutes);
>>>>>>> 4cc777a5e1edbc22743d6431326b424d0b1c4726

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`);
  // Print registered routes for debugging
  try {
    const routes = [];
    app._router.stack.forEach((middleware) => {
      if (middleware.route) {
        // routes registered directly on the app
        routes.push(middleware.route.path);
      } else if (middleware.name === 'router') {
        middleware.handle.stack.forEach((handler) => {
          const route = handler.route && handler.route.path;
          if (route) routes.push(route);
        });
      }
    });
    console.log('Registered routes:', routes.slice(0, 200));
  } catch (err) {
    console.error('Error listing routes', err);
  }
});

// Simple ping endpoint to verify upload route reachability
app.get('/api/upload/ping', (req, res) => {
  res.json({ success: true, message: 'upload route ping' });
});

// Ping for properties route
app.get('/api/properties/ping', (req, res) => {
  res.json({ success: true, message: 'properties route ping' });
});