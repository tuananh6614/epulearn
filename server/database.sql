
-- Drop database if exists and create a new one
DROP DATABASE IF EXISTS epu_learning;
CREATE DATABASE epu_learning;
USE epu_learning;

-- Create users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(255),
  bio TEXT,
  last_name_changed DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create courses table
CREATE TABLE courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url VARCHAR(255),
  instructor VARCHAR(100),
  duration VARCHAR(50),
  level VARCHAR(50),
  category VARCHAR(100),
  price DECIMAL(10,2),
  discount_price DECIMAL(10,2),
  is_featured BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create user_courses table (for enrolled courses)
CREATE TABLE user_courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  progress_percentage INT DEFAULT 0,
  last_accessed TIMESTAMP,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE (user_id, course_id)
);

-- Create certificates table
CREATE TABLE certificates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  certificate_id VARCHAR(50) NOT NULL UNIQUE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Insert sample courses
INSERT INTO courses (title, description, thumbnail_url, instructor, duration, level, category, price, discount_price, is_featured) VALUES
('JavaScript Cơ Bản', 'Khóa học JavaScript cơ bản giúp bạn học lập trình từ đầu', '/path/to/thumbnail1.jpg', 'Nguyễn Văn A', '10 giờ', 'Cơ bản', 'Lập trình Web', 599000, 499000, 1),
('React JS Toàn Tập', 'Học cách xây dựng ứng dụng web hiện đại với React', '/path/to/thumbnail2.jpg', 'Trần Văn B', '15 giờ', 'Trung cấp', 'Lập trình Web', 799000, 599000, 1),
('Python cho Data Science', 'Khám phá thế giới khoa học dữ liệu với Python', '/path/to/thumbnail3.jpg', 'Lê Thị C', '20 giờ', 'Trung cấp', 'Data Science', 999000, 799000, 1),
('Lập Trình C++ Nâng Cao', 'Nâng cao kỹ năng lập trình C++ với các kỹ thuật hiện đại', '/path/to/thumbnail4.jpg', 'Phạm Văn D', '25 giờ', 'Nâng cao', 'Lập trình', 1199000, 899000, 1),
('SQL và Cơ Sở Dữ Liệu', 'Học cách thiết kế và quản lý cơ sở dữ liệu hiệu quả', '/path/to/thumbnail5.jpg', 'Hoàng Văn E', '12 giờ', 'Cơ bản', 'Database', 499000, 399000, 0);

-- Insert a demo user (password: password123)
INSERT INTO users (email, password, first_name, last_name, bio) VALUES
('demo@example.com', '$2b$10$XHCm7FP.QKrAkaUYf4olWO3JsLzLqiA7yXyyqK6qBfA/Q2nJRYxHG', 'Demo', 'User', 'This is a demo user account for testing purposes.');

-- Enroll the demo user in some courses
INSERT INTO user_courses (user_id, course_id, progress_percentage) VALUES
(1, 1, 75),
(1, 2, 30),
(1, 3, 0);

-- Add a certificate for the demo user
INSERT INTO certificates (user_id, course_id, certificate_id) VALUES
(1, 1, 'CERT-JS-12345');
