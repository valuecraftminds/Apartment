CREATE DATABASE myapp_db;
DROP USER IF EXISTS 'myapp_user'@'localhost';
CREATE USER 'myapp_user'@'localhost' IDENTIFIED BY 'pwD123!';
GRANT ALL PRIVILEGES ON myapp_db.* TO 'myapp_user'@'localhost';
FLUSH PRIVILEGES;
use myapp_db;
Drop database myapp_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstname VARCHAR(100),
  lastname VARCHAR(100),
  country VARCHAR(100),
  mobile VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_verified TINYINT(1) DEFAULT 0,
  verification_token_hash VARCHAR(128) DEFAULT NULL,
  verification_token_expires DATETIME DEFAULT NULL,
  refresh_token TEXT DEFAULT NULL,
  role VARCHAR(30) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


SELECT User, Host FROM mysql.user WHERE User='myapp_user';


