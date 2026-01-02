const db = require('../../../config/config');
const Contract = db.contract
const renewal_request= db.renewal_request
const ContractType=db.contract_type
// Add a new renewal request
const add_renewal_request = async (req, res) => {
    const userId = req.user.id ;
    try {
        const renewalAttachmentFile = req.file ? req.file.path : null;
        const {
            contractId,
            description,
            amendments,
            previousExpirationDate,
            newExpirationDate,
            additionalNotes,
            selectDepartment,
            vendorName,
            contractPrice,
            addService
        } = req.body;

        // Check if required fields are empty
        const requiredFields = [
            'contractId',
            'description',
            'previousExpirationDate',
            'newExpirationDate',
            'selectDepartment',
        ];

        const isEmptyKey = requiredFields.some(field => {
            const value = req.body[field];
            return value === null || value === undefined;
        });

        if (isEmptyKey) {
            return res.status(400).json({
                status: false,
                message: 'Please fill in all required fields',
            });
        }

        // Create the new renewal request
        const newRenewalRequest = await renewal_request.create({
            contractId,
            description,
            amendments,
            previousExpirationDate,
            newExpirationDate,
            additionalNotes,
            selectDepartment,
            renewalAttachmentFile,
            vendorName,
            contractPrice,
            addService,

            userId
        });

        if (!newRenewalRequest) {
            return res.status(404).json({
                status: false,
                message: 'Renewal request not created',
            });
        }

        return res.status(201).json({
            status: true,
            message: 'Renewal request added successfully',
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// Get all renewal requests
const get_all_renewal_requests = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 7;
        const offset = (page - 1) * limit;

        const { rows: renewalRequests, count: totalRecords } = await renewal_request.findAndCountAll({
            limit,
            offset,
            include: [
                {
                    model: Contract,
                    as: 'contract',
                    attributes: ['id', 'contractName' , 'contractTypeId' ],
                },
            ],

        });

        if (renewalRequests.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'No renewal requests found',
                data: [],
            });
        }

        const totalPages = Math.ceil(totalRecords / limit);

        return res.status(200).json({
            status: true,
            message: 'Renewal requests fetched successfully',
            data: renewalRequests,
            pagination: {
                currentPage: page,
                totalPages,
                totalRecords,
                limit,
            },
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// Update a renewal request
const update_renewal_request = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedRequest = await renewal_request.update(req.body, { where: { id } });

        if (updatedRequest[0] === 0) {
            return res.status(404).json({
                status: false,
                message: 'Renewal request not found',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Renewal request updated successfully',
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// Delete a renewal request
const delete_renewal_request = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedRequest = await renewal_request.destroy({ where: { id } });

        if (deletedRequest === 0) {
            return res.status(404).json({
                status: false,
                message: 'Renewal request not found',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Renewal request deleted successfully',
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

module.exports = {
    add_renewal_request,
    get_all_renewal_requests,
    update_renewal_request,
    delete_renewal_request,
};
