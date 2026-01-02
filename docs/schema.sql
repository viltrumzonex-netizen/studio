-- Base de datos: `viltrum-wallet`
--
-- Estructura de la tabla para la tabla `users`
--
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `displayName` VARCHAR(255) NOT NULL,
  `role` ENUM('user','admin') NOT NULL DEFAULT 'user',
  `vtc_balance` DECIMAL(15,4) NOT NULL DEFAULT 0.0000,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de la tabla para la tabla `system_wallet`
--
DROP TABLE IF EXISTS `system_wallet`;
CREATE TABLE `system_wallet` (
  `currency_symbol` VARCHAR(10) NOT NULL,
  `total_supply` DECIMAL(20,4) NOT NULL,
  `uncirculated_balance` DECIMAL(20,4) NOT NULL,
  PRIMARY KEY (`currency_symbol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `system_wallet`
--
INSERT INTO `system_wallet` (`currency_symbol`, `total_supply`, `uncirculated_balance`) VALUES
('VTC', 500000.0000, 500000.0000);

-- --------------------------------------------------------

--
-- Estructura de la tabla para la tabla `recharge_requests`
--
DROP TABLE IF EXISTS `recharge_requests`;
CREATE TABLE `recharge_requests` (
  `id` VARCHAR(255) NOT NULL,
  `userId` INT(11) NOT NULL,
  `amountBs` DECIMAL(15,2) NOT NULL,
  `method` ENUM('Pago Móvil','Zinli','Binance') NOT NULL,
  `reference` VARCHAR(255) NOT NULL,
  `status` ENUM('pending','approved','denied') NOT NULL DEFAULT 'pending',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `recharge_requests_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de la tabla para la tabla `store_items`
--
DROP TABLE IF EXISTS `store_items`;
CREATE TABLE `store_items` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(15,4) NOT NULL,
  `stock` INT(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `store_items`
--
INSERT INTO `store_items` (`id`, `name`, `description`, `price`, `stock`) VALUES
(1, 'Créditos para la Plataforma', 'Un paquete de 50 créditos para usar en diversas funciones de la plataforma.', 50.0000, 1000),
(2, 'Suscripción Premium (1 Mes)', 'Acceso a todas las funciones premium de la aplicación durante 30 días.', 150.0000, 500),
(3, 'Paquete de Stickers Exclusivos', 'Obtén un set de stickers digitales únicos para usar en tus chats.', 25.0000, 2000);

-- --------------------------------------------------------

--
-- Estructura de la tabla para la tabla `transactions`
--
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
  `id` VARCHAR(255) NOT NULL,
  `userId` INT(11) NOT NULL,
  `type` ENUM('top-up','expense') NOT NULL,
  `amount_vtc` DECIMAL(15,4) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Disparadores `transactions`
--
DROP TRIGGER IF EXISTS `after_recharge_approval`;
DELIMITER $$
CREATE TRIGGER `after_recharge_approval` AFTER UPDATE ON `recharge_requests` FOR EACH ROW BEGIN
    IF NEW.status = 'approved' AND OLD.status <> 'approved' THEN
        -- No se inserta aquí. La lógica de transacción se maneja en el API.
        -- Este trigger podría usarse para logs si se quisiera.
    END IF;
END
$$
DELIMITER ;
