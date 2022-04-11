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

/* sensor table not needed? */
CREATE TABLE sensor
(
    `id`          int primary key auto_increment,
    `name`        varchar(255),
    `firmware`    varchar(255),
    `type`        varchar(255) NOT NULL,
    `status`      varchar(255) NOT NULL DEFAULT 'ok',
    `last_active` timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
    `sensor_id`   int          NOT NULL,
    `location_id` int          NOT NULL,
    `position`    POINT        NOT NULL SRID 4326,
    `value`       float        NOT NULL,
    `time`        timestamp    NOT NULL,
    `type`        varchar(255) NOT NULL,
    primary key (`sensor_id`, `time`),
    foreign key (`sensor_id`) references sensor (`id`),
    foreign key (`type`) references sensor (`type`),
    foreign key (`location_id`) references location (`id`),
    INDEX (time, location_id, type, value),
    INDEX (`sensor_id`),
    INDEX (`location_id`),
    INDEX (`type`),
    SPATIAL INDEX (`position`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE history
(
    id          INT          NOT NULL AUTO_INCREMENT,
    date        DATE         NOT NULL,
    type        VARCHAR(255) NOT NULL,
    location_id int          NOT NULL,
    daily_min   FLOAT,
    daily_avg   FLOAT,
    daily_max   FLOAT,
    PRIMARY KEY (id),
    FOREIGN KEY (location_id) REFERENCES location (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

SET time_zone = '+00:00';
