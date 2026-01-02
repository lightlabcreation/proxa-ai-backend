const db = require('../../../config/config'); 
const renewal_notification = db.renewal_notification;

const add_notification = async (req, res) => {
  try {
    const {  remindBeforeDays, emailSubject, emailBody , contractType } = req.body;
    const contractTypes = Array.isArray(contractType) ? contractType : [contractType];

    const notification = await renewal_notification.create({
      contractType: contractTypes, 
      remindBeforeDays: remindBeforeDays || 7,
      emailSubject: emailSubject ,
      emailBody:emailBody 
    });

    res.status(201).json({
        status:true,
      message: 'Notification Add successfully!',
      notification,
    });
  } catch (error) {
    console.error('Error adding notification:', error);
    res.status(500).json({ status:false ,message: 'Internal server error', error: error.message });
  }
};

module.exports = { add_notification };
