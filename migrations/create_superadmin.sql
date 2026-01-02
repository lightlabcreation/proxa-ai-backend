-- Script to create the first SuperAdmin user
-- Run this SQL script to create a SuperAdmin account

-- IMPORTANT: Replace 'SuperAdmin123!' with your desired password
-- You need to hash the password using bcrypt before inserting
-- Use Node.js to hash: const bcrypt = require('bcryptjs'); bcrypt.hash('YourPassword', 10).then(hash => console.log(hash));

-- Option 1: Create SuperAdmin with hashed password
-- Replace 'YOUR_HASHED_PASSWORD_HERE' with the bcrypt hash of your password
INSERT INTO `users` (
  `email_id`, 
  `password`, 
  `userType`, 
  `is_active`, 
  `created_at`
) VALUES (
  'superadmin@procxa.com',
  '$2a$10$YOUR_HASHED_PASSWORD_HERE',  -- Replace this with actual bcrypt hash
  'superadmin',
  TRUE,
  NOW()
);

-- Option 2: If you want to use an existing user as SuperAdmin
-- UPDATE `users` 
-- SET `userType` = 'superadmin', `is_active` = TRUE 
-- WHERE `email_id` = 'your-existing-email@example.com';

-- Verify SuperAdmin was created
SELECT id, email_id, userType, is_active, created_at 
FROM `users` 
WHERE `userType` = 'superadmin';

