const Agent = require("../models/Agent");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const client = require("../services/twilioService");
const sendWelcomeEmail = require("../services/emailService");
const { sendPasswordResetOtpEmail } = require("../services/emailService");

// Strips common SQL injection patterns from a string
const sanitize = (str) => {
  if (typeof str !== "string") return str;
  return str.replace(/(['";\\]|--|\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|UNION|OR|AND)\b)/gi, "");
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const getNextAgentId = async () => {
  const result = await Agent.aggregate([
    { $match: { agentId: { $regex: /^A\d+$/ } } },
    {
      $project: {
        number: {
          $toInt: {
            $substrCP: ["$agentId", 1, { $subtract: [{ $strLenCP: "$agentId" }, 1] }],
          },
        },
      },
    },
    { $sort: { number: -1 } },
    { $limit: 1 },
  ]);

  const nextNumber = result.length ? result[0].number + 1 : 1;
  return `A${String(nextNumber).padStart(2, "0")}`;
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

    // --- Auto-generate agentId and loginId ---
    let agentId = await getNextAgentId();
    let loginId = `${cleanFirstName}${agentId}`;

    // --- Hash password ---
    const hashedPassword = await bcrypt.hash(password, 10);

    // --- File paths from multer ---
    const photo = req.files?.photo?.[0]?.filename || "";
    const idDocument = req.files?.idDocument?.[0]?.filename || "";

    const createAgentPayload = () => ({
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

    const maxRetries = 3;
    let agent;
    for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
      try {
        agent = await Agent.create(createAgentPayload());
        break;
      } catch (createError) {
        if (
          createError.code === 11000 &&
          createError.keyPattern &&
          createError.keyPattern.agentId &&
          attempt < maxRetries
        ) {
          agentId = await getNextAgentId();
          loginId = `${cleanFirstName}${agentId}`;
          continue;
        }
        throw createError;
      }
    }

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
      `Welcome to DwellEdge, let’s grow the business through mutual co-operation!\n` +
      `Important details:\n` +
      `DwellEdge login page: http://localhost:5173/agent-login\n` +
      `Login ID: ${agent.loginId}\n` +
      `Registered email: ${cleanEmail}`;

    try {
      await client.messages.create({
        body: smsMessage,
        from: process.env.TWILIO_PHONE,
        to: `+91${cleanMobile}`,
      });
    } catch (smsErr) {
      console.error("SMS send error:", smsErr.message);
    }

    res.status(201).json({ success: true, data: agent });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const loginAgent = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Email/Username and password are required" });
    }

    const agent = await Agent.findOne({
      $or: [{ email: username.toLowerCase().trim() }, { loginId: username.trim() }],
    });

    if (!agent) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (!agent.password) {
      return res.status(401).json({
        success: false,
        message: "This account was not registered via the portal",
      });
    }

    const isMatch = await bcrypt.compare(password, agent.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const { password: _, ...agentData } = agent.toObject();
    res.json({ success: true, agent: agentData });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const agent = await Agent.findOne({ email: email.toLowerCase().trim() });
    if (!agent) {
      return res.status(404).json({ success: false, message: "No account found with this email" });
    }

    const otp = String(crypto.randomInt(10000, 99999));
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    agent.otp = otp;
    agent.otpExpiry = otpExpiry;
    await agent.save();

    try {
      await sendPasswordResetOtpEmail({ email: agent.email, otp });
    } catch (mailError) {
      console.error("Password reset email error:", mailError.message);
    }

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const agent = await Agent.findOne({ email: email.toLowerCase().trim() });
    if (!agent) {
      return res.status(404).json({ success: false, message: "No account found with this email" });
    }

    if (!agent.otp || agent.otp !== otp || !agent.otpExpiry || new Date(agent.otpExpiry) < new Date()) {
      return res.status(400).json({ success: false, message: "OTP is invalid or expired" });
    }

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "Email, OTP, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const agent = await Agent.findOne({ email: email.toLowerCase().trim() });
    if (!agent) {
      return res.status(404).json({ success: false, message: "No account found with this email" });
    }

    if (!agent.otp || agent.otp !== otp || !agent.otpExpiry || new Date(agent.otpExpiry) < new Date()) {
      return res.status(400).json({ success: false, message: "OTP is invalid or expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    agent.password = hashedPassword;
    agent.otp = undefined;
    agent.otpExpiry = undefined;
    await agent.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset password error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerAgent,
  loginAgent,
  forgotPassword,
  verifyOtp,
  resetPassword,
};