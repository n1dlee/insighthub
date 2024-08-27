-- Create ENUM types for primary degree and primary job
CREATE TYPE primary_degree_enum AS ENUM ('School', 'Bachelors');
CREATE TYPE primary_job_enum AS ENUM ('Analyst', 'Manager', 'Director');

-- Add timestamps to posts
ALTER TABLE student_posts ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE investor_posts ADD COLUMN created_at TIMESTAMP DEFAULT NOW();

-- Create students table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    educationPlace VARCHAR(255),
    middle VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    livesOutsideUS BOOLEAN,
    primaryDegree primary_degree_enum
);

-- Create investor table
CREATE TABLE investor (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    middle VARCHAR(255),
    surname VARCHAR(255),
    age INTEGER,
    companyName VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    livesOutsideUS BOOLEAN,
    workPlace VARCHAR(255),
    jobFunc primary_job_enum
);

-- Create student_posts table
CREATE TABLE student_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    content TEXT,
    student_id INTEGER,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Create investor_posts table
CREATE TABLE investor_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    content TEXT,
    investor_id INTEGER,
    FOREIGN KEY (investor_id) REFERENCES investor(id) ON DELETE CASCADE
);

-- Create a table to track connections
CREATE TABLE student_investor_connections (
    student_id INTEGER REFERENCES students(id),
    investor_id INTEGER REFERENCES investor(id),
    connection_status VARCHAR(50), -- e.g., 'Pending', 'Connected'
    PRIMARY KEY (student_id, investor_id)
);