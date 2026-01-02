module.exports = (db) => {

    // ================ intake_request association=============

    db.intake_request.belongsTo(db.user, {
        foreignKey: 'userId',
        as: 'userDetails',
    });

    db.user.hasMany(db.intake_request, {
        foreignKey: 'userId',
        as: 'intakeRequest',
    });
    db.intake_request.belongsTo(db.department, {
        foreignKey: 'requesterDepartmentId',
        as: 'department',
    });

    db.department.hasMany(db.intake_request, {
        foreignKey: 'requesterDepartmentId',
        as: 'intakeRequest',
    });

    db.intake_request.belongsTo(db.category, {
        foreignKey: "categoryId",
        as: "category",
    });
    db.category.hasMany(db.intake_request, {
        foreignKey: "categoryId",
        as: "intakeRequest",
    });

    /////////////////intake request comment associtain /////////////

    db.intake_request_comment.belongsTo(db.intake_request, {
        foreignKey: 'requestId', // or whatever the correct field name is
        as: 'requesdetails',
    });
    
    // In intake_request_approvers model
    db.intake_request.hasMany(db.intake_request_comment, {
        foreignKey: 'requestId',
        as: 'commentsDetails',
    });
    // ================ intake_request_approvers association=============

    db.intake_request_approvers.belongsTo(db.intake_request, {
        foreignKey: 'intakeRequestId',
        as: 'intakeRequest',
    });

    db.intake_request.hasMany(db.intake_request_approvers, {
        foreignKey: 'intakeRequestId',
        as: 'intakeRequestApprovers',
    });

    db.intake_request_approvers.belongsTo(db.user, {
        foreignKey: 'userId',
        as: 'userDetails',
    });

    db.user.hasMany(db.intake_request_approvers, {
        foreignKey: 'userId',
        as: 'intakeRequestApprovers',
    });
    db.intake_request_approvers.belongsTo(db.department, {
        foreignKey: 'userId',
        as: 'departmentDetails',
    });

    db.department.hasMany(db.intake_request_approvers, {
        foreignKey: 'userId',
        as: 'intakeRequestApprovers',
    });

    // ================contract association=============

    db.contract.belongsTo(db.contract_template, {
        foreignKey: "agreementId",
        as: "contractType",
    });
    db.contract_template.hasMany(db.contract, {
        foreignKey: "agreementId",
        as: "contracts",
    });
    db.contract.belongsTo(db.department, {
        foreignKey: "departmentId",
        as: "department",
    });
    db.department.hasMany(db.contract, {
        foreignKey: "departmentId",
        as: "contracts",
    });
    db.contract.belongsTo(db.supplier, {
        foreignKey: "supplierId",
        as: "supplier",
    });
    db.supplier.hasMany(db.contract, {
        foreignKey: "supplierId",
        as: "contracts",
    });


    ///////////////renewal association/////////////////////////
    db.renewal_request.belongsTo(db.contract, {
        foreignKey: "contractId",
        as: "contract",
    });
    db.contract.hasMany(db.renewal_request, {
        foreignKey: "contractId",
        as: "renewalRequest",
    });

    // ================transaction association=============

    db.transaction.belongsTo(db.department, {
        foreignKey: "departmentId",
        as: "department",
    });
    db.department.hasMany(db.transaction, {
        foreignKey: "departmentId",
        as: "transactions",
    });
    db.transaction.belongsTo(db.supplier, {
        foreignKey: "supplierId",
        as: "supplier",
    });
    db.supplier.hasMany(db.transaction, {
        foreignKey: "supplierId",
        as: "transactions",
    });
    db.transaction.belongsTo(db.category, {
        foreignKey: "categoryId",
        as: "category",
    });
    db.category.hasMany(db.transaction, {
        foreignKey: "categoryId",
        as: "transactions",
    });
    db.transaction.belongsTo(db.subcategories, {
        foreignKey: "categoryId",
        as: "subcategory",
    });
    db.subcategories.hasMany(db.transaction, {
        foreignKey: "subcategoryId",
        as: "transactions",
    });

    //////////////////department asssociation////////////////

    db.department.belongsTo(db.user, {
        foreignKey: 'userId',
        as: 'userDetails',
    });

    db.user.hasMany(db.department, {
        foreignKey: 'userId',
        as: 'department',
    });

    /////////////////volume_discount association///////////

    db.volume_discount.belongsTo(db.category, {
        foreignKey: "categoryId",
        as: "category",
    });
    db.category.hasMany(db.volume_discount, {
        foreignKey: "categoryId",
        as: "volumeDiscount",
    });
    db.volume_discount.belongsTo(db.supplier, {
        foreignKey: "recommendedSupplierId",
        as: "supplierDetails",
    });
    db.supplier.hasMany(db.volume_discount, {
        foreignKey: "recommendedSupplierId",
        as: "volumeDiscount",
    });
    // ================service_sow_consolidation association=============

    db.service_sow_consolidation.belongsTo(db.supplier, {
        foreignKey: "existingSupplierServiceId",
        as: "supplierDetails",
    });
    db.supplier.hasMany(db.service_sow_consolidation, {
        foreignKey: "existingSupplierServiceId",
        as: "SowConsolidation",
    });
    db.service_sow_consolidation.belongsTo(db.department, {
        foreignKey: "requestedTeamDepartmentId",
        as: "department",
    });
    db.department.hasMany(db.service_sow_consolidation, {
        foreignKey: "requestedTeamDepartmentId",
        as: "SowConsolidation",
    });
    // ================old_pricing association=============

    db.old_pricing.belongsTo(db.supplier, {
        foreignKey: "supplierId",
        as: "supplier",
    });
    db.supplier.hasMany(db.old_pricing, {
        foreignKey: "supplierId",
        as: "oldPricing",
    });
    db.old_pricing.belongsTo(db.category, {
        foreignKey: "categoryId",
        as: "category",
    });
    db.category.hasMany(db.old_pricing, {
        foreignKey: "categoryId",
        as: "oldPricing",
    });
    db.old_pricing.belongsTo(db.subcategories, {
        foreignKey: "subcategoryId",
        as: "subcategory",
    });
    db.subcategories.hasMany(db.old_pricing, {
        foreignKey: "subcategoryId",
        as: "oldPricing",
    });

    // ================complementary_service association=============

    db.complementary_service.belongsTo(db.supplier, {
        foreignKey: "supplierId",
        as: "supplier",
    });
    db.supplier.hasMany(db.complementary_service, {
        foreignKey: "supplierId",
        as: "complementaryService",
    });
    db.complementary_service.belongsTo(db.category, {
        foreignKey: "categoryId",
        as: "category",
    });
    db.category.hasMany(db.complementary_service, {
        foreignKey: "categoryId",
        as: "complementaryService",
    });

    /////////////////////////assign_intake_request_model association//////////////////////////////

    db.assign_intake_request.belongsTo(db.supplier, {
        foreignKey: 'supplierId',
        as: 'supplier',
    });

    db.supplier.hasOne(db.assign_intake_request, {
        foreignKey: 'supplierId',
        as: 'assignIntakeRequest',
    });
    db.assign_intake_request.belongsTo(db.intake_request, {
        foreignKey: 'requestId',
        as: 'intake_request',
    });

    db.intake_request.hasOne(db.assign_intake_request, {
        foreignKey: 'requestId',
        as: 'assignIntakeRequest',
    });

//////////////////////multi year contarct///////////////////////////////

db.multi_year_contracting.belongsTo(db.supplier, {
    foreignKey: 'supplierId',
    as: 'supplier',
});

db.supplier.hasOne(db.multi_year_contracting, {
    foreignKey: 'supplierId',
    as: 'multi_year_contracting',
});


/////////////price comparison////////////////////////////////////////

db.price_comparison.belongsTo(db.supplier, {
    foreignKey: 'recommendedSupplierId',
    as: 'supplier',
});

db.supplier.hasOne(db.price_comparison, {
    foreignKey: 'recommendedSupplierId',
    as: 'price_comparison',
});
};