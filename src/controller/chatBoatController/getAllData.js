const db = require("../../../config/config");

const Supplier = db.supplier;
const Contract = db.contract;
const SupplierRating = db.supplier_rating;
const Transaction = db.transaction;
const MultiYearContracting = db.multi_year_contracting;
const ComplementaryService = db.complementary_service;
const AssignIntakeRequest = db.assign_intake_request;

// Controller function to fetch all data by userId
const getAllDataByOrganisaton = async (req, res) => {
  const { userId } = req.query;

  try {
    // Fetch all required data concurrently
    const [
      suppliers,
      contracts,
      supplierRatings,
      transactions,
      multiYearContractings,
      complementaryServices,
      assignIntakeRequests
    ] = await Promise.all([
      Supplier.findAll({ where: { userId } }),
      Contract.findAll({ where: { userId } }),
      SupplierRating.findAll({ where: { userId } }),
      Transaction.findAll({ where: { userId } }),
      MultiYearContracting.findAll({ where: { userId } }),
      ComplementaryService.findAll({ where: { userId } }),
      AssignIntakeRequest.findAll({ where: { userId } })
    ]);

    return res.status(200).json({
      suppliers,
      contracts,
      supplierRatings,
      transactions,
      multiYearContractings,
      complementaryServices,
      assignIntakeRequests
    });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllDataByOrganisaton
};
