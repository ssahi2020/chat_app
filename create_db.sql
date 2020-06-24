-- CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

DROP DATABASE IF EXISTS ssahi;
CREATE DATABASE ssahi;
USE ssahi;

DROP TABLE IF EXISTS user_channel;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS threads;
DROP TABLE IF EXISTS channels;
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
  user_id                     INT AUTO_INCREMENT,
  role                        VARCHAR(100),
  first_name                  VARCHAR(100),
  last_name                   VARCHAR(100),
  username                    VARCHAR(55) NOT NULL,
  email                       VARCHAR(255) NOT NULL,
  password                    VARCHAR(255) NOT NULL,
  password_reset              VARCHAR(255),
  password_reset_expires      DATETIME,
  is_active                   BOOLEAN NOT NULL DEFAULT 1,
  created_at                  DATETIME NOT NULL,
  updated_at                  DATETIME NOT NULL,
  deleted_at                  DATETIME,
  PRIMARY KEY (user_id)
);

CREATE UNIQUE INDEX user_name_idx ON users(username);
CREATE UNIQUE INDEX user_email_idx ON users(email);

CREATE TABLE IF NOT EXISTS channels (
  channel_id                  INT AUTO_INCREMENT,
  name                        VARCHAR(255) NOT NULL,
  creator_id                  INT NOT NULL,
  created_at                  DATETIME NOT NULL,
  updated_at                  DATETIME NOT NULL,
  deleted_at                  DATETIME,
  PRIMARY KEY (channel_id),
  FOREIGN KEY (creator_id) REFERENCES users(user_id)
);

CREATE UNIQUE INDEX channel_name_idx ON channels(name);

CREATE TABLE IF NOT EXISTS messages (
  message_id                  INT AUTO_INCREMENT,
  channel_id                  INT NOT NULL,
  body                        TEXT NOT NULL,
  poster_id                   INT NOT NULL,
  replies_to                  INT,
  created_at                  DATETIME NOT NULL,
  updated_at                  DATETIME NOT NULL,
  deleted_at                  DATETIME,
  PRIMARY KEY (message_id),
  FOREIGN KEY (poster_id) REFERENCES users(user_id),
  FOREIGN KEY (channel_id) REFERENCES channels(channel_id)
);

CREATE TABLE IF NOT EXISTS user_channel (
  user_channel_id             INT AUTO_INCREMENT,
  user_id                     INT NOT NULL,
  channel_id                  INT NOT NULL,
  last_message_id             INT,
  created_at                  DATETIME NOT NULL,
  updated_at                  DATETIME NOT NULL,
  deleted_at                  DATETIME,
  PRIMARY KEY (user_channel_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (channel_id) REFERENCES channels(channel_id)
);

DELIMITER |
CREATE TRIGGER users_before_insert_trigger
BEFORE INSERT
   ON users FOR EACH ROW
BEGIN
  -- variable declarations
  DECLARE msg   VARCHAR(255);
  DECLARE valid INT;
  -- trigger code

  -- validate email address
  SET valid = (SELECT REGEXP_LIKE(NEW.email,'^[^[:space:]@\\.]+[^[:space:]@]*@[^[:space:]@\\.]+[^[:space:]@]*\\.[^[:space:]@\\.]+$'));
  IF (valid = 0) THEN
    SET msg = concat('Email Error: "', NEW.email,'" is not a valid email.');
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;

  -- validate role
  SET valid = (SELECT IF(IFNULL(NEW.role,'admin') = 'admin',1,0));
  IF (valid = 0) THEN
    SET msg = concat('Role Error: "', NEW.role,'" is not a valid role.');
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;

  SET NEW.created_at = (SELECT NOW());
  SET NEW.updated_at = (SELECT NOW());
END|

CREATE TRIGGER users_after_insert_trigger
AFTER INSERT
   ON users FOR EACH ROW
BEGIN
  -- insert user in user_channel table
  INSERT INTO user_channel(user_id, channel_id)
  SELECT NEW.user_id as user_id, channel_id FROM channels;
END|

CREATE TRIGGER users_before_update_trigger
BEFORE UPDATE
   ON users FOR EACH ROW
BEGIN
  -- variable declarations
  DECLARE msg   VARCHAR(255);
  DECLARE valid INT;
  -- trigger code

  SET valid = (SELECT REGEXP_LIKE(NEW.email,'^[^[:space:]@\\.]+[^[:space:]@]*@[^[:space:]@\\.]+[^[:space:]@]*\\.[^[:space:]@\\.]+$'));
  -- validate email address
  IF (valid = 0) THEN
    SET msg = concat('Email Error: "', NEW.email,'" is not a valid email.');
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;
  SET NEW.updated_at = (SELECT NOW());
END|

CREATE TRIGGER channels_before_insert_trigger
BEFORE INSERT
   ON channels FOR EACH ROW
BEGIN
  SET NEW.created_at = (SELECT NOW());
  SET NEW.updated_at = (SELECT NOW());
END|

CREATE TRIGGER channels_after_insert_trigger
AFTER INSERT
   ON channels FOR EACH ROW
BEGIN
  -- insert channel in user_channel table
  INSERT INTO user_channel(user_id, channel_id)
  SELECT user_id, NEW.channel_id FROM users;
END|

CREATE TRIGGER channels_before_update_trigger
BEFORE UPDATE
   ON channels FOR EACH ROW
BEGIN
  SET NEW.updated_at = (SELECT NOW());
END|

CREATE TRIGGER messages_before_insert_trigger
BEFORE INSERT
   ON messages FOR EACH ROW
BEGIN
  SET NEW.created_at = (SELECT NOW());
  SET NEW.updated_at = (SELECT NOW());
END|

CREATE TRIGGER messages_before_update_trigger
BEFORE UPDATE
   ON messages FOR EACH ROW
BEGIN
  SET NEW.updated_at = (SELECT NOW());
END|

CREATE TRIGGER user_channels_before_insert_trigger
BEFORE INSERT
   ON user_channel FOR EACH ROW
BEGIN
  SET NEW.created_at = (SELECT NOW());
  SET NEW.updated_at = (SELECT NOW());
END|

CREATE TRIGGER user_channels_before_update_trigger
BEFORE UPDATE
   ON user_channel FOR EACH ROW
BEGIN
  SET NEW.updated_at = (SELECT NOW());
END|

