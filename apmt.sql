-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Oct 14, 2025 at 07:16 AM
-- Server version: 8.0.36-28
-- PHP Version: 8.1.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `apmt`
--

-- --------------------------------------------------------

--
-- Table structure for table `apartments`
--

CREATE TABLE `apartments` (
  `id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `apartment_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `company_id` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `city` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `floors` int DEFAULT '1',
  `houses` int DEFAULT '1' COMMENT 'Total units',
  `picture` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `apartments`
--

INSERT INTO `apartments` (`id`, `apartment_id`, `company_id`, `name`, `address`, `city`, `floors`, `houses`, `picture`, `is_active`, `created_at`, `updated_at`) VALUES
('30ca5a677b', 'A002', '45d2fcb450', 'DEF', 'Nittambuwa', 'Gampaha', 1, 1, '/uploads/images/apartment-1758523557795-476845002.jpeg', 1, '2025-09-22 06:45:57', '2025-09-24 14:16:27'),
('7617254a6a', 'A001', '45d2fcb450', 'ABC', 'Bandarawela', 'Bandarawela', 1, 1, '/uploads/images/apartment-1758521720147-439337632.jpg', 1, '2025-09-22 06:14:02', '2025-09-22 06:15:20'),
('99e7d41f29', 'A001', 'bdb29090c7', 'Cinnamon Residance', 'Nittambuwa', 'Gampaha', 1, 1, '/uploads/images/apartment-1758521448468-471383340.jpeg', 1, '2025-09-22 06:10:48', '2025-09-26 02:28:30'),
('b45385fa7f', 'A003', '45d2fcb450', 'Cinnamon Residance', 'Wellawatta', 'Colombo', 1, 1, '/uploads/images/apartment-1758724006374-899633801.jpeg', 1, '2025-09-24 14:26:46', '2025-09-24 17:08:34'),
('cc75b02a38', 'A002', 'bdb29090c7', 'Home Lands', 'Wellawatta', 'Colombo', 1, 1, '/uploads/images/apartment-1758521551867-602935387.jpg', 1, '2025-09-22 06:12:31', '2025-09-22 06:12:31'),
('ea73f661ec', 'A002', 'bdb29090c7', 'ABC', 'Ratnapura', 'Ratnapura', 1, 1, '/uploads/images/apartment-1758853183400-607748472.jpg', 1, '2025-09-26 02:19:10', '2025-09-26 02:19:43');

-- --------------------------------------------------------

--
-- Table structure for table `countries`
--

CREATE TABLE `countries` (
  `id` int NOT NULL,
  `country_code` varchar(3) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'ISO country code (e.g., US, UK, LK)',
  `country_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `phone_code` varchar(5) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'International dialing code (e.g., +1, +94)',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `countries`
--

INSERT INTO `countries` (`id`, `country_code`, `country_name`, `phone_code`, `is_active`, `created_at`) VALUES
(1, 'US', 'United States', '+1', 1, '2025-09-19 09:16:53'),
(2, 'UK', 'United Kingdom', '+44', 1, '2025-09-19 09:16:53'),
(3, 'CA', 'Canada', '+1', 1, '2025-09-19 09:16:53'),
(4, 'AU', 'Australia', '+61', 1, '2025-09-19 09:16:53'),
(5, 'LK', 'Sri Lanka', '+94', 1, '2025-09-19 09:16:53'),
(6, 'IN', 'India', '+91', 1, '2025-09-19 09:16:53'),
(7, 'DE', 'Germany', '+49', 1, '2025-09-19 09:16:53'),
(8, 'FR', 'France', '+33', 1, '2025-09-19 09:16:53');

-- --------------------------------------------------------

--
-- Table structure for table `floors`
--

CREATE TABLE `floors` (
  `id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `company_id` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `apartment_id` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `floor_id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `house_count` int DEFAULT '1',
  `status` enum('active','maintenance','partial') COLLATE utf8mb4_general_ci DEFAULT 'active',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `floors`
--

INSERT INTO `floors` (`id`, `company_id`, `apartment_id`, `floor_id`, `house_count`, `status`, `is_active`, `created_at`, `updated_at`) VALUES
('0408ddebcc', 'bdb29090c7', '99e7d41f29', 'F2', NULL, 'active', 1, '2025-09-26 17:13:57', '2025-09-26 17:13:57'),
('08a3f46565', 'bdb29090c7', '99e7d41f29', 'F1', NULL, 'maintenance', 1, '2025-09-26 17:13:57', '2025-10-06 17:41:00'),
('0cf2bc2e0a', 'bdb29090c7', '99e7d41f29', 'F3', NULL, 'active', 0, '2025-09-26 14:45:20', '2025-10-13 17:37:56'),
('0ef36d01a6', 'bdb29090c7', 'cc75b02a38', 'F4', NULL, 'active', 1, '2025-10-02 15:04:24', '2025-10-02 15:04:24'),
('2f845824e7', 'bdb29090c7', 'cc75b02a38', 'F3', 10, 'active', 1, '2025-09-25 12:31:21', '2025-09-25 12:43:47'),
('2f845874e7', 'bdb29090c7', 'cc75b02a38', 'F2', 1, 'active', 1, '2025-09-25 12:36:30', '2025-09-25 12:43:20'),
('34896eb872', 'bdb29090c7', 'cc75b02a38', 'F10', NULL, 'active', 1, '2025-10-03 09:43:09', '2025-10-03 09:43:09'),
('58025a20f2', 'bdb29090c7', 'ea73f661ec', 'F2', NULL, 'active', 1, '2025-09-30 13:56:26', '2025-09-30 13:56:26'),
('84154a9b4b', 'bdb29090c7', 'ea73f661ec', 'F1', NULL, 'active', 1, '2025-09-30 13:56:26', '2025-09-30 13:56:26'),
('a4a12a4d04', 'bdb29090c7', 'cc75b02a38', 'F7', NULL, 'active', 1, '2025-10-02 15:07:00', '2025-10-02 15:07:00'),
('b1c4f42f32', 'bdb29090c7', 'cc75b02a38', 'F5', NULL, 'active', 1, '2025-10-02 15:07:00', '2025-10-02 15:07:00'),
('c91af445c4', 'bdb29090c7', 'ea73f661ec', 'F3', NULL, 'active', 1, '2025-09-30 13:56:26', '2025-09-30 13:56:26'),
('cebe3de040', 'bdb29090c7', 'cc75b02a38', 'F6', NULL, 'active', 1, '2025-10-02 15:07:00', '2025-10-02 15:07:00'),
('dce8e6ee4c', 'bdb29090c7', 'cc75b02a38', 'F8', NULL, 'active', 1, '2025-10-03 06:19:30', '2025-10-03 09:42:54'),
('f4afe5e7f0', 'bdb29090c7', 'cc75b02a38', 'F9', NULL, 'active', 1, '2025-10-03 09:43:09', '2025-10-03 09:43:09');

-- --------------------------------------------------------

--
-- Table structure for table `housetype`
--

CREATE TABLE `housetype` (
  `id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `company_id` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `apartment_id` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `members` int NOT NULL,
  `sqrfeet` float NOT NULL,
  `rooms` int NOT NULL,
  `bathrooms` int NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `housetype`
--

INSERT INTO `housetype` (`id`, `company_id`, `apartment_id`, `name`, `members`, `sqrfeet`, `rooms`, `bathrooms`, `is_active`, `created_at`) VALUES
('0bad50f8fb', 'bdb29090c7', '99e7d41f29', 'Type 03', 5, 850, 4, 3, 1, '2025-10-10 04:14:48'),
('439e761634', 'bdb29090c7', '99e7d41f29', 'Type 01', 2, 500, 3, 2, 1, '2025-10-08 03:21:48'),
('8d06035ae4', 'bdb29090c7', '99e7d41f29', 'Type 02', 3, 600, 2, 2, 1, '2025-10-08 03:39:52'),
('f98edfcbda', 'bdb29090c7', '99e7d41f29', 'Couple room', 2, 500, 2, 3, 0, '2025-10-13 15:10:07');

-- --------------------------------------------------------

--
-- Table structure for table `tenants`
--

CREATE TABLE `tenants` (
  `id` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `regNo` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `employees` int NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tenants`
--

INSERT INTO `tenants` (`id`, `regNo`, `name`, `address`, `employees`, `is_active`, `createdAt`) VALUES
('2f845834e7', 'c002', 'ABC', 'com', 10, 1, '2025-09-21 04:04:01'),
('3b8d1b98af', 'c001', 'Rana', 'Colombo', 10, 1, '2025-09-21 03:49:59'),
('45d2fcb450', 'C004', 'XYZ', 'Wellawatta road, Colombo', 80, 1, '2025-09-22 05:24:54'),
('bdb29090c7', 'c003', 'ABC', 'com', 10, 1, '2025-09-21 04:06:39'),
('eb573d832c', 'C005', 'XYZ', 'Colombo', 50, 1, '2025-09-24 14:24:58');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `firstname` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `lastname` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `country` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `mobile` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `verification_token_hash` varchar(128) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `verification_token_expires` datetime DEFAULT NULL,
  `refresh_token` text COLLATE utf8mb4_general_ci,
  `role` varchar(30) COLLATE utf8mb4_general_ci DEFAULT 'admin',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1',
  `company_id` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `firstname`, `lastname`, `country`, `mobile`, `email`, `password_hash`, `is_verified`, `verification_token_hash`, `verification_token_expires`, `refresh_token`, `role`, `created_at`, `is_active`, `company_id`) VALUES
(1, 'Madhusha', 'Thiyagaraja', 't', '0762260045', 'info@admin1.com', '$2b$12$rcU.nMikzUaxFCDNWY7a8exgBPPjNC1LHmYVOf.5iNgl9vreWS7Vq', 1, NULL, NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzYwNDE1NDIxLCJleHAiOjE3NjEwMjAyMjF9.6P-3tusJg3MBovbUtJ03a_4gVjewnMDzQjvyExAzi18', 'admin', '2025-09-21 04:06:39', 1, 'bdb29090c7'),
(2, 'Sasikala', 'Thiyagaraja', 'Sri Lanka', '+94 762260045', 'info@ad1c4.com', '$2b$12$KtgjAeFZGNFQS77muQZoyeYTKwauJJ4iFy0uMF3ZP.FXQwvuiU3TO', 1, NULL, NULL, NULL, 'admin', '2025-09-22 05:24:55', 1, '45d2fcb450'),
(3, 'Madhusha', 'Thiyagaraja', 'Sri Lanka', '+94 762260045', 'info@ad1c5.com', '$2b$12$po/hDdWsfgClpHDiSMbtUOVmSGREpjUy/n34t0JT3TI1h8fk.lrcC', 0, '4b400a0ab8bb79a873dde841551337e1061be368ee45ab690c63daeb5096e27c', '2025-09-25 19:54:58', NULL, 'admin', '2025-09-24 14:24:58', 1, 'eb573d832c');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `apartments`
--
ALTER TABLE `apartments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_company_id` (`company_id`),
  ADD KEY `idx_city` (`city`);

--
-- Indexes for table `countries`
--
ALTER TABLE `countries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `country_code` (`country_code`),
  ADD UNIQUE KEY `country_name` (`country_name`);

--
-- Indexes for table `floors`
--
ALTER TABLE `floors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_company_id` (`company_id`),
  ADD KEY `idx_apartment_id` (`apartment_id`);

--
-- Indexes for table `housetype`
--
ALTER TABLE `housetype`
  ADD PRIMARY KEY (`id`),
  ADD KEY `company_id` (`company_id`),
  ADD KEY `apartment_id` (`apartment_id`);

--
-- Indexes for table `tenants`
--
ALTER TABLE `tenants`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `company_id` (`company_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `countries`
--
ALTER TABLE `countries`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `apartments`
--
ALTER TABLE `apartments`
  ADD CONSTRAINT `apartments_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `floors`
--
ALTER TABLE `floors`
  ADD CONSTRAINT `floors_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `floors_ibfk_2` FOREIGN KEY (`apartment_id`) REFERENCES `apartments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `housetype`
--
ALTER TABLE `housetype`
  ADD CONSTRAINT `housetype_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `housetype_ibfk_2` FOREIGN KEY (`apartment_id`) REFERENCES `apartments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `tenants` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
