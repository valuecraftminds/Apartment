CREATE DATABASE myapp_db;
DROP USER IF EXISTS 'myapp_user'@'localhost';
CREATE USER 'myapp_user'@'localhost' IDENTIFIED BY 'pwD123!';
GRANT ALL PRIVILEGES ON myapp_db.* TO 'myapp_user'@'localhost';
FLUSH PRIVILEGES;
use myapp_db;
Drop database myapp_db;

CREATE TABLE tenants(
	id VARCHAR(255) primary key,
    regNo VARCHAR(255) not null,
    name VARCHAR(255) not null,
    address VARCHAR(255) not null,
    employees int not null,
    is_active TINYINT(1) DEFAULT 1,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active TINYINT(1) DEFAULT 1,
  company_id varchar(255), foreign key(company_id) references tenants(id)
);

drop table users;

-- Country table
CREATE TABLE countries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    country_code VARCHAR(3) NOT NULL UNIQUE COMMENT 'ISO country code (e.g., US, UK, LK)',
    country_name VARCHAR(100) NOT NULL UNIQUE,
    phone_code VARCHAR(5) NOT NULL COMMENT 'International dialing code (e.g., +1, +94)',
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO countries (country_code, country_name, phone_code) VALUES
('US', 'United States', '+1'),
('UK', 'United Kingdom', '+44'),
('CA', 'Canada', '+1'),
('AU', 'Australia', '+61'),
('LK', 'Sri Lanka', '+94'),
('IN', 'India', '+91'),
('DE', 'Germany', '+49'),
('FR', 'France', '+33');

SELECT User, Host FROM mysql.user WHERE User='myapp_user';

CREATE TABLE apartments (
	id VARCHAR(255) primary key,
	apartment_id VARCHAR(255) not null,
    company_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(255),
    floors INT DEFAULT 1,
    houses INT DEFAULT 1 COMMENT 'Total units',    
    picture VARCHAR(255),
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
	id VARCHAR(255) PRIMARY KEY,
    company_id VARCHAR(255),
    apartment_id VARCHAR(255), 
    floor_id VARCHAR(255) NOT NULL,
    house_count INT DEFAULT 1,
    status ENUM('active', 'maintenance','partial') DEFAULT 'active',
	is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE,
    INDEX idx_company_id (company_id),
    INDEX idx_apartment_id (apartment_id)
);
drop table floors;

CREATE TABLE houses(
	id varchar(255) PRIMARY KEY,
    company_id VARCHAR(255),
    apartment_id VARCHAR(255), 
    floor_id varchar(255),
    house_id VARCHAR(255) NOT NULL,
    housetype_id VARCHAR(255) NOT NULL,
	status ENUM('vacant', 'occupied', 'maintenance') DEFAULT 'vacant',
    family_id VARCHAR(255),
    house_owner_id VARCHAR(255),
	is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE,
    FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE CASCADE,
    FOREIGN KEY (house_owner_id) REFERENCES houseowner(id) ON DELETE CASCADE,
    FOREIGN KEY (housetype_id) REFERENCES housetype(id) ON DELETE CASCADE,
    FOREIGN KEY (family_id) REFERENCES family(id) ON DELETE CASCADE,
    INDEX idx_company_id (company_id),
    INDEX idx_apartment_id (apartment_id),
    INDEX idx_floor_id (floor_id)
);

drop table houses;

create table housetype(
	id varchar(255) primary key,
    company_id VARCHAR(255),
    apartment_id VARCHAR(255), 
    name VARCHAR(255) not null,
    members INT not null,
    sqrfeet float not null,
    rooms INT not null,
    bathrooms INT not null,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE
    -- FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE CASCADE
);
drop table housetype;

CREATE TABLE houseowner(
	id varchar(255) primary key,
    company_id varchar(255),
    apartment_id varchar(255),
    name varchar(255) not null,
    NIC varchar(255) not null,
    occupation varchar(255) not null,
    country	varchar(255) not null,
    mobile varchar(100) not null,
    occupied_way ENUM('For rent','own'),
    proof VARCHAR(255),
    
    FOREIGN KEY (company_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE,
    INDEX idx_company_id (company_id),
    INDEX idx_apartment_id (apartment_id)
);
drop table houseowner;

CREATE TABLE family(
	id varchar(255) primary key,
    houseowner_id varchar(255),
    members int not null,
	dob date not null,
    details varchar(255),
    proof varchar(255),
    
    FOREIGN KEY (houseowner_id) REFERENCES houseowner(id) ON DELETE CASCADE,
	INDEX idx_house_owner_id (house_owner_id)
);
drop table family;

SELECT house_owner_id FROM houses WHERE id='9317256h4q';
