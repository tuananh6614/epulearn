
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Serve uploads directory statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'epu_learning'
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connection successful!');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Make sure your MySQL server is running');
    console.log('2. Check your database credentials in the .env file');
    console.log('3. Create the database using: mysql -u YOUR_USERNAME -p < database.sql');
    console.log('4. If using root without password, try DB_PASSWORD= (empty string) in .env\n');
    return false;
  }
}

// Health check endpoint
app.get('/api/health-check', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    if (dbConnected) {
      return res.status(200).json({ status: 'ok', message: 'Server is running and connected to database' });
    } else {
      return res.status(500).json({ status: 'error', message: 'Server is running but database connection failed' });
    }
  } catch (error) {
    console.error('Health check error:', error);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc' });
  }
  
  try {
    const [rows] = await pool.execute(
      'SELECT id, email, password, first_name, last_name, avatar_url, bio, last_name_changed FROM users WHERE email = ?',
      [email]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }
    
    const user = rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }
    
    // Don't send password back to client
    delete user.password;
    
    // Convert snake_case to camelCase for frontend
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      avatarUrl: user.avatar_url ? `/uploads/${user.avatar_url}` : null,
      bio: user.bio,
      lastNameChanged: user.last_name_changed
    };
    
    return res.status(200).json({ message: 'Đăng nhập thành công', user: userData });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại sau' });
  }
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
  }
  
  try {
    // Check if email already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Email này đã được sử dụng' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new user
    const [result] = await pool.execute(
      'INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, firstName, lastName]
    );
    
    return res.status(201).json({ 
      message: 'Đăng ký thành công',
      userId: result.insertId 
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại sau' });
  }
});

// User profile update endpoint
app.put('/api/users/:id', async (req, res) => {
  const userId = req.params.id;
  const { firstName, lastName, bio, lastNameChanged } = req.body;
  
  try {
    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );
    
    if (existingUsers.length === 0) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    
    // Check if name is being changed and if lastNameChanged is provided
    let nameUpdateQuery = '';
    let nameUpdateParams = [];
    
    if (firstName !== undefined || lastName !== undefined) {
      if (lastNameChanged) {
        nameUpdateQuery = ', first_name = ?, last_name = ?, last_name_changed = ?';
        nameUpdateParams = [firstName, lastName, lastNameChanged];
      } else {
        nameUpdateQuery = ', first_name = ?, last_name = ?';
        nameUpdateParams = [firstName, lastName];
      }
    }
    
    // Build the query based on what's being updated
    const bioParam = bio !== undefined ? [bio] : [];
    const updateQuery = `UPDATE users SET bio = ?${nameUpdateQuery} WHERE id = ?`;
    const params = [...bioParam, ...nameUpdateParams, userId];
    
    // Execute update
    await pool.execute(updateQuery, params);
    
    return res.status(200).json({ 
      message: 'Thông tin người dùng đã được cập nhật',
      updated: {
        firstName: firstName,
        lastName: lastName,
        bio: bio,
        lastNameChanged: lastNameChanged
      }
    });
  } catch (error) {
    console.error('User update error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại sau' });
  }
});

// Password change endpoint
app.put('/api/users/:id/change-password', async (req, res) => {
  const userId = req.params.id;
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
  }
  
  try {
    // Get user's current password
    const [rows] = await pool.execute(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    
    // Check if current password is correct
    const user = rows[0];
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Mật khẩu hiện tại không chính xác' });
    }
    
    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );
    
    return res.status(200).json({ message: 'Mật khẩu đã được thay đổi thành công' });
  } catch (error) {
    console.error('Password change error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại sau' });
  }
});

// Get featured courses
app.get('/api/featured-courses', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM courses WHERE is_featured = 1 LIMIT 4'
    );
    
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Featured courses error:', error);
    return res.status(500).json({ error: 'Lỗi khi tải khóa học nổi bật' });
  }
});

// Get user courses
app.get('/api/users/:id/courses', async (req, res) => {
  const userId = req.params.id;
  
  try {
    const [rows] = await pool.execute(
      `SELECT c.*, uc.progress_percentage, uc.last_accessed
       FROM user_courses uc
       JOIN courses c ON uc.course_id = c.id
       WHERE uc.user_id = ?`,
      [userId]
    );
    
    return res.status(200).json({ courses: rows });
  } catch (error) {
    console.error('User courses error:', error);
    return res.status(500).json({ error: 'Lỗi khi tải khóa học của người dùng' });
  }
});

// Get user certificates
app.get('/api/users/:id/certificates', async (req, res) => {
  const userId = req.params.id;
  
  try {
    const [rows] = await pool.execute(
      `SELECT c.*, co.title as course_title, co.thumbnail_url
       FROM certificates c
       JOIN courses co ON c.course_id = co.id
       WHERE c.user_id = ?`,
      [userId]
    );
    
    return res.status(200).json({ certificates: rows });
  } catch (error) {
    console.error('User certificates error:', error);
    return res.status(500).json({ error: 'Lỗi khi tải chứng chỉ của người dùng' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  testConnection();
});
