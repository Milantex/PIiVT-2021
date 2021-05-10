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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!40000 ALTER TABLE `administrator` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!40000 ALTER TABLE `article` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!40000 ALTER TABLE `article_feature` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!40000 ALTER TABLE `article_price` DISABLE KEYS */;
/*!40000 ALTER TABLE `article_price` ENABLE KEYS */;

DROP TABLE IF EXISTS `cart`;
CREATE TABLE IF NOT EXISTS `cart` (
  `cart_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`cart_id`),
  KEY `fk_cart_user_id` (`user_id`),
  CONSTRAINT `fk_cart_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!40000 ALTER TABLE `cart_article` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!40000 ALTER TABLE `category` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!40000 ALTER TABLE `feature` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!40000 ALTER TABLE `order` DISABLE KEYS */;
/*!40000 ALTER TABLE `order` ENABLE KEYS */;

DROP TABLE IF EXISTS `photo`;
CREATE TABLE IF NOT EXISTS `photo` (
  `photo_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `article_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`photo_id`),
  KEY `fk_photo_article_id` (`article_id`),
  CONSTRAINT `fk_photo_article_id` FOREIGN KEY (`article_id`) REFERENCES `article` (`article_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!40000 ALTER TABLE `photo` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!40000 ALTER TABLE `user` DISABLE KEYS */;
/*!40000 ALTER TABLE `user` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
