
CREATE DATABASE `dev_center`
USE `dev_center`;


CREATE TABLE `tickets` (
  `key` varchar(20) NOT NULL,
  `msrp` int(10) NOT NULL,
  `crucible` varchar(20) DEFAULT NULL,
  `username` char(6) DEFAULT NULL,
  `pcr_ping` tinyint(1) DEFAULT '0',
  `merge_ping` tinyint(1) DEFAULT '0',
  `conflict_ping` tinyint(1) DEFAULT '0',
  `new_ping` tinyint(1) DEFAULT '0',
  `me_ping` tinyint(1) DEFAULT '0',
  `qa_ping` tinyint(1) DEFAULT '0',
  `uct_fail_ping` tinyint(1) DEFAULT '0',
  `cr_fail_ping` tinyint(1) DEFAULT '0',
  `uct_ping` tinyint(1) DEFAULT '0',
  `qa_fail_ping` tinyint(1) DEFAULT '0',
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;


CREATE TABLE `logs` (
  `message` varchar(150) NOT NULL,
  `timestamp` datetime NOT NULL,
  PRIMARY KEY (`message`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;