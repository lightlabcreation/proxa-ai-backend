const db = require("../../../config/config");
const bcrypt = require("bcrypt");

const Department = db.department;
const  sequelize = db.sequelize; // import your sequelize instance
const User = db.user;
// Create a new department
const add_department = async (req, res) => {
  const userId = req.user.id;
  try {
    const { name, description, email, password ,userType,permissions,role,type} = req.body;
   const notEncryptPassword=password;
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const department = await Department.create({
      name,
      description,
      email_id:email,
      password: hashedPassword,
      userType,
      userId,
      permissions,
      role,
      notEncryptPassword,
      type
    });

    res.status(201).json({
      status: true,
      message: "Department added successfully!",
      data: department,
    });
  } catch (error) {
    console.error("Error creating department:", error);
    res.status(500).json({
      status: false,
      message: "Failed to add department",
      error: error.message,
    });
  }
};

// Get all departments
const get_all_departments = async (req, res) => {
  try {
    // Check user role for data filtering
    const userType = req.user?.userType;
    const userId = req.user?.id;
    const isSuperAdmin = userType === 'superadmin';
    
    // Build where clause for Admin users (filter by userId)
    const adminWhereClause = isSuperAdmin ? {} : { userId: userId };
    
    const departments = await Department.findAll({
      where: adminWhereClause
    });

    // Parse permissions field into an array
    const formattedDepartments = departments.map((dept) => {
      let parsedPermissions = [];

      if (typeof dept.permissions === "string") {
        parsedPermissions = dept.permissions.split(","); // Convert comma-separated string to an array
      } else if (Array.isArray(dept.permissions)) {
        parsedPermissions = dept.permissions; // Already an array
      }

      return {
        ...dept.toJSON(),
        permissions: parsedPermissions,
      };
    });

    res.status(200).json({
      status: true,
      message: "Departments fetched successfully!",
      data: formattedDepartments,
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch departments",
      error: error.message,
    });
  }
};
const get_department_by_id = async (req, res) => {
  try {
    // Check user role for data filtering
    const userType = req.user?.userType;
    const userId = req.user?.id;
    const isSuperAdmin = userType === 'superadmin';
    
    const { id } = req.params;
    
    // Build where clause - Admin users can only see their own departments
    const whereClause = { id };
    if (!isSuperAdmin && userId) {
      whereClause.userId = userId;
    }
    
    const department = await Department.findOne({ where: whereClause });

    if (!department) {
      return res.status(404).json({
        status: false,
        message: "Department not found",
      });
    }

    // Parse permissions into an array if stored as a string
    // let parsedPermissions = [];
    // if (typeof department.permissions === "string") {
    //   parsedPermissions = department.permissions.split(",");
    // } else if (Array.isArray(department.permissions)) {
    //   parsedPermissions = department.permissions;
    // }

    res.status(200).json({
      status: true,
      message: "Department fetched successfully!",
      // data: {
      //   ...department.toJSON(),
      //   permissions: parsedPermissions,
      // },
      data:department
    });
  } catch (error) {
    console.error("Error fetching department by ID:", error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch department",
      error: error.message,
    });
  }
};


// Update a department
const update_department = async (req, res) => {
    try {
      // Check user role for data filtering
      const userType = req.user?.userType;
      const userId = req.user?.id;
      const isSuperAdmin = userType === 'superadmin';
      
      const { id } = req.params;
  
      // Build where clause - Admin users can only update their own departments
      const whereClause = { id };
      if (!isSuperAdmin && userId) {
        whereClause.userId = userId;
      }
  
      const department = await Department.findOne({ where: whereClause });
  
      if (!department) {
        return res.status(404).json({
          status: false,
          message: "Department not found",
        });
      }
  
      // If password is provided, hash it before updating
      if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 10);
      }
  
      // Update fields using req.body
      await department.update(req.body);
  
      res.status(200).json({
        status: true,
        message: "Department updated successfully!",
        data: department,
      });
    } catch (error) {
      console.error("Error updating department:", error);
      res.status(500).json({
        status: false,
        message: "Failed to update department",
        error: error.message,
      });
    }
  };
  // Delete a department
const delete_department = async (req, res) => {
  try {
    // Check user role for data filtering
    const userType = req.user?.userType;
    const userId = req.user?.id;
    const isSuperAdmin = userType === 'superadmin';
    
    const { id } = req.params;

    // Build where clause - Admin users can only delete their own departments
    const whereClause = { id };
    if (!isSuperAdmin && userId) {
      whereClause.userId = userId;
    }

    const department = await Department.findOne({ where: whereClause });

    if (!department) {
      return res.status(404).json({
        status: false,
        message: "Department not found",
      });
    }

    await department.destroy();

    res.status(200).json({
      status: true,
      message: "Department deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({
      status: false,
      message: "Failed to delete department",
      error: error.message,
    });
  }
};
const add_department_flow = async (req, res) => {
  const userId = req.user.id;
  const departments = req.body.departments;

  const transaction = await sequelize.transaction(); // 🔁 Start transaction

  try {
    const created = [];

    for (const dept of departments) {
      const {
        name,
        description,
        email,
        password,
        userType,
        permissions,
        role,
        type,
      } = dept;

      if (!password) throw new Error("Password is required");

      const hashedPassword = await bcrypt.hash(password, 10);

      const department = await Department.create(
        {
          name,
          description,
          email_id: email,
          password: hashedPassword,
          userType: userType || type,
          userId,
          permissions: permissions || [],
          role,
          notEncryptPassword: password,
          type,
        },
        { transaction }
      );

      created.push(department);
    }

    // ✅ Update user: mark isApprovalFlow true
   const user= await User.update(
      { isapprovalFlow: true },
      {
        where: { id: userId },
        transaction,
      }
    );
    await transaction.commit(); // ✅ Commit transaction

    res.status(201).json({
      status: true,
      message: "Departments added and approval flow marked successfully!",
      data: created,
    });
  } catch (error) {
    await transaction.rollback(); // ❌ Rollback transaction
    console.error("Error creating departments:", error);
    res.status(500).json({
      status: false,
      message: "Failed to create department flow. Rolled back changes.",
      error: error.message,
    });
  }
};


module.exports = {
  add_department,
  get_all_departments,
  update_department,
  delete_department,
  get_department_by_id,
  add_department_flow
};
