CREATE TABLE location
(
    `id`            int          NOT NULL primary key AUTO_INCREMENT,
    `name`          varchar(255) NOT NULL,
    `position`      POINT        NOT NULL SRID 4326,
    `radius_meters` int,
    SPATIAL INDEX (`position`),
    INDEX (`name`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE sensor
(
    `id`       int primary key auto_increment,
    `name`     varchar(255),
    `firmware` varchar(255),
    `type`     varchar(255) NOT NULL,
    INDEX (`type`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE station
(
    `id`          int primary key AUTO_INCREMENT,
    `sensor_id`   int     NOT NULL,
    `location_id` int(11) NOT NULL,
    foreign key (`location_id`) references location (`id`),
    foreign key (`sensor_id`) references sensor (`id`),
    INDEX (`location_id`),
    INDEX (`sensor_id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE measurement
(
    `sensor_id`   int       NOT NULL,
    `location_id` int       NOT NULL,
    `value`       float     NOT NULL,
    `time`        timestamp NOT NULL,
    primary key (`sensor_id`, `time`),
    foreign key (`sensor_id`) references sensor (`id`),
    foreign key (`location_id`) references location (`id`),
    INDEX (`sensor_id`),
    INDEX (`location_id`)
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
