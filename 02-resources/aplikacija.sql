/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

DROP DATABASE IF EXISTS `aplikacija`;
CREATE DATABASE IF NOT EXISTS `aplikacija` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `aplikacija`;

DROP TABLE IF EXISTS `administrator`;
CREATE TABLE IF NOT EXISTS `administrator` (
  `administrator_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) unsigned NOT NULL DEFAULT 1,
  PRIMARY KEY (`administrator_id`),
  UNIQUE KEY `uq_administrator_username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!40000 ALTER TABLE `administrator` DISABLE KEYS */;
INSERT INTO `administrator` (`administrator_id`, `username`, `password_hash`, `is_active`) VALUES
	(1, 'mtair', '$2b$11$BlWgwJPoeXGfyZNOYwZfIOlwOpR.fMYBQDtxqDCYPZW8VSrZoU99O', 1);
/*!40000 ALTER TABLE `administrator` ENABLE KEYS */;

DROP TABLE IF EXISTS `article`;
CREATE TABLE IF NOT EXISTS `article` (
  `article_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `title` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `excerpt` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) unsigned NOT NULL DEFAULT 1,
  `is_promoted` tinyint(1) unsigned NOT NULL DEFAULT 0,
  `category_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`article_id`),
  UNIQUE KEY `uq_article_title` (`title`),
  KEY `fk_article_category_id` (`category_id`),
  CONSTRAINT `fk_article_category_id` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!40000 ALTER TABLE `article` DISABLE KEYS */;
INSERT INTO `article` (`article_id`, `created_at`, `title`, `excerpt`, `description`, `is_active`, `is_promoted`, `category_id`) VALUES
	(16, '2021-05-19 17:10:35', 'HDD 1', 'Ovo je kratak opis diska...', 'Ovo je detaljan opis diska...   ', 1, 1, 5),
	(17, '2021-05-19 17:11:36', 'MB 111', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.\r\nDuis vulputate vestibulum pretium.', 'Maecenas fringilla lacus nec vehicula tempor. Mauris malesuada dui lorem, quis suscipit eros aliquet et. Pellentesque nunc orci, congue sit amet velit et, eleifend imperdiet urna. Sed at interdum lorem. Aliquam consectetur rutrum massa sed dignissim. Duis posuere, metus sed imperdiet ullamcorper, purus sem mollis tellus, quis euismod nibh lectus sit amet nunc. Aliquam erat volutpat. Sed diam ipsum, vulputate in ante ac, fringilla viverra urna. Aenean vulputate efficitur tempus. Etiam quis velit nec sapien feugiat semper a quis magna. Suspendisse cursus dapibus libero, vel suscipit ex.', 1, 1, 3),
	(18, '2021-05-28 12:56:35', 'MB 11232', 'Ovo je kratak opis mp...', 'Ovo je detaljan opis mp...   ', 1, 1, 3),
	(19, '2021-05-28 12:57:09', 'MB 536346', 'Ovo je kratak opis mp...', 'Ovo je detaljan opis mp...   ', 1, 1, 3),
	(20, '2021-05-28 12:57:31', 'MB 54rggrgdf', 'Ovo je kratak opis mp...', 'Ovo je detaljan opis mp...   ', 1, 1, 3);
/*!40000 ALTER TABLE `article` ENABLE KEYS */;

DROP TABLE IF EXISTS `article_feature`;
CREATE TABLE IF NOT EXISTS `article_feature` (
  `article_feature_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `value` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `article_id` int(10) unsigned NOT NULL,
  `feature_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`article_feature_id`),
  UNIQUE KEY `uq_article_feature_article_id_feature_id` (`article_id`,`feature_id`),
  KEY `fk_article_feature_feature_id` (`feature_id`),
  CONSTRAINT `fk_article_feature_article_id` FOREIGN KEY (`article_id`) REFERENCES `article` (`article_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_article_feature_feature_id` FOREIGN KEY (`feature_id`) REFERENCES `feature` (`feature_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!40000 ALTER TABLE `article_feature` DISABLE KEYS */;
INSERT INTO `article_feature` (`article_feature_id`, `value`, `article_id`, `feature_id`) VALUES
	(48, '1TB', 16, 1),
	(49, '3.5"', 16, 2),
	(50, 'SATA 3.0', 16, 3),
	(51, 'SAGA', 17, 4),
	(52, 'MB44', 17, 5),
	(53, 'SAGA', 18, 4),
	(54, 'MB44', 18, 5),
	(55, 'SAGA', 19, 4),
	(56, 'MB432', 19, 5),
	(57, 'SAGA', 20, 4),
	(58, 'MB666', 20, 5);
/*!40000 ALTER TABLE `article_feature` ENABLE KEYS */;

DROP TABLE IF EXISTS `article_price`;
CREATE TABLE IF NOT EXISTS `article_price` (
  `article_price_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `price` decimal(10,2) unsigned NOT NULL,
  `article_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`article_price_id`),
  KEY `fk_article_price_article_id` (`article_id`),
  CONSTRAINT `fk_article_price_article_id` FOREIGN KEY (`article_id`) REFERENCES `article` (`article_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!40000 ALTER TABLE `article_price` DISABLE KEYS */;
INSERT INTO `article_price` (`article_price_id`, `created_at`, `price`, `article_id`) VALUES
	(14, '2021-05-19 17:10:35', 59.90, 16),
	(15, '2021-05-19 17:11:36', 39.90, 17),
	(16, '2021-05-28 12:56:35', 49.90, 18),
	(17, '2021-05-28 12:57:09', 19.91, 19),
	(18, '2021-05-28 12:57:31', 99.99, 20);
/*!40000 ALTER TABLE `article_price` ENABLE KEYS */;

DROP TABLE IF EXISTS `cart`;
CREATE TABLE IF NOT EXISTS `cart` (
  `cart_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`cart_id`),
  KEY `fk_cart_user_id` (`user_id`),
  CONSTRAINT `fk_cart_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
INSERT INTO `cart` (`cart_id`, `created_at`, `user_id`) VALUES
	(7, '2021-05-24 15:46:48', 6),
	(8, '2021-05-24 16:27:25', 6),
	(9, '2021-06-02 17:20:21', 6),
	(10, '2021-06-02 17:22:44', 6);
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;

DROP TABLE IF EXISTS `cart_article`;
CREATE TABLE IF NOT EXISTS `cart_article` (
  `cart_article_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `quantity` int(10) unsigned NOT NULL,
  `cart_id` int(10) unsigned NOT NULL,
  `article_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`cart_article_id`),
  UNIQUE KEY `uq_cart_article_cart_id_article_id` (`cart_id`,`article_id`),
  KEY `fk_cart_article_article_id` (`article_id`),
  CONSTRAINT `fk_cart_article_article_id` FOREIGN KEY (`article_id`) REFERENCES `article` (`article_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_cart_article_cart_id` FOREIGN KEY (`cart_id`) REFERENCES `cart` (`cart_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!40000 ALTER TABLE `cart_article` DISABLE KEYS */;
INSERT INTO `cart_article` (`cart_article_id`, `quantity`, `cart_id`, `article_id`) VALUES
	(1, 5, 7, 16),
	(3, 1, 7, 17),
	(5, 1, 8, 18),
	(9, 2, 8, 17),
	(10, 2, 9, 17);
/*!40000 ALTER TABLE `cart_article` ENABLE KEYS */;

DROP TABLE IF EXISTS `category`;
CREATE TABLE IF NOT EXISTS `category` (
  `category_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent__category_id` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `uq_category_name` (`name`),
  KEY `fk_category_parent__category_id` (`parent__category_id`),
  CONSTRAINT `fk_category_parent__category_id` FOREIGN KEY (`parent__category_id`) REFERENCES `category` (`category_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` (`category_id`, `name`, `image_path`, `parent__category_id`) VALUES
	(1, 'Računarske komponente', '/static/categories/pc.png', NULL),
	(2, 'Računarski softver', '/static/categories/cd.png', NULL),
	(3, 'Matične poloče', '/static/categories/mb.jpg', 1),
	(4, 'Hard diskovi', '/static/categories/hdd.jpg', 1),
	(5, 'Magnetni diskovi', '/static/categories/hdd-classic.png', 4),
	(6, 'SSD diskovi', '/static/categories/hdd-ssd.png', 4),
	(7, 'M2 diskovi', '/static/categories/hdd-m2.png', 4),
	(8, 'Aplikacije', '/static/categories/apps.png', 2),
	(9, 'Video igre', '/static/categories/games.png', 2),
	(10, 'Operativni sistemi', '/static/categories/os.png', 2),
	(15, 'Video igre za konzole', 'http://slike.com/cat/konzole.png', 9);
/*!40000 ALTER TABLE `category` ENABLE KEYS */;

DROP TABLE IF EXISTS `feature`;
CREATE TABLE IF NOT EXISTS `feature` (
  `feature_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`feature_id`),
  UNIQUE KEY `uq_feature_name_category_id` (`name`,`category_id`),
  KEY `fk_feature_category_id` (`category_id`),
  CONSTRAINT `fk_feature_category_id` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!40000 ALTER TABLE `feature` DISABLE KEYS */;
INSERT INTO `feature` (`feature_id`, `name`, `category_id`) VALUES
	(2, 'Dimenzije', 4),
	(8, 'Godina izdanja', 2),
	(1, 'Kapacitet (GB)', 4),
	(5, 'Model', 1),
	(7, 'Produkciona kuća', 2),
	(4, 'Proizvođač', 1),
	(6, 'Tehnologija', 6),
	(3, 'Tip konektora', 4);
/*!40000 ALTER TABLE `feature` ENABLE KEYS */;

DROP TABLE IF EXISTS `order`;
CREATE TABLE IF NOT EXISTS `order` (
  `order_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','rejected','accepted','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `cart_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `uq_order_cart_id` (`cart_id`),
  CONSTRAINT `fk_order_cart_id` FOREIGN KEY (`cart_id`) REFERENCES `cart` (`cart_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!40000 ALTER TABLE `order` DISABLE KEYS */;
INSERT INTO `order` (`order_id`, `created_at`, `status`, `cart_id`) VALUES
	(7, '2021-05-24 16:26:16', 'completed', 7),
	(8, '2021-06-02 17:20:21', 'pending', 8),
	(9, '2021-06-02 17:22:44', 'pending', 9);
/*!40000 ALTER TABLE `order` ENABLE KEYS */;

DROP TABLE IF EXISTS `photo`;
CREATE TABLE IF NOT EXISTS `photo` (
  `photo_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `article_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`photo_id`),
  KEY `fk_photo_article_id` (`article_id`),
  CONSTRAINT `fk_photo_article_id` FOREIGN KEY (`article_id`) REFERENCES `article` (`article_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!40000 ALTER TABLE `photo` DISABLE KEYS */;
INSERT INTO `photo` (`photo_id`, `image_path`, `article_id`) VALUES
	(22, 'static/uploads/2021/05/4a287f88-7e5e-424e-b2e6-e7e1fd42b3da-denny-muller-1qL31aacAPA-unsplash.jpg', 16),
	(23, 'static/uploads/2021/05/96c789c0-f661-424d-8374-f3a847543459-frank-r-ShHkXuZdpTw-unsplash.jpg', 16),
	(25, 'static/uploads/2021/05/b1de3f1f-b70f-46cc-a566-023fa7dc3d56-alexandre-debieve-FO7JIlwjOtU-unsplash.jpg', 17),
	(26, 'static/uploads/2021/05/cb1727af-365f-4b33-b81a-ef03cfe57cc4-cooler-933691_1280.jpg', 17),
	(27, 'static/uploads/2021/05/16e50e93-9e11-4c55-b196-d3a08de20bc4-cyber-2377718_1280.jpg', 17),
	(28, 'static/uploads/2021/05/bb267a51-8221-454f-83c3-8f5389c43a96-anas-alshanti-feXpdV001o4-unsplash.jpg', 16),
	(29, 'static/uploads/2021/05/7565e626-3a41-4caa-a065-17c6920b7aba-dries-augustyns-yiCOCqZ-ig4-unsplash.jpg', 16),
	(30, 'static/uploads/2021/05/aff9bee8-8ff7-4c56-9c72-888477eb8b5f-denny-muller-4u6TUbreFc0-unsplash.jpg', 16),
	(31, 'static/uploads/2021/05/a3549188-687d-4256-9659-171852b2d184-denny-muller-1qL31aacAPA-unsplash.jpg', 16),
	(32, 'static/uploads/2021/05/cedefbf4-3bd3-41e9-8647-bfb2bc369f45-mb001.jpg', 18),
	(33, 'static/uploads/2021/05/adcd2e13-500e-44de-8212-b5758dbe5b5f-mb002.png', 19),
	(34, 'static/uploads/2021/05/810e2d4b-fccf-43d9-bc5e-8efdd21ed943-mb003j.peg', 20);
/*!40000 ALTER TABLE `photo` ENABLE KEYS */;

DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `user_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_reset_code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `forename` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `surname` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_number` varchar(24) COLLATE utf8mb4_unicode_ci NOT NULL,
  `postal_address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) unsigned NOT NULL DEFAULT 1,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_user_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` (`user_id`, `created_at`, `email`, `password_hash`, `password_reset_code`, `forename`, `surname`, `phone_number`, `postal_address`, `is_active`) VALUES
	(6, '2021-05-21 15:47:55', 'mtair@singidunum.ac.rs', '$2b$11$BlWgwJPoeXGfyZNOYwZfIOlwOpR.fMYBQDtxqDCYPZW8VSrZoU99O', NULL, 'Milan', 'Tair', '+381113093267', 'Danijelova 32, 11010 beograd, R. Srbija', 1),
	(8, '2021-05-31 15:15:10', 'pperic@example.com', '$2b$11$9118C01XZalghVFdu2AKVerERAEltL9BG0RbwO/E5epn7slNPDa9m', NULL, 'Pera', 'Peric', '+381113093263', 'Danijelova 32, 11010 beograd, R. Srbija', 1),
	(11, '2021-05-31 15:28:43', 'pperic@example.org', '$2b$11$bawD24EoVo3XDipnSgV8iu8ZtFRFu9o5EAEMD4DMOklNpKA25oMdW', NULL, 'Pera', 'Peric', '+381113094094', 'Neka adresa korisnika', 1),
	(13, '2021-05-31 15:29:03', 'pperic@example.co.uk', '$2b$11$/dHK0dVaE8gnzoshePAHe.sn7.obOqgjXJXWltYFNELPCoD2VBzFG', NULL, 'Pera', 'Peric', '+381113094094', 'Neka adresa korisnika 10', 1);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
