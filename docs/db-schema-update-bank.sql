-- Este script crea y inicializa la billetera del sistema (banco central) para VTC.

-- 1. Crear la tabla `system_wallet`
-- Esta tabla contendrá los balances de las monedas del sistema.
CREATE TABLE IF NOT EXISTS `system_wallet` (
  `currency_symbol` VARCHAR(10) NOT NULL PRIMARY KEY,
  `total_supply` DECIMAL(20, 8) NOT NULL DEFAULT 0.00000000,
  `uncirculated_balance` DECIMAL(20, 8) NOT NULL DEFAULT 0.00000000,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Insertar la billetera para Viltrum Coin (VTC) si no existe.
-- Se asume un suministro total de 500,000 VTC, que inicialmente está todo sin circular.
INSERT INTO `system_wallet` (`currency_symbol`, `total_supply`, `uncirculated_balance`)
VALUES ('VTC', 500000.00, 500000.00)
ON DUPLICATE KEY UPDATE
  -- Si ya existe, no hacemos nada para evitar sobreescribir el balance actual.
  currency_symbol = currency_symbol;

-- Instrucciones:
-- 1. Conéctate a tu base de datos MySQL.
-- 2. Ejecuta el contenido de este archivo.
-- Esto preparará la base de datos para la nueva lógica de economía de la aplicación.
