CREATE TABLE `Data` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pH` float DEFAULT NULL,
  `temperature` float DEFAULT NULL,
  `conductivity` float DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `position` point NOT NULL /*!80003 SRID 4326 */,
  PRIMARY KEY (`id`),
  SPATIAL KEY `position` (`position`),
  CONSTRAINT `Data_chk_1` CHECK ((`pH` between 0 and 14))
);

CREATE TABLE `Locations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `radius` int unsigned NOT NULL,
  `position` point NOT NULL /*!80003 SRID 4326 */,
  PRIMARY KEY (`id`),
  SPATIAL KEY `position` (`position`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;