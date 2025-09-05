-- Initial database setup for Achilleus bot
-- This file is run by Docker Compose on first startup

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure proper permissions
GRANT ALL PRIVILEGES ON DATABASE achilleus TO achilleus;