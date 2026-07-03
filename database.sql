CREATE DATABASE IF NOT EXISTS `mwstore`;
USE `mwstore`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `items` (
  `id` VARCHAR(50) PRIMARY KEY,
  `sku` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `minStock` INT NOT NULL DEFAULT 0,
  `unit` VARCHAR(50) NOT NULL,
  `purchasePrice` DECIMAL(12, 2) NOT NULL DEFAULT 0,
  `sellingPrice` DECIMAL(12, 2) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `purchase_history` (
  `id` VARCHAR(50) PRIMARY KEY,
  `itemId` VARCHAR(50) NOT NULL,
  `date` VARCHAR(20) NOT NULL,
  `price` DECIMAL(12, 2) NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `qty` INT NOT NULL,
  FOREIGN KEY (`itemId`) REFERENCES `items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `transactions` (
  `id` VARCHAR(50) PRIMARY KEY,
  `invoiceId` VARCHAR(50),
  `date` VARCHAR(20) NOT NULL,
  `type` VARCHAR(20) NOT NULL,
  `itemId` VARCHAR(50),
  `itemName` VARCHAR(255) NOT NULL,
  `qty` INT NOT NULL,
  `price` DECIMAL(12, 2) NOT NULL,
  `total` DECIMAL(12, 2) NOT NULL,
  `location` VARCHAR(255),
  `notes` TEXT,
  `customer` VARCHAR(255),
  `paymentStatus` VARCHAR(50),
  `amountPaid` DECIMAL(12, 2) DEFAULT 0,
  `debt` DECIMAL(12, 2) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `contacts` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `address` TEXT NOT NULL,
  `type` VARCHAR(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `debts` (
  `id` VARCHAR(50) PRIMARY KEY,
  `invoiceId` VARCHAR(50),
  `txId` VARCHAR(50) NOT NULL,
  `date` VARCHAR(20) NOT NULL,
  `customer` VARCHAR(255) NOT NULL,
  `total` DECIMAL(12, 2) NOT NULL,
  `paid` DECIMAL(12, 2) NOT NULL,
  `remaining` DECIMAL(12, 2) NOT NULL,
  `payments` TEXT NOT NULL,
  `status` VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `users` (`id`, `username`, `password`) VALUES
('user-admin', 'admin', '24075307a160a5b9cb48a7166788ec9846b4129528859f039a7a00f2771d9857')
ON DUPLICATE KEY UPDATE `id`=`id`;

INSERT INTO `items` (`id`, `sku`, `name`, `category`, `stock`, `minStock`, `unit`, `purchasePrice`, `sellingPrice`) VALUES
('item-1', 'TP-001', 'Tepung Lencana', 'Tepung', 8, 2, 'karung', 190000.00, 210000.00),
('item-2', 'TP-002', 'Tepung Segitiga Biru', 'Tepung', 4, 2, 'karung', 225000.00, 250000.00),
('item-3', 'GL-001', 'Gula GPM', 'Gula', 2, 1, 'karung', 834000.00, 900000.00),
('item-4', 'GL-002', 'Gula Mint', 'Gula', 2, 1, 'karung', 375000.00, 410000.00),
('item-5', 'CP-001', 'Cup Gelas (Starindo 12)', 'Cup Gelas', 57, 10, 'roll', 12750.00, 15000.00),
('item-6', 'CP-002', 'Cup Bold 200ml', 'Cup Gelas', 25, 5, 'roll', 17500.00, 20000.00),
('item-7', 'CP-003', 'Cup Puding 60ml', 'Cup Gelas', 30, 5, 'roll', 5000.00, 6500.00),
('item-8', 'MG-001', 'Margarin Amanda 18kg', 'Margarin', 18, 5, 'kg', 18600.00, 21000.00),
('item-9', 'TP-003', 'Tepung Panir', 'Tepung', 36, 5, 'kg', 15800.00, 18000.00),
('item-10', 'TP-004', 'Tepung Maizena', 'Tepung', 22, 5, 'kg', 14200.00, 16500.00),
('item-11', 'SS-001', 'Susu UHT', 'Susu', 35, 5, 'kotak', 22500.00, 26000.00)
ON DUPLICATE KEY UPDATE `id`=`id`;

INSERT INTO `purchase_history` (`id`, `itemId`, `date`, `price`, `location`, `qty`) VALUES
('ph-1', 'item-1', '2026-07-02', 190000.00, 'Toko Sumber Harian', 8),
('ph-2', 'item-2', '2026-07-02', 225000.00, 'Toko Sumber Harian', 4),
('ph-3', 'item-3', '2026-07-02', 834000.00, 'Toko Sumber Harian', 2),
('ph-4', 'item-4', '2026-07-02', 375000.00, 'Toko Aan Guci', 2),
('ph-5', 'item-5', '2026-07-02', 12750.00, 'Toko Aroma', 57),
('ph-6', 'item-6', '2026-07-02', 17500.00, 'Toko Indah Plastik', 25),
('ph-7', 'item-7', '2026-07-02', 5000.00, 'Toko Indah Plastik', 30),
('ph-8', 'item-8', '2026-07-02', 18600.00, 'Toko Sumber Harian', 18),
('ph-9', 'item-9', '2026-07-02', 15800.00, 'Toko Aroma', 36),
('ph-10', 'item-10', '2026-07-02', 14200.00, 'Toko Aroma', 22),
('ph-11', 'item-11', '2026-07-02', 22500.00, 'Toko MP Harian', 35)
ON DUPLICATE KEY UPDATE `id`=`id`;

INSERT INTO `transactions` (`id`, `date`, `type`, `itemId`, `itemName`, `qty`, `price`, `total`, `location`, `notes`) VALUES
('tx-1', '2026-07-02', 'masuk', 'item-1', 'Tepung Lencana', 8, 190000.00, 1520000.00, 'Toko Sumber Harian', 'Restock Tepung Lencana (8 karung)'),
('tx-2', '2026-07-02', 'masuk', 'item-2', 'Tepung Segitiga Biru', 4, 225000.00, 900000.00, 'Toko Sumber Harian', 'Restock Tepung Segitiga Biru (4 karung)'),
('tx-3', '2026-07-02', 'masuk', 'item-3', 'Gula GPM', 2, 834000.00, 1668000.00, 'Toko Sumber Harian', 'Restock Gula GPM (2 karung)'),
('tx-4', '2026-07-02', 'masuk', 'item-4', 'Gula Mint', 2, 375000.00, 750000.00, 'Toko Aan Guci', 'Restock Gula Mint (2 karung)'),
('tx-5', '2026-07-02', 'masuk', 'item-5', 'Cup Gelas (Starindo 12)', 57, 12750.00, 726750.00, 'Toko Aroma', 'Restock Cup Gelas (Starindo 12) (57 roll)'),
('tx-6', '2026-07-02', 'masuk', 'item-6', 'Cup Bold 200ml', 25, 17500.00, 437500.00, 'Toko Indah Plastik', 'Restock Cup Bold 200ml (25 roll)'),
('tx-7', '2026-07-02', 'masuk', 'item-7', 'Cup Puding 60ml', 30, 5000.00, 150000.00, 'Toko Indah Plastik', 'Restock Cup Puding 60ml (30 roll)'),
('tx-8', '2026-07-02', 'masuk', 'item-8', 'Margarin Amanda 18kg', 18, 18600.00, 334800.00, 'Toko Sumber Harian', 'Restock Margarin Amanda (18 kg)'),
('tx-9', '2026-07-02', 'masuk', 'item-9', 'Tepung Panir', 36, 15800.00, 568800.00, 'Toko Aroma', 'Restock Tepung Panir (36 kg)'),
('tx-10', '2026-07-02', 'masuk', 'item-10', 'Tepung Maizena', 22, 14200.00, 312400.00, 'Toko Aroma', 'Restock Tepung Maizena (22 kg)'),
('tx-11', '2026-07-02', 'masuk', 'item-11', 'Susu UHT', 35, 22500.00, 787500.00, 'Toko MP Harian', 'Restock Susu UHT (35 kotak)')
ON DUPLICATE KEY UPDATE `id`=`id`;

INSERT INTO `contacts` (`id`, `name`, `phone`, `address`, `type`) VALUES
('contact-1', 'Toko Sumber Harian', '081234560001', 'Pasar Harian Baru', 'supplier'),
('contact-2', 'Toko Aan Guci', '081234560002', 'Komp. Aan Guci', 'supplier'),
('contact-3', 'Toko Aroma', '081234560003', 'Komp. Aroma Indah', 'supplier'),
('contact-4', 'Toko Indah Plastik', '081234560004', 'Kawasan Plastik Terpadu', 'supplier'),
('contact-5', 'Toko MP Harian', '081234560005', 'Ruko MP Harian Baru', 'supplier')
ON DUPLICATE KEY UPDATE `id`=`id`;
