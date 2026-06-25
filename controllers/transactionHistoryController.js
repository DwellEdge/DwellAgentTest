const TransactionHistory =
  require("../models/TransactionHistory");

const Customer =
  require("../models/Customer");

const createTransaction = async (req, res) => {
  try {

    const customer =
      await Customer.findOne({
        mobileNumber:
          req.body.mobileNumber
      });
      

    const transactionData = {
      ...req.body,
      customerId:
        customer?.Id || null
    };

    const transaction =
      await TransactionHistory.create(
        transactionData
      );

    res.status(201).json({
      success: true,
      data: transaction
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

const getTransactions = async (req, res) => {
  try {

    const transactions =
      await TransactionHistory.find();

    res.json(transactions);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

module.exports = {
  createTransaction,
  getTransactions,
};