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
    is_active TINYINT(1) DEFAULT 1,
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
  is_active TINYINT(1) DEFAULT 1,
  company_id varchar(255), foreign key(company_id) references tenants(id)
);

drop table users;

SELECT User, Host FROM mysql.user WHERE User='myapp_user';

CREATE TABLE apartments (
    id VARCHAR(255) PRIMARY KEY,
    company_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(255),
    floors INT DEFAULT 1,
    houses INT DEFAULT 1 COMMENT 'Total units',    
    picture VARCHAR(255),
    status ENUM('active', 'maintenance') DEFAULT 'active',
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_company_id (company_id),
    INDEX idx_city (city)
);
drop table apartments;

-- floors
CREATE TABLE floors(
	id INT AUTO_INCREMENT PRIMARY KEY,
    company_id VARCHAR(255),
    apartment_id VARCHAR(255), 
    floor_no VARCHAR(255) NOT NULL,
    house_count INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE,
    INDEX idx_company_id (company_id),
    INDEX idx_apartment_id (apartment_id)
);
drop table floors;

CREATE TABLE houses(
	id INT Auto_INCREMENT PRIMARY KEY,
    company_id VARCHAR(255),
    apartment_id VARCHAR(255), 
    floor_id INT,
    house_no VARCHAR(255) NOT NULL,
	status ENUM('vacant', 'occupied', 'maintenance') DEFAULT 'vacant',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE,
    FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE CASCADE,
    INDEX idx_company_id (company_id),
    INDEX idx_apartment_id (apartment_id),
    INDEX idx_floor_id (floor_id)
);

drop table house;

-- CREATE TABLE family(
-- 	
-- );