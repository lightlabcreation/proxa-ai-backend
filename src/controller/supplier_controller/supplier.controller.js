const db = require('../../../config/config');
const Supplier = db.supplier;
const Assign_intake_request = db.assign_intake_request;
// Add a new supplier
const add_supplier = async (req, res) => {
    const userId =req.user.id;
    try {
        const { name, contactEmail, contactPhone, address, status ,categoryId ,subcategoryId ,  departmentId,  perUnitPrice, maxUnitPurchase, discountPercent,deliveryTerms ,additionalBenefits } = req.body;

        // Check if required fields are empty
        const requiredFields = ['name', 'contactEmail'];
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

        // Create the new supplier
        const newSupplier = await Supplier.create({
            name,
            contactEmail,
            contactPhone,
            address,
            subcategoryId,
            categoryId,
            departmentId,
            perUnitPrice, maxUnitPurchase, discountPercent,deliveryTerms ,additionalBenefits ,
            status: status || 'Active',
            userId
        });

        if (!newSupplier) {
            return res.status(404).json({
                status: false,
                message: 'Supplier not created',
            });
        }

        return res.status(201).json({
            status: true,
            message: 'Supplier added successfully !!',
            data:newSupplier 
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// Get all suppliers
const get_all_suppliers = async (req, res) => {
    try {
        // Check user role for data filtering
        const userType = req.user?.userType;
        const userId = req.user?.id;
        const isSuperAdmin = userType === 'superadmin';
        
        // Build where clause for Admin users (filter by userId)
        const adminWhereClause = isSuperAdmin ? {} : { userId: userId };
        
        // Extract and validate page and limit
        const page = req.query.page ? parseInt(req.query.page, 10) : null;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;

        const offset = page && limit ? (page - 1) * limit : 0;

        // Conditional pagination logic with userId filtering
        const queryOptions = {
            where: adminWhereClause,
            ...(page && limit ? { limit, offset } : {}),  // Apply pagination only if page & limit exist
        };

        const { rows: suppliers, count: totalRecords } = await Supplier.findAndCountAll(queryOptions);

        if (suppliers.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'No suppliers found',
                data: [],
            });
        }

        // Pagination details only if page and limit are provided
        const pagination = page && limit
            ? {
                currentPage: page,
                totalPages: Math.ceil(totalRecords / limit),
                totalRecords,
                limit,
            }
            : null;  // No pagination if page and limit are missing

        return res.status(200).json({
            status: true,
            message: 'Suppliers fetched successfully',
            data: suppliers,
            ...(pagination && { pagination }),  // Add pagination only if it exists
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// Update a supplier
const update_supplier = async (req, res) => {
    try {
        // Check user role for data filtering
        const userType = req.user?.userType;
        const userId = req.user?.id;
        const isSuperAdmin = userType === 'superadmin';
        
        const { id } = req.params;

        // Build where clause - Admin users can only update their own suppliers
        const whereClause = { id };
        if (!isSuperAdmin && userId) {
          whereClause.userId = userId;
        }

        const updatedSupplier = await Supplier.update(req.body, { where: whereClause });

        if (updatedSupplier[0] === 0) {
            return res.status(404).json({
                status: false,
                message: 'Supplier not found',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Supplier updated successfully',
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

// Delete a supplier
const delete_supplier = async (req, res) => {
    try {
        // Check user role for data filtering
        const userType = req.user?.userType;
        const userId = req.user?.id;
        const isSuperAdmin = userType === 'superadmin';
        
        const { id } = req.params;

        // Build where clause - Admin users can only delete their own suppliers
        const whereClause = { id };
        if (!isSuperAdmin && userId) {
          whereClause.userId = userId;
        }

        const deletedSupplier = await Supplier.destroy({ where: whereClause });

        if (deletedSupplier === 0) {
            return res.status(404).json({
                status: false,
                message: 'Supplier not found',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Supplier deleted successfully',
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};
const assign_intake_request =   async (req, res) => {
    const userId = req.user.id;
    try {
        const { requestId , supplierId } = req.body;

        // Check if required fields are empty
        const requiredFields = ['requestId', 'supplierId'];
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

        // Create the new supplier
        const assign_intake_request = await Assign_intake_request.create({
            supplierId,
            requestId,
            userId
        });


        return res.status(201).json({
            status: true,
            message: ' Assign Supplier  successfully !!',
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

const delete_assign_intake_request = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedAssignRequest = await Assign_intake_request.destroy({ where: { requestId:id } });

        if (deletedAssignRequest === 0) {
            return res.status(404).json({
                status: false,
                message: 'Assign_intake_request not found',
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Assign intake request deleted successfully',
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};


module.exports = {
    add_supplier,
    get_all_suppliers,
    update_supplier,
    delete_supplier,
    assign_intake_request,
    delete_assign_intake_request,
};
