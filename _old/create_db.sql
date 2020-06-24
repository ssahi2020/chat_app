DROP DATABASE IF EXISTS belay;
CREATE DATABASE belay;
USE belay;

DROP TABLE IF EXISTS message_views;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS threads;
DROP TABLE IF EXISTS channels;
DROP TABLE IF EXISTS users;



CREATE TABLE IF NOT EXISTS users (
  user_id                     INT AUTO_INCREMENT,
  display_name                VARCHAR(55) NOT NULL,
  email_address               VARCHAR(255) NOT NULL,
  password_hash               VARCHAR(255) NOT NULL,
  password_reset              VARCHAR(255),
  password_reset_expires      DATETIME,
  created_at                  DATETIME NOT NULL,
  updated_at                  DATETIME NOT NULL,
  deleted_at                  DATETIME,
  PRIMARY KEY (user_id)
);

CREATE UNIQUE INDEX user_email_idx ON users(email_address);

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
  created_at                  DATETIME NOT NULL,
  updated_at                  DATETIME NOT NULL,
  deleted_at                  DATETIME,
  PRIMARY KEY (message_id),
  FOREIGN KEY (poster_id) REFERENCES users(user_id),
  FOREIGN KEY (channel_id) REFERENCES channels(channel_id)
);

CREATE TABLE IF NOT EXISTS threads (
  thread_id                   INT AUTO_INCREMENT,
  initiating_message          INT NOT NULL,
  channel_id                  INT NOT NULL,
  created_at                  DATETIME NOT NULL,
  updated_at                  DATETIME NOT NULL,
  deleted_at                  DATETIME,
  PRIMARY KEY (thread_id),
  FOREIGN KEY (channel_id) REFERENCES channels(channel_id),
  FOREIGN KEY (initiating_message) REFERENCES messages(message_id)
);

CREATE UNIQUE INDEX thread_initiating_message_idx ON threads(initiating_message);

CREATE TABLE IF NOT EXISTS thread_membership (
  membership_id               INT AUTO_INCREMENT,
  message_id                  INT NOT NULL,
  thread_id                   INT NOT NULL,
  PRIMARY KEY (membership_id),
  FOREIGN KEY (message_id) REFERENCES messages(message_id),
  FOREIGN KEY (thread_id) REFERENCES threads(thread_id)
);

CREATE UNIQUE INDEX thread_membership_unique_idx ON thread_membership(message_id,thread_id);

CREATE TABLE IF NOT EXISTS message_views (
  view_id                     INT AUTO_INCREMENT,
  viewer_id                   INT NOT NULL,
  message_id                  INT NOT NULL,
  created_at                  DATETIME NOT NULL,
  updated_at                  DATETIME NOT NULL,
  deleted_at                  DATETIME,
  PRIMARY KEY (view_id),
  FOREIGN KEY (viewer_id) REFERENCES users(user_id),
  FOREIGN KEY (message_id) REFERENCES messages(message_id)
);

CREATE UNIQUE INDEX thread_viewership_unique_idx ON message_views(viewer_id, message_id);


DELIMITER |
CREATE TRIGGER users_before_insert_trigger
BEFORE INSERT
   ON users FOR EACH ROW
BEGIN
  -- variable declarations
  DECLARE msg   VARCHAR(255);
  DECLARE valid INT;
  -- trigger code

  SET valid = (SELECT REGEXP_LIKE(NEW.email_address,'^[^[:space:]@\\.]+[^[:space:]@]*@[^[:space:]@\\.]+[^[:space:]@]*\\.[^[:space:]@\\.]+$'));
  -- validate email address
  IF (valid = 0) THEN
    SET msg = concat('Email Error: "', NEW.email_address,'" is not a valid email.');
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;
END|

CREATE TRIGGER users_before_update_trigger
BEFORE UPDATE
   ON users FOR EACH ROW
BEGIN
  -- variable declarations
  DECLARE msg   VARCHAR(255);
  DECLARE valid INT;
  -- trigger code

  SET valid = (SELECT REGEXP_LIKE(NEW.email_address,'^[^[:space:]@\\.]+[^[:space:]@]*@[^[:space:]@\\.]+[^[:space:]@]*\\.[^[:space:]@\\.]+$'));
  -- validate email address
  IF (valid = 0) THEN
    SET msg = concat('Email Error: "', NEW.email_address,'" is not a valid email.');
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;
END|
DELIMITER ;