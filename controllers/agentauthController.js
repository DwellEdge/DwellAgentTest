const Agent = require("../models/Agent");
const bcrypt = require("bcrypt");
const sendWelcomeEmail = require("../services/emailService");

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
    const existing = await Agent.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Uploaded Files
    const photo = req.files?.photo?.[0]?.filename || "";
    const idDocument = req.files?.idDocument?.[0]?.filename || "";

    const lastAgent = await Agent.aggregate([
      { $match: { agentId: { $regex: /^A\d+$/ } } },
      { $project: { num: { $toInt: { $substr: ["$agentId", 1, -1] } } } },
      { $sort: { num: -1 } },
      { $limit: 1 },
    ]);

    const maxIndex = lastAgent.length ? lastAgent[0].num : 0;
    const nextIndex = maxIndex + 1;
    const agentId = `A${String(nextIndex).padStart(2, "0")}`;

    const agent = await Agent.create({
      agentId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      mobileNumber: mobileNumber.trim(),
      officeAddress: officeAddress.trim(),
      homeAddress: homeAddress.trim(),
      address: officeAddress.trim(),
      photo,
      idDocument,
      password: hashedPassword,
      propertyTypes: [],
    });

    // ===========================
    // SEND WELCOME EMAIL
    // ===========================

    // ===========================

    try {
      await sendWelcomeEmail({
        email: agent.email,
        mobileNumber: agent.mobileNumber,
      });

      console.log("Welcome email sent.");
    } catch (emailError) {
      console.log("Email Error:", emailError.message);

      // Don't stop registration if email fails
    }

    // ===========================

    res.status(201).json({
      success: true,
      data: agent,
    });

  } catch (error) {
    console.error("Register error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const loginAgent = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const agent = await Agent.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!agent) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!agent.password) {
      return res.status(401).json({
        success: false,
        message: "This account was not registered via the portal",
      });
    }

    const isMatch = await bcrypt.compare(password, agent.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const { password: _, ...agentData } = agent.toObject();

    res.json({
      success: true,
      agent: agentData,
    });

  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { registerAgent, loginAgent };