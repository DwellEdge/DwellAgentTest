const Agent = require("../models/Agent");
const bcrypt = require("bcrypt");
const client = require("../services/twilioService");
const sendWelcomeEmail = require("../services/emailService");

// Strips common SQL injection patterns from a string
const sanitize = (str) => {
  if (typeof str !== "string") return str;
  return str.replace(/(['";\\]|--|\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|UNION|OR|AND)\b)/gi, "");
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

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
      referral,
    } = req.body;

    // --- Field-level backend validation ---

    const cleanFirstName = sanitize(firstName?.trim() || "");
    const cleanLastName = sanitize(lastName?.trim() || "");
    const cleanEmail = email?.toLowerCase().trim() || "";
    const cleanMobile = mobileNumber?.trim() || "";
    const cleanOffice = sanitize(officeAddress?.trim() || "");
    const cleanHome = sanitize(homeAddress?.trim() || "");
    const cleanReferral = referral?.trim() || "";

    if (!cleanFirstName || !cleanLastName) {
      return res.status(400).json({ success: false, message: "Agent name is required" });
    }

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    if (!/^\d{10}$/.test(cleanMobile)) {
      return res.status(400).json({ success: false, message: "Phone number must be exactly 10 digits" });
    }

    if (!cleanOffice) {
      return res.status(400).json({ success: false, message: "Office address is required" });
    }

    if (!cleanHome) {
      return res.status(400).json({ success: false, message: "Home address is required" });
    }

    if (!req.files?.photo?.[0]) {
      return res.status(400).json({ success: false, message: "Agent photo is required" });
    }

    if (!req.files?.idDocument?.[0]) {
      return res.status(400).json({ success: false, message: "ID document is required" });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    // --- Email uniqueness check ---
    const existing = await Agent.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // --- Referral validation (optional field) ---
    let referredBy = null;
    if (cleanReferral) {
      const referringAgent = await Agent.findOne({
        $or: [
          { loginId: { $regex: `^${cleanReferral}$`, $options: "i" } },
          { firstName: { $regex: `^${cleanReferral}$`, $options: "i" } },
        ],
      });

      if (!referringAgent) {
        return res.status(400).json({
          success: false,
          message: "Referral not found. Please enter a valid referral ID or agent name.",
        });
      }

      referredBy = {
        agentId: referringAgent.agentId,
        loginId: referringAgent.loginId,
        name: `${referringAgent.firstName} ${referringAgent.lastName}`,
      };
    }

    // --- Auto-generate agentId and loginId (next number after highest existing ID) ---
    const existingAgents = await Agent.find({ agentId: /^A\d+$/i }).select("agentId").lean();
    const maxNum = existingAgents.reduce((max, a) => {
      const num = parseInt(a.agentId.slice(1), 10);
      return Number.isNaN(num) ? max : Math.max(max, num);
    }, 0);
    const agentId = `A${String(maxNum + 1).padStart(2, "0")}`;
    const loginId = `${cleanFirstName}${agentId}`;

    // --- Hash password ---
    const hashedPassword = await bcrypt.hash(password, 10);

    // --- File paths from multer ---
    const photo = req.files?.photo?.[0]?.filename || "";
    const idDocument = req.files?.idDocument?.[0]?.filename || "";

    // --- Create agent ---
    const agent = await Agent.create({
      agentId,
      firstName: cleanFirstName,
      lastName: cleanLastName,
      email: cleanEmail,
      mobileNumber: cleanMobile,
      officeAddress: cleanOffice,
      homeAddress: cleanHome,
      address: cleanOffice,
      photo,
      idDocument,
      password: hashedPassword,
      loginId,
      referredBy,
      propertyTypes: [],
    });

    try {
      await sendWelcomeEmail({
        email: agent.email,
        mobileNumber: agent.mobileNumber,
        loginId: agent.loginId,
      });

      console.log("Welcome email sent.");
    } catch (emailError) {
      console.error("Email Error:", emailError.message);
    }

    // --- Send SMS ---
    const smsMessage =
      `Welcome to DwellAgent let grow the business through mutual co-operation! ` +
      `below are the important details\n` +
      `DwellAgent link to publish the property: http://localhost:5173/agent-login\n` +
      `login id: ${loginId}\n` +
      `Registered email: ${cleanEmail}`;

    try {
      if (!process.env.TWILIO_PHONE) {
        throw new Error("TWILIO_PHONE is not configured");
      }

      await client.messages.create({
        body: smsMessage,
        from: process.env.TWILIO_PHONE,
        to: `+91${cleanMobile}`,
      });
      console.log(`Welcome SMS sent to +91${cleanMobile}`);
    } catch (smsErr) {
      console.error("SMS send error:", smsErr.code || "unknown", smsErr.message);
    }

    res.status(201).json({ success: true, data: agent });
  } catch (error) {
    console.error("Register error:", error.message);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Registration failed due to an ID conflict. Please try again.",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const loginAgent = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and Password are required",
      });
    }

    const cleanUsername = username.trim();

    // Find agent by Email OR Login ID OR First Name
    const agent = await Agent.findOne({
      $or: [
        { email: cleanUsername.toLowerCase() },
        { loginId: { $regex: `^${cleanUsername}$`, $options: "i" } },
        { firstName: { $regex: `^${cleanUsername}$`, $options: "i" } },
      ],
    });

    if (!agent) {
      return res.status(401).json({
        success: false,
        message: "Invalid Username or Password",
      });
    }

    if (!agent.password) {
      return res.status(401).json({
        success: false,
        message: "This account was not registered through the portal",
      });
    }

    const isMatch = await bcrypt.compare(password, agent.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Username or Password",
      });
    }

    // Remove password before sending response
    const { password: _, ...agentData } = agent.toObject();

    res.status(200).json({
      success: true,
      message: "Login Successful",
      agent: agentData,
    });
  } catch (error) {
    console.error("Login Error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { registerAgent, loginAgent };