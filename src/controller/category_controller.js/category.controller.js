
// const db = require("../../../config/config")
// const category = db.category;
// const add_category = async (req, res) => {

//     try {
//         const userId = req.user.id;

//         const { name, type, description } = req.body;

//         if (!name || !type) {
//             return res.status(400).json({ message: 'Category name and type are required' });
//         }

//         // Create a new category
//         const newCategory = await category.create({
//             name,
//             type,
//             description,
//             userId,
//         });

//         return res.status(201).json({
//             message: 'Category added successfully !',
//             category: newCategory,
//         });
//     } catch (error) {
//         console.error('Error adding category:', error);
//         return res.status(500).json({ message: 'Internal server error' });
//     }
// };
// const get_categories = async (req, res) => {
//     try {
//         const  userId  = req.user.id;

//         if (!userId) {
//             return res.status(400).json({ message: 'User ID is required' });
//         }

//         const categories = await category.findAll({
//             where: {
//                 userId: userId,
//             },
//         });

//         if (categories.length === 0) {
//             return res.status(404).json({ message: 'No categories found for this user' });
//         }

//         return res.status(200).json({
//             message: 'Categories retrieved successfully',
//             categories,
//         });
//     } catch (error) {
//         console.error('Error fetching categories:', error);
//         return res.status(500).json({ message: 'Internal server error' });
//     }
// };


// module.exports = {
//     add_category,
//     get_categories
// } 







const db = require("../../../config/config")
const category = db.category;
const add_category = async (req, res) => {

    try {
        const userId = req.user.id;

        const { name, type, description } = req.body;

        if (!name || !type) {
            return res.status(400).json({ message: 'Category name and type are required' });
        }

        // Create a new category
        const newCategory = await category.create({
            name,
            type,
            description,
            userId,
        });

        return res.status(201).json({
            message: 'Category added successfully !',
            category: newCategory,
        });
    } catch (error) {
        console.error('Error adding category:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
// const get_categories = async (req, res) => {
//     try {
//         const  userId  = req.user.id;

//         if (!userId) {
//             return res.status(400).json({ message: 'User ID is required' });
//         }

//         const categories = await category.findAll({
//             where: {
//                 userId: userId,
//             },
//         });

//         if (categories.length === 0) {
//             return res.status(404).json({ message: 'No categories found for this user' });
//         }

//         return res.status(200).json({
//             message: 'Categories retrieved successfully',
//             categories,
//         });
//     } catch (error) {
//         console.error('Error fetching categories:', error);
//         return res.status(500).json({ message: 'Internal server error' });
//     }
// };


const get_categories = async (req, res) => {
  try {
    const categories = await category.findAll();

    return res.status(200).json({
      message: "Categories retrieved successfully",
      categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
    add_category,
    get_categories
}