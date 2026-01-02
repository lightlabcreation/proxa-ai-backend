const db = require('../../../config/config');
const contract_type = db.contract_type;

const add_contract_type = async (req, res) => {
    // const userId = req.user.id;
    try {
        const { type } = req.body;

        if (!type) {
            return res.status(400).json({ message: 'Type is required.' });
        }

        const newContractType = await contract_type.create({ type });

        res.status(201).json({
            message: 'Contract type added successfully!',
            contractType: newContractType
        });
    } catch (error) {
        console.error('Error adding contract type:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const get_all_contract_types = async (req, res) => {
    try {
        const contractTypes = await contract_type.findAll();

        res.status(200).json({
            message: 'Contract types retrieved successfully!',
            contractTypes
        });
    } catch (error) {
        console.error('Error fetching contract types:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const update_contract_type = async (req, res) => {
    try {
        const { id } = req.params;

        const contractType = await contract_type.findByPk(id);
        if (!contractType) {
            return res.status(404).json({ message: 'Contract type not found.' });
        }

        await contractType.update(req.body);

        res.status(200).json({
            message: 'Contract type updated successfully!',
            contractType
        });
    } catch (error) {
        console.error('Error updating contract type:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


const delete_contract_type = async (req, res) => {
    try {
        const { id } = req.params;

        const contractType = await contract_type.findByPk(id);
        if (!contractType) {
            return res.status(404).json({ message: 'Contract type not found.' });
        }

        await contractType.destroy();

        res.status(200).json({ message: 'Contract type deleted successfully!' });
    } catch (error) {
        console.error('Error deleting contract type:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports = {
    add_contract_type,
    get_all_contract_types,
    update_contract_type,
    delete_contract_type
}