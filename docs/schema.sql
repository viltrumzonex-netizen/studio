-- Base de Datos para Viltrum Wallet App
-- Versión: 1.1
-- Descripción: Script completo para crear todas las tablas necesarias.

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Estructura de la tabla `users`
--
DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `displayName` varchar(255) NOT NULL,
  `vtc_balance` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Estructura de la tabla `system_wallet` (El Banco Central)
--
DROP TABLE IF EXISTS `system_wallet`;
CREATE TABLE IF NOT EXISTS `system_wallet` (
  `currency_symbol` varchar(10) NOT NULL,
  `total_supply` decimal(20,4) NOT NULL,
  `uncirculated_balance` decimal(20,4) NOT NULL,
  PRIMARY KEY (`currency_symbol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `system_wallet`
--
DELETE FROM `system_wallet`;
INSERT INTO `system_wallet` (`currency_symbol`, `total_supply`, `uncirculated_balance`) VALUES
('VTC', 500000.0000, 500000.0000);

--
-- Estructura de la tabla `recharge_requests`
--
DROP TABLE IF EXISTS `recharge_requests`;
CREATE TABLE IF NOT EXISTS `recharge_requests` (
  `id` varchar(36) NOT NULL,
  `userId` int(11) NOT NULL,
  `amountBs` decimal(15,2) NOT NULL,
  `method` enum('Pago Móvil','Zinli','Binance') NOT NULL,
  `reference` varchar(255) NOT NULL,
  `status` enum('pending','approved','denied') NOT NULL DEFAULT 'pending',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `userId_recharge` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Estructura de la tabla `store_items`
--
DROP TABLE IF EXISTS `store_items`;
CREATE TABLE IF NOT EXISTS `store_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `store_items`
--
DELETE FROM `store_items`;
INSERT INTO `store_items` (`id`, `name`, `description`, `price`, `stock`) VALUES
(1, 'Créditos para la Plataforma', 'Un paquete de 50 créditos para usar en servicios dentro de la plataforma.', 10.00, 100),
(2, 'Suscripción Premium (1 Mes)', 'Acceso a todas las funciones premium de la aplicación durante un mes.', 25.00, 50),
(3, 'Avatar Exclusivo', 'Obtén un avatar único y exclusivo para tu perfil que nadie más tiene.', 5.00, 200);

--
-- Estructura de la tabla `transactions`
--
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` varchar(36) NOT NULL,
  `userId` int(11) NOT NULL,
  `type` enum('top-up','expense') NOT NULL,
  `amount_vtc` decimal(15,4) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `userId_transaction` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Estructura de la tabla `settings`
--
DROP TABLE IF EXISTS `settings`;
CREATE TABLE IF NOT EXISTS `settings` (
  `setting_key` varchar(50) NOT NULL,
  `setting_value` varchar(255) NOT NULL,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `settings`
--
DELETE FROM `settings`;
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('exchange_rate', '36.50');


--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `recharge_requests`
--
ALTER TABLE `recharge_requests`
  ADD CONSTRAINT `userId_recharge` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `userId_transaction` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
