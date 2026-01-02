-- Base de datos: `viltrum_db`
--
-- Este script SQL crea toda la estructura de la base de datos necesaria para la aplicación Viltrum Wallet.
-- Ejecútalo en tu cliente de MySQL o en la herramienta de base de datos que prefieras (como phpMyAdmin) para configurar las tablas.

-- --------------------------------------------------------

--
-- Estructura de la tabla para `users`
-- Almacena la información de los usuarios, su rol y su saldo.
--
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `displayName` varchar(255) NOT NULL,
  `vtc_balance` decimal(20,8) NOT NULL DEFAULT 0.00000000,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de la tabla para `system_wallet`
-- Actúa como el "banco central". Almacena el suministro total y el saldo no circulante.
--
CREATE TABLE IF NOT EXISTS `system_wallet` (
  `currency_symbol` varchar(10) NOT NULL,
  `total_supply` decimal(20,8) NOT NULL,
  `uncirculated_balance` decimal(20,8) NOT NULL,
  PRIMARY KEY (`currency_symbol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `system_wallet`
-- Inicializa la billetera del sistema con el suministro total de VTC.
--
INSERT INTO `system_wallet` (`currency_symbol`, `total_supply`, `uncirculated_balance`) VALUES
('VTC', 500000.00000000, 500000.00000000)
ON DUPLICATE KEY UPDATE 
`total_supply` = VALUES(`total_supply`), 
`uncirculated_balance` = VALUES(`uncirculated_balance`);

-- --------------------------------------------------------

--
-- Estructura de la tabla para `recharge_requests`
-- Almacena las solicitudes de recarga pendientes de aprobación por un administrador.
--
CREATE TABLE IF NOT EXISTS `recharge_requests` (
  `id` varchar(255) NOT NULL,
  `userId` int(11) NOT NULL,
  `amountBs` decimal(20,2) NOT NULL,
  `method` varchar(50) NOT NULL,
  `reference` varchar(255) NOT NULL,
  `status` enum('pending','approved','denied') NOT NULL DEFAULT 'pending',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `recharge_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de la tabla para `store_items`
-- Almacena los productos disponibles en la tienda para canjear con VTC.
--
CREATE TABLE IF NOT EXISTS `store_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(20,8) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `store_items`
-- Añade algunos productos de ejemplo a la tienda.
--
INSERT INTO `store_items` (`id`, `name`, `description`, `price`, `stock`, `createdAt`) VALUES
(1, 'Suscripción Premium 1 Mes', 'Acceso a funciones exclusivas durante 30 días.', 10.00000000, 999, '2024-05-22 19:40:48'),
(2, 'Paquete de Stickers', 'Colección de stickers exclusivos para la comunidad.', 5.00000000, 999, '2024-05-22 19:40:48'),
(3/docs/db-schema-update-bank.sql', 'Créditos para la Plataforma', 'Un paquete de 50 créditos para usar en servicios asociados.', 25.00000000, 999, '2024-05-22 19:40:48')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `description`=VALUES(`description`), `price`=VALUES(`price`), `stock`=VALUES(`stock`);

-- --------------------------------------------------------

--
-- Estructura de la tabla para `transactions`
-- Registra todos los movimientos (recargas, gastos) de VTC para cada usuario.
--
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` varchar(255) NOT NULL,
  `userId` int(11) NOT NULL,
  `type` enum('top-up','expense') NOT NULL,
  `amount_vtc` decimal(20,8) NOT NULL,
  `description` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de la tabla para `settings`
-- Almacena configuraciones globales de la aplicación, como la tasa de cambio.
--
CREATE TABLE IF NOT EXISTS `settings` (
  `setting_key` varchar(255) NOT NULL,
  `setting_value` text DEFAULT NULL,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `settings`
-- Inicializa la tasa de cambio por defecto.
--
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('exchange_rate', '36.5')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);