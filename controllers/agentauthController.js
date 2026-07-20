const Agent = require("../models/Agent");
const bcrypt = require("bcrypt");

const registerAgent = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      mobileNumber,
      officeAddress,
      homeAddress,
      password,
    } = req.body;

    // Check if email already exists
    const existing = await Agent.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // Auto-generate agentId
    const count = await Agent.countDocuments();
    const agentId = `A${String(count + 1).padStart(2, "0")}`;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // File paths from multer
    const photo = req.files?.photo?.[0]?.filename || "";
    const idDocument = req.files?.idDocument?.[0]?.filename || "";

    const agent = await Agent.create({
      agentId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      mobileNumber: mobileNumber.trim(),
      officeAddress: officeAddress.trim(),
      homeAddress: homeAddress.trim(),
      address: officeAddress.trim(), // populate address field too for compatibility
      photo,
      idDocument,
      password: hashedPassword,
      propertyTypes: [],
    });

    res.status(201).json({ success: true, data: agent });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const loginAgent = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const agent = await Agent.findOne({ email: email.toLowerCase().trim() });
    if (!agent) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (!agent.password) {
      return res.status(401).json({ success: false, message: "This account was not registered via the portal" });
    }

    const isMatch = await bcrypt.compare(password, agent.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Return agent without password
    const { password: _, ...agentData } = agent.toObject();

    res.json({ success: true, agent: agentData });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerAgent, loginAgent };