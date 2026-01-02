const db = require("../../../config/config")
const user = db.user
const bcrypt = require("bcrypt");
const user_registration = async (req, res) => {
  try {

    const { first_name,last_name,country,city,state,phone_no, email_id, password,gender , userType} = req.body;

    // Check if any of the fields are empty
    const isEmptyKey = Object.values(req.body).some(value => !value);

    if (isEmptyKey) {
      return res
        .status(400) // Changed status code to 400 for bad request
        .json({ status: false, message: "Please do not leave empty fields" });
    }

    const existingUser = await user.findOne({
      where: { email_id: email_id },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ status: false, message: "Email already exists" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await user.create({
      last_name: last_name,
      first_name:first_name,
      country:country,
      city:city,
      state:state,
      phone_no:phone_no,
      password: hashedPassword,
      email_id: email_id,
      gender:gender,
      userType:userType
    });

    // Handle profile image upload if it exists
    // if (req.file) {
    //   const filePath = `profile_image/${req.file.filename}`;
    //   newUser.profile_image = filePath;
    //   await newUser.save();
    // }

    return res.status(200).json({
        status: true,
        message: "Registration successful",
        data: newUser,
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message });
  }
};


  module.exports = { 
    user_registration
  }