require('dotenv').config();
const cron = require('node-cron');
const { Op } = require('sequelize');
const db = require("../../config/config");
const contract = db.contract;
const renewal_notification = db.renewal_notification;
const { sendEmail } = require('../utils/mailService');
const recipientEmail = process.env.RECIPIENT_EMAIL;

const sendRenewalNotifications = async () => {
    try {
        console.log('Running renewal notification job...');

        const notifications = await renewal_notification.findAll();

        for (const notification of notifications) {
            const { contractType, remindBeforeDays, emailSubject, emailBody } = notification;

            const contracts = await contract.findAll({
                where: {
                    // contractType: { [Op.in]: contractType }, 
                    endDate: {
                        [Op.lte]: new Date(Date.now() + remindBeforeDays * 24 * 60 * 60 * 1000), 
                    },
                },
            });

            for (const c of contracts) {
                const customizedEmailBody = emailBody
                    .replace('[Recipient]', 'User') 
                    .replace('[Contract Type]', c.contractType);

                // Send email
                const success = await sendEmail(recipientEmail, emailSubject, customizedEmailBody);

                if (success) {
                    console.log(`Email sent for contract: ${c.contractName}`);
                } else {
                    console.error(`Failed to send email for contract: ${c.contractName}`);
                }
            }
        }
    } catch (error) {
        console.error('Error sending renewal notifications:', error);
    }
};

// Schedule the cron job to run daily at 9:00 AM
cron.schedule('0 9 * * *', () => {
    sendRenewalNotifications();
    console.log('Cron job executed successfully at 9:00 AM.');
});

module.exports = { sendRenewalNotifications };
