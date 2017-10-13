
CREATE DATABASE `dev_center`
USE `dev_center`;


CREATE TABLE `tickets` (
  `key` varchar(15) NOT NULL,
  `msrp` varchar(6),
  `crucible` varchar(15),
  `username` char(6),
  `pcr_ping` int(11) DEFAULT '0',
  `merge_ping` tinyint(1) DEFAULT '0',
  `conflict_ping` tinyint(1) DEFAULT '0',
  `new_ping` tinyint(1) DEFAULT '0',
  `me_ping` tinyint(1) DEFAULT '0',
  `qa_ping` tinyint(1) DEFAULT '0',
  `uct_fail_ping` tinyint(1) DEFAULT '0',
  `cr_fail_ping` tinyint(1) DEFAULT '0',
  `uct_ping` tinyint(1) DEFAULT '0',
  `qa_fail_ping` tinyint(1) DEFAULT '0',
  `summary` varchar(100),
  `status` varchar(100),
  `component` varchar(100),
  `story_point` varchar(5),
  `sprint` varchar(20),
  `epic_link` varchar(20),
  `label` varchar(30),
  `comments` text,
  `qa_steps` text,
  `crucible_id` varchar(15),
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `users` (
  `username` char(6) NOT NULL,
  `all_ping` tinyint(1) DEFAULT '0',
  `new_ping` tinyint(1) DEFAULT '0',
  `conflict_ping` tinyint(1) DEFAULT '0',
  `cr_fail_ping` tinyint(1) DEFAULT '0',
  `uct_fail_ping` tinyint(1) DEFAULT '0',
  `merge_ping` tinyint(1) DEFAULT '0',
  `never_ping` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `error_logs` (
  `message` text NOT NULL,
  `timestamp` datetime NOT NULL,
  PRIMARY KEY (`message`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `comments` (
  `key` VARCHAR(15) NOT NULL,
  `comment` TEXT NOT NULL,
  `comment_id` VARCHAR(30) NOT NULL,
  PRIMARY KEY (`comment_id`),
  FOREIGN KEY (`key`) REFERENCES tickets(`key`)
) ENGINE=INNODB DEFAULT CHARSET=utf8;