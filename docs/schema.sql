-- SQLBook: Code
-- Active: 1717789997108@@127.0.0.1@3306@viltrum

-- =================================================================
--  VILTRUM WALLET DATABASE SCHEMA
-- =================================================================
-- This script will completely reset the database schema.
-- It is designed to be run multiple times without causing errors.
-- =================================================================

-- Temporarily disable foreign key checks to allow dropping tables in any order without errors.
SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables if they exist, starting with tables that have foreign keys.
DROP TABLE IF EXISTS `transactions`;
DROP TABLE IF EXISTS `recharge_requests`;
DROP TABLE IF EXISTS `store_items`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `system_wallet`;
DROP TABLE IF EXISTS `settings`;


-- =================================================================
--  TABLE CREATION
-- =================================================================

-- Users Table: Stores user information, balance, and role.
CREATE TABLE
    `users` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `email` VARCHAR(255) NOT NULL UNIQUE,
        `password` VARCHAR(255) NOT NULL,
        `displayName` VARCHAR(50) NOT NULL,
        `vtc_balance` DECIMAL(15, 4) NOT NULL DEFAULT 0.0000,
        `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
        `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE = InnoDB;

-- System Wallet Table: Acts as the central bank for the application's currency.
CREATE TABLE
    `system_wallet` (
        `currency_symbol` VARCHAR(10) PRIMARY KEY,
        `total_supply` DECIMAL(20, 4) NOT NULL,
        `uncirculated_balance` DECIMAL(20, 4) NOT NULL
    ) ENGINE = InnoDB;

-- Recharge Requests Table: Tracks user requests to top-up their balance.
CREATE TABLE
    `recharge_requests` (
        `id` VARCHAR(36) PRIMARY KEY,
        `userId` INT NOT NULL,
        `amountBs` DECIMAL(15, 2) NOT NULL,
        `method` VARCHAR(50) NOT NULL,
        `reference` VARCHAR(255) NOT NULL,
        `status` ENUM('pending', 'approved', 'denied') NOT NULL DEFAULT 'pending',
        `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
    ) ENGINE = InnoDB;

-- Store Items Table: Contains products available for purchase with VTC.
CREATE TABLE
    `store_items` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(255) NOT NULL,
        `description` TEXT,
        `price` DECIMAL(15, 4) NOT NULL,
        `stock` INT NOT NULL DEFAULT 0
    ) ENGINE = InnoDB;

-- Transactions Table: Logs all movements of VTC for each user.
CREATE TABLE
    `transactions` (
        `id` VARCHAR(36) PRIMARY KEY,
        `userId` INT NOT NULL,
        `type` ENUM('top-up', 'expense') NOT NULL,
        `amount_vtc` DECIMAL(15, 4) NOT NULL,
        `description` VARCHAR(255),
        `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
    ) ENGINE = InnoDB;

-- Settings Table: For application-wide settings like the exchange rate.
CREATE TABLE
    `settings` (
        `setting_key` VARCHAR(50) PRIMARY KEY,
        `setting_value` VARCHAR(255) NOT NULL
    ) ENGINE = InnoDB;


-- Re-enable foreign key checks after schema creation is complete.
SET FOREIGN_KEY_CHECKS = 1;


-- =================================================================
--  INITIAL DATA SEEDING
-- =================================================================

-- Initialize the system wallet (the bank) with the total supply of VTC.
INSERT INTO
    `system_wallet` (
        `currency_symbol`,
        `total_supply`,
        `uncirculated_balance`
    )
VALUES
    ('VTC', 500000.0000, 500000.0000);

-- Insert some default items into the store.
INSERT INTO
    `store_items` (
        `id`,
        `name`,
        `description`,
        `price`,
        `stock`
    )
VALUES
    (
        1,
        'Créditos para la Plataforma',
        'Un paquete de 50 créditos para usar en servicios dentro de la app.',
        50.0000,
        1000
    ),
    (
        2,
        'Suscripción Premium (1 Mes)',
        'Acceso a todas las funciones premium de la plataforma durante 30 días.',
        100.0000,
        500
    ),
    (
        3,
        'Avatar Exclusivo',
        'Obtén un avatar único para tu perfil que te diferenciará del resto.',
        25.0000,
        2000
    );

-- Insert a default exchange rate into the settings table.
INSERT INTO
    `settings` (`setting_key`, `setting_value`)
VALUES
    ('exchange_rate', '36.50');
