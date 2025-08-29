CREATE DATABASE myapp_db;
DROP USER IF EXISTS 'myapp_user'@'localhost';
CREATE USER 'myapp_user'@'localhost' IDENTIFIED BY 'pwD123!';
GRANT ALL PRIVILEGES ON myapp_db.* TO 'myapp_user'@'localhost';
FLUSH PRIVILEGES;
use myapp_db;
Drop database myapp_db;

CREATE TABLE tenants(
	id VARCHAR(255) primary key,
    regNo VARCHAR(255),
    name VARCHAR(255) not null,
    businessInfo VARCHAR(255) not null,
    employees int not null,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
    

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstname VARCHAR(100),
  lastname VARCHAR(100),
  username VARCHAR(100),
  country VARCHAR(100),
  mobile VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_verified TINYINT(1) DEFAULT 0,
  verification_token_hash VARCHAR(128) DEFAULT NULL,
  verification_token_expires DATETIME DEFAULT NULL,
  refresh_token TEXT DEFAULT NULL,
  role VARCHAR(30) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  company_id varchar(255), foreign key(company_id) references tenants(id)
);

SELECT User, Host FROM mysql.user WHERE User='myapp_user';

CREATE TABLE apartments (
    id VARCHAR(255) PRIMARY KEY,
    company_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(255),
    floors INT DEFAULT 1,
    houses INT DEFAULT 1 COMMENT 'Total units',    
    main_picture_url VARCHAR(500),
    status ENUM('active', 'maintenance', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_company_id (company_id),
    INDEX idx_city (city)
);
-- Basic amenities (can be expanded later)
    -- has_parking BOOLEAN DEFAULT FALSE,
--     has_elevator BOOLEAN DEFAULT FALSE,
--     has_security BOOLEAN DEFAULT FALSE,

