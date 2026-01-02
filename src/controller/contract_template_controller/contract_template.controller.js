const db = require('../../../config/config'); 
const ContractTemplate = db.contract_template;

// Add contract template
const add_contract_template = async (req, res) => {
  try {
    const {
      newSupplier,
      existingSupplier,
      extendExistingContract,
      letterOfExtension,
      aggrementName,
    } = req.body;

    const customAgreementFile = req.file?.path
      ? req.file.path.replace(/^.*?public[\\/]/, '')
      : null;

    const template = await ContractTemplate.create({
      newSupplier,
      existingSupplier,
      extendExistingContract,
      letterOfExtension,
      customAgreementFile,
      aggrementName,

      // 🔐 OWNERSHIP
      admin_id: req.user.userType === 'admin' ? req.user.id : null,
    });

    return res.status(201).json({
      success: true,
      message: 'Contract template added successfully.',
      template,
    });
  } catch (error) {
    console.error('Error adding contract template:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


// Get all contract templates
const get_all_contract_templates = async (req, res) => {
  try {
    let whereCondition = {};

    if (req.user.userType === 'admin') {
      whereCondition.admin_id = req.user.id;
    }

    const templates = await ContractTemplate.findAll({
      where: whereCondition,
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      message: 'Contract templates retrieved successfully.',
      templates,
    });
  } catch (error) {
    console.error('Error fetching contract templates:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


// Get contract template by ID
const get_contract_template_by_id = async (req, res) => {
  try {
    const { id } = req.params;

    let whereCondition = { id };

    if (req.user.userType === 'admin') {
      whereCondition.admin_id = req.user.id;
    }

    const template = await ContractTemplate.findOne({
      where: whereCondition,
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Contract template not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Contract template retrieved successfully.',
      template,
    });
  } catch (error) {
    console.error('Error fetching contract template:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


// Update contract template by ID
const update_contract_template = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      newSupplier,
      existingSupplier,
      extendExistingContract,
      letterOfExtension,
    } = req.body;

    const customAgreementFile = req.file?.path
      ? req.file.path.replace(/^.*?public[\\/]/, '')
      : null;

    let whereCondition = { id };

    if (req.user.userType === 'admin') {
      whereCondition.admin_id = req.user.id;
    }

    const template = await ContractTemplate.findOne({
      where: whereCondition,
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Contract template not found.',
      });
    }

    await template.update({
      newSupplier,
      existingSupplier,
      extendExistingContract,
      letterOfExtension,
      customAgreementFile,
    });

    return res.status(200).json({
      success: true,
      message: 'Contract template updated successfully.',
      template,
    });
  } catch (error) {
    console.error('Error updating contract template:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


// Delete contract template by ID
const delete_contract_template = async (req, res) => {
  try {
    const { id } = req.params;

    let whereCondition = { id };

    if (req.user.userType === 'admin') {
      whereCondition.admin_id = req.user.id;
    }

    const template = await ContractTemplate.findOne({
      where: whereCondition,
    });

    if (!template) {
      return res.status(404).json({
        status: false,
        message: 'Contract template not found.',
      });
    }

    await template.destroy();

    return res.status(200).json({
      status: true,
      message: 'Contract template deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting contract template:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal server error',
    });
  }
};


module.exports = {
  add_contract_template,
  get_all_contract_templates,
  get_contract_template_by_id,
  update_contract_template,
  delete_contract_template,
};
