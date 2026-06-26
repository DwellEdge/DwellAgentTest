const Agent = require("../models/Agent");

const getAgents = async (req, res) => {
  try {
    const agents = await Agent.find();

    res.json(agents);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const createAgent = async (req, res) => {
  try {
    const agent = await Agent.create(req.body);

    res.status(201).json({
      success: true,
      data: agent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAgents,
  createAgent,
};