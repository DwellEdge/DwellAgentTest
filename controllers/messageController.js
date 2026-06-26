const Customer = require("../models/Customer");
const client = require("../services/twilioService");

const sendMessage = async (req, res) => {
  const { phone, name, agents } = req.body;

  if (!phone || phone.length !== 10 || isNaN(phone)) {
    return res.status(400).json({
      success: false,
      error: "Invalid phone number",
    });
  }

  try {
    // --------------------------
    // Save Customer
    // --------------------------
    const lastCustomer = await Customer.findOne().sort({ Id: -1 });

    const nextId = lastCustomer
      ? lastCustomer.Id + 1
      : 1001;

    const customer = new Customer({
      Id: nextId,
      name,
      mobileNumber: phone,
      createdDateAndTime: new Date(),
    });

    await customer.save();

    // --------------------------
    // Agent Details
    // --------------------------
    const agentDetails =
      agents && agents.length > 0
        ? agents
            .map(
              (agent, i) =>
                `Agent ${i + 1}
Name: ${agent.firstName} ${agent.lastName}
City: ${agent.city}
Area: ${agent.area}
Address: ${agent.address}
Mobile: ${agent.mobileNumber}`
            )
            .join("\n\n")
        : "No agents selected";

    // --------------------------
    // Messages
    // --------------------------
    const smsMessage = `Hi ${name}! Thank you for using DwellAgent. Our agents will contact you shortly.`;

    const whatsappMessage = `Hi ${name}! 👋

Thank you for using DwellAgent! 🏠

Your selected agents:

${agentDetails}

Our team will contact you shortly.`;

    // --------------------------
    // SMS
    // --------------------------
    try {
      const sms = await client.messages.create({
        body: smsMessage,
        from: process.env.TWILIO_PHONE,
        to: `+91${phone}`,
      });

      console.log("✅ SMS Sent:", sms.sid);
    } catch (err) {
      console.log("❌ SMS ERROR");
      console.log(err.code);
      console.log(err.message);
    }

    // --------------------------
    // WhatsApp
    // --------------------------
    try {
      const whatsapp = await client.messages.create({
        body: whatsappMessage,
        from: "whatsapp:+14155238886",
        to: `whatsapp:+91${phone}`,
      });

      console.log("✅ WhatsApp Sent:", whatsapp.sid);
    } catch (err) {
      console.log("❌ WHATSAPP ERROR");
      console.log(err.code);
      console.log(err.message);
    }

    return res.json({
      success: true,
    });

  } catch (err) {
    console.error("Controller Error:", err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

module.exports = {
  sendMessage,
};