-- ---
-- Estructura de la base de datos para Viltrum Wallet
-- ---

-- Tabla `users`
-- Almacena la información de los usuarios, credenciales y saldo.
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

-- Tabla `transactions`
-- Registra todas las transacciones de VTC.
CREATE TABLE `transactions` (
  `id` varchar(50) NOT NULL,
  `userId` int(11) NOT NULL,
  `type` enum('top-up','expense','transfer') NOT NULL,
  `amount_vtc` decimal(15,2) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla `recharge_requests`
-- Almacena las solicitudes de recarga de los usuarios.
CREATE TABLE `recharge_requests` (
  `id` varchar(50) NOT NULL,
  `userId` int(11) NOT NULL,
  `amountBs` decimal(15,2) NOT NULL,
  `method` enum('Pago Móvil','Zinli','Binance') NOT NULL,
  `reference` varchar(100) NOT NULL,
  `status` enum('pending','approved','denied') NOT NULL DEFAULT 'pending',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `recharge_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla `store_items`
-- Almacena los productos disponibles en la tienda.
CREATE TABLE `store_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(15,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla `settings`
-- Almacena configuraciones globales de la aplicación.
CREATE TABLE `settings` (
  `setting_key` varchar(50) NOT NULL,
  `setting_value` varchar(255) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ---
-- Datos Iniciales (Opcional)
-- ---

-- Insertar un usuario administrador por defecto
-- Contraseña hasheada para: 'admin123'
INSERT INTO `users` (`id`, `displayName`, `email`, `password`, `role`, `vtc_balance`) VALUES
(1, 'Admin', 'admin@ejemplo.com', '$2a$10$f.5shm/c.G/NSSv5Y6dvs.jJno2aWJ43d4w9a2.YMS2t2d1Udcgky', 'admin', 1000.00);

-- Insertar una tasa de cambio inicial
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('exchange_rate', '36.50');

-- Insertar un par de productos de ejemplo en la tienda
INSERT INTO `store_items` (`id`, `name`, `description`, `price`, `stock`) VALUES
(1, 'Producto de Ejemplo 1', 'Una breve descripción para este increíble producto de canje.', 10.00, 50),
(2, 'Servicio de Ejemplo 2', 'Una descripción para un servicio que puedes obtener con tus VTC.', 25.50, 100);
