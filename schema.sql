-- ---
-- Estructura de la base de datos para Viltrum Wallet
-- Versión 3: Incluye DROP TABLE e inserción de admin.
-- ---

-- Eliminar tablas si existen para una instalación limpia
DROP TABLE IF EXISTS `transactions`;
DROP TABLE IF EXISTS `recharge_requests`;
DROP TABLE IF EXISTS `store_items`;
DROP TABLE IF EXISTS `settings`;
DROP TABLE IF EXISTS `users`;


-- ---
-- Tabla `users`
-- Almacena la información de los usuarios, credenciales y saldo.
-- ---
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `displayName` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `vtc_balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ---
-- Tabla `transactions`
-- Registra todos los movimientos de VTC de los usuarios.
-- ---
CREATE TABLE `transactions` (
  `id` varchar(255) NOT NULL,
  `userId` int(11) NOT NULL,
  `type` enum('top-up','expense') NOT NULL,
  `amount_vtc` decimal(15,2) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ---
-- Tabla `recharge_requests`
-- Almacena las solicitudes de recarga de saldo pendientes de aprobación.
-- ---
CREATE TABLE `recharge_requests` (
  `id` varchar(255) NOT NULL,
  `userId` int(11) NOT NULL,
  `amountBs` decimal(15,2) NOT NULL,
  `method` varchar(50) NOT NULL,
  `reference` varchar(100) NOT NULL,
  `status` enum('pending','approved','denied') NOT NULL DEFAULT 'pending',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `recharge_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ---
-- Tabla `store_items`
-- Contiene los productos disponibles para canjear en la tienda.
-- ---
CREATE TABLE `store_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ---
-- Tabla `settings`
-- Almacena configuraciones globales de la aplicación, como la tasa de cambio.
-- ---
CREATE TABLE `settings` (
  `setting_key` varchar(50) NOT NULL,
  `setting_value` varchar(255) NOT NULL,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ---
-- Inserción de datos iniciales
-- ---

-- Insertar usuario administrador
-- Contraseña: admin123
INSERT INTO `users` (`id`, `displayName`, `email`, `password`, `role`, `vtc_balance`) VALUES
(1, 'Admin', 'admin@ejemplo.com', '$2a$10$f.5shm/c.G/NSSv5Y6dvs.jJno2aWJ43d4w9a2.YMS2t2d1Udcgky', 'admin', 1000.00);

-- Insertar tasa de cambio inicial
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('exchange_rate', '36.50');

-- Insertar productos de ejemplo para la tienda
INSERT INTO `store_items` (`id`, `name`, `description`, `price`, `stock`) VALUES
(1, 'Suscripción Premium 1 Mes', 'Acceso a funciones exclusivas durante 30 días.', 150.00, 100),
(2, 'Paquete de Avatares Neón', 'Personaliza tu perfil con un set de avatares de estilo neón.', 50.00, 200),
(3, 'Créditos para la Plataforma', 'Un paquete de 1000 créditos para usar en servicios asociados.', 250.00, 50);
