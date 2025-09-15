-- AI Bootcamp Tutor MVP Database Initialization
-- This script is automatically run when using Docker Compose

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS tutor_db;

-- Create user and grant permissions
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'tutor_user') THEN

      CREATE ROLE tutor_user LOGIN PASSWORD 'tutor_password';
   END IF;
END
$do$;

-- Grant all privileges to the user
GRANT ALL PRIVILEGES ON DATABASE tutor_db TO tutor_user;

-- Connect to the database
\c tutor_db;

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO tutor_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tutor_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO tutor_user;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
