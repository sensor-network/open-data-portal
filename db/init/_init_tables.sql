CREATE TABLE location
(
    `name`     varchar(255) NOT NULL primary key,
    `position` POINT        NOT NULL SRID 4326,
    `radius`   int,
    SPATIAL INDEX (`position`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE sensor
(
    `id`       int primary key auto_increment,
    `name`     varchar(255),
    `firmware` varchar(255),
    `type`     varchar(255) NOT NULL
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE station
(
    `id`            int AUTO_INCREMENT,
    `sensor_id`     int,
    `location_name` VARCHAR(255),
    primary key (`id`, `sensor_id`),
    foreign key (`location_name`) references location (`name`),
    foreign key (`sensor_id`) references sensor (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE sensor_data
(
    `sensor_id` int,
    `value`     float,
    `time`      timestamp,
    primary key (`sensor_id`, `time`),
    foreign key (`sensor_id`) references sensor (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE history
(
    id            INT          NOT NULL AUTO_INCREMENT,
    date          DATE         NOT NULL,
    sensor_type   VARCHAR(255) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    daily_min     FLOAT,
    daily_avg     FLOAT,
    daily_max     FLOAT,
    PRIMARY KEY (id),
    FOREIGN KEY (location_name) REFERENCES location (`name`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

SET time_zone = '+00:00';
