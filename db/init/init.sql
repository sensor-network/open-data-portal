CREATE TABLE `Data` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pH` float DEFAULT NULL,
  `temperature` float DEFAULT NULL,
  `conductivity` float DEFAULT NULL,
  `date` timestamp DEFAULT NULL,
  `position` point NOT NULL /*!80003 SRID 4326 */,
  PRIMARY KEY (`id`),
  SPATIAL KEY `position` (`position`),
  CONSTRAINT `Data_chk_1` CHECK ((`pH` between 0 and 14))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET time_zone='00:00';