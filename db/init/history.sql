/**
 * Idea of retrieving a subset of the measurements,
 * don't want to calculate averages on every request:
    JOBS:
 *    Every 5 minutes (for showing today's data):
 *      - insert into table fives_averages, the average data of the last 5 minutes for all locations
 *    Every 30 minutes (for showing this week's data),
 *      - insert into table thirty_averages, the average data of the last 30 minutes for all locations
 *    At midnight,
 *      - clear table 'fives_averages, so that new daily averages can be inserted
 *      - remove last entry from thirty_averages and insert new one (like circular buffer)
 *      - sum up and average the measurements of the day and insert into daily_averages
 *    Every monday:
 *      - sum up and average the measurements of the week and insert into weekly_averages
 *
 * Table structure:
 *   | id | time | location_id | min | max | avg
 *
 *     Q: 1 table per sensor, or gather them all in a single one?
 *       Pros for Separate tables:
 *         - simple
 *         - scale well, no need for migrations if new sensors are added (not really an issue for small tables)
 *         - selects only requested sensor when queried for
 *         - simple selects using 'group by' if selecting multiple sensors
 *       Cons for separate tables:
 *         - takes up more space due to duplication of columns
 *
 *  Space Complexity:
 *    id: integer - 4 bytes
 *    time: timestamp - 4 bytes
 *    location_id - integer - 4 bytes
 *    min - float - 4 bytes  |\
 *    max - float - 4 bytes  | > 12 bytes sensor_specific information
 *    avg - float - 4 bytes  |/
 *    Total: 24 bytes per row (+24 bytes = 48 bytes if storing all 3 sensors
 *    in same table compared to 3 * 24 = 72 bytes if storing them separately)
 *
 *  fives_averages  : 24 * 12 = 288 rows    => 7 kB per location => 21 kB for all (currently) OR 14 kB if stored in same table
 *  thirty_averages : 7 * 24 * 2 = 336 rows => 8 kB              => 24 kB OR 16 kB
 *  daily_averages  : 365 rows / year       => 8.7 kB per year   => 26 kB OR 17.5 kB (yearly)
 *  weekly_averages : 52 rows / year        => 1.2 kB per year   => 3.7 kB OR 2.5 kB (yearly)
 *
 *  Total (one table): 45 kB + 30kB / year = 345 kB for 10 years
 *  Total (separate tables): 30 kB + 20 kB / year = 230 kB for 10 years
 *
 *  Conclusion: Migrating these small tables if adding more sensors is not really a big problem,
    so perhaps it's worth it to save some space by storing them in a single table.
 **/

CREATE TABLE history_daily (
    id INT NOT NULL AUTO_INCREMENT,
    date DATE NOT NULL,
    sensor_type VARCHAR(31) NOT NULL,
    location_id INT NOT NULL,
    daily_min FLOAT NOT NULL,
    daily_avg FLOAT NOT NULL,
    daily_max FLOAT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (location_id) REFERENCES Locations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;