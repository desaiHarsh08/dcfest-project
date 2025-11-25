-- Migration script to fix column length issues
-- Run this script manually before starting the application

-- Fix available_events table columns
ALTER TABLE available_events MODIFY COLUMN description TEXT;
ALTER TABLE available_events MODIFY COLUMN one_liner VARCHAR(1000);

-- Fix event_rules table value column
ALTER TABLE event_rules MODIFY COLUMN value TEXT;

