// controller/userController.js
const db = require("../../../config/config")
const User = db.user;

const check_approval_flow = async (req, res) => {
  try {
    const userId = req.user.id; // Assumes you're using auth middleware to attach `req.user`

    const user = await User.findByPk(userId, {
      attributes: [ "isapprovalFlow"],
    });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      status: true,
      message: user.isapprovalFlow
        ? "Approval workflow is configured."
        : "Approval workflow is not configured.",
      isApprovalFlow: user.isapprovalFlow,
    });
  } catch (error) {
    console.error("Error checking approval flow:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = { check_approval_flow };
