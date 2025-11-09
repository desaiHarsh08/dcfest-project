-- Fix entry_type column to support WAITING_LIST
-- Run this SQL script on your database to update the entry_type column

-- Step 1: Check the current column definition
-- Run this first to see what type the column is:
-- SHOW COLUMNS FROM participants WHERE Field = 'entry_type';

-- Step 2: If the column is an ENUM, convert it to VARCHAR to support all enum values
-- This is the safest approach as it allows for future enum additions without schema changes
ALTER TABLE participants 
MODIFY COLUMN entry_type VARCHAR(20) NOT NULL DEFAULT 'NORMAL';

-- Step 3: Verify the change
-- SHOW COLUMNS FROM participants WHERE Field = 'entry_type';

-- Note: If you prefer to keep it as ENUM, use this instead:
-- ALTER TABLE participants 
-- MODIFY COLUMN entry_type ENUM('NORMAL', 'OTSE', 'WAITING_LIST') NOT NULL DEFAULT 'NORMAL';

