
DROP TABLE IF EXISTS station;
CREATE TABLE station(
	`id` int AUTO_INCREMENT, 
	`sensor_id` int,
	`location_name` VARCHAR(255), 
	primary key (`id`, `sensor_id`),
	foreign key(`location_name`) references location(`name`),
    foreign key(`sensor_id`) references sensor(`id`));

DROP TABLE IF EXISTS sensor;
CREATE TABLE sensor(
	`id` int primary key auto_increment, 
	`name` varchar(255),
	`firmware` varchar(255),
    `type` varchar(255));
    
DROP TABLE IF EXISTS data_sensor;
CREATE TABLE data_sensor(
	`sensor_id` int,
    `type` varchar(255),
	`value` float,
	`time` timestamp,
	foreign key (`sensor_id`) references sensor(`id`));
     
DROP TABLE IF EXISTS location;    
CREATE TABLE location(
	`name` varchar(255) primary key, 
    `position` POINT NOT NULL SRID 4326,
    `radius` int,
    SPATIAL INDEX (`position`));
    
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
SET time_zone='+00:00';
    