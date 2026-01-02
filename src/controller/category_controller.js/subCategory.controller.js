
// const db = require("../../../config/config");
// const subcategory  = db.subcategories; 

// // Add a new subcategory
// const add_subcategory = async (req, res) => {
//     const userId  = req.user.id;
//   try {
//     const { categoryId, name, description } = req.body;

//     if (!categoryId || !name) {
//       return res.status(400).json({ message: 'Category ID and Subcategory name are required' });
//     }

//     const newSubcategory = await subcategory.create({
//       categoryId, 
//       name,
//       description,
//       userId
//     });

//     return res.status(201).json({
//       message: 'Subcategory added successfully',
//       subcategory: newSubcategory,
//     });
//   } catch (error) {
//     console.error('Error adding subcategory:', error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };
// const get_sub_categories = async (req, res) => {
//   try {
//     const subcategories = await subcategory.findAll(); 

//     if (subcategories.length === 0) {
//       return res.status(404).json({ message: 'No categories found' });
//     }

//     return res.status(200).json({
//       message: 'Categories retrieved successfully',
//       subcategories,
//     });
//   } catch (error) {
//     console.error('Error retrieving categories:', error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };

// module.exports = {
//     add_subcategory,
//     get_sub_categories
// };










const db = require("../../../config/config");
const subcategory  = db.subcategories; 

// Add a new subcategory
const add_subcategory = async (req, res) => {
    const userId  = req.user.id;
  try {
    const { categoryId, name, description } = req.body;

    if (!categoryId || !name) {
      return res.status(400).json({ message: 'Category ID and Subcategory name are required' });
    }

    const newSubcategory = await subcategory.create({
      categoryId, 
      name,
      description,
      userId
    });

    return res.status(201).json({
      message: 'Subcategory added successfully',
      subcategory: newSubcategory,
    });
  } catch (error) {
    console.error('Error adding subcategory:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};



// const get_sub_categories = async (req, res) => {
//   try {
//     const subcategories = await subcategory.findAll(); 

//     if (subcategories.length === 0) {
//       return res.status(404).json({ message: 'No categories found' });
//     }

//     return res.status(200).json({
//       message: 'Categories retrieved successfully',
//       subcategories,
//     });
//   } catch (error) {
//     console.error('Error retrieving categories:', error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };

const get_sub_categories = async (req, res) => {
  try {
    const { categoryId } = req.query;

    // Validation
    if (!categoryId) {
      return res.status(400).json({
        message: "categoryId is required",
      });
    }

    // Fetch subcategories by categoryId
    const subcategories = await subcategory.findAll({
      where: { categoryId },
      order: [["name", "ASC"]], // optional but recommended
    });

    return res.status(200).json({
      message: "Subcategories retrieved successfully",
      subcategories,
    });
  } catch (error) {
    console.error("Error retrieving subcategories:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


module.exports = {
    add_subcategory,
    get_sub_categories
};