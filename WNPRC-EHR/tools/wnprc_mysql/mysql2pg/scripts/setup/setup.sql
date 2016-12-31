/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

DROP FUNCTION IF EXISTS FixDate;
CREATE FUNCTION FixDate(d DATE)
    RETURNS DATE DETERMINISTIC
    RETURN 
    CASE WHEN (d IS NULL OR d = '0000-00-00') THEN
      NULL
    ELSE
      STR_TO_DATE(concat_Ws('-', case WHEN YEAR(d)=0 THEN '0001' else cast(YEAR(d) AS CHAR) END,
      CASE WHEN MONTH(d)=0 THEN '01' ELSE cast(MONTH(d) AS CHAR) END ,
      CASE WHEN DAY(d)=0 THEN '01' ELSE CAST(DAY(d) AS CHAR) END), '%Y-%m-%d')
    END;

DROP FUNCTION IF EXISTS FixSpecies;
CREATE FUNCTION FixSpecies(d VARCHAR(30))
    RETURNS VARCHAR(30) DETERMINISTIC
    RETURN
    CASE
    WHEN (d = 'rhesus' OR d='rhesus macaque' or d = 'macaca mulatta' or d='r' or d='rh') THEN
      'Rhesus'
    WHEN (d = 'cyno' OR d='cynomolgus' or d = 'macaca fascicularis' or d='cynomolgus maca' or d='cy') THEN
      'Cynomolgus'
    WHEN (d = 'marmoset' or d='cj') THEN
      'Marmoset'
    WHEN (d ='baboon') THEN
      'Baboon'
    WHEN (d ='stump tailed' OR d = 'st') THEN
      'Stump Tailed'  
    WHEN (d ='Vervet' OR d = 'ag') THEN
      'Vervet'
    WHEN (d ='Cotton-top Tamarin' OR d = 'so') THEN
      'Cotton-top Tamarin'
    ELSE
      d
    END;


DROP FUNCTION IF EXISTS FixDateTime;
CREATE FUNCTION FixDateTime(d DATE, t TIME)
    RETURNS DATETIME DETERMINISTIC
    RETURN
    CASE
      WHEN ((d IS NULL OR d = '0000-00-00') AND (t IS NULL OR t = '00:00:00')) THEN
              NULL
      WHEN (d IS NULL OR d = '0000-00-00') THEN
              STR_TO_DATE(concat_ws('d','1979-01-01',
              CASE WHEN HOUR(t)=0 OR HOUR(t)=24 THEN '00' ELSE CAST(HOUR(t) AS CHAR) END,
              CASE WHEN MINUTE(t)=0 THEN '00' ELSE CAST(MINUTE(t) AS CHAR) END,
              CASE WHEN SECOND(t)=0 THEN '00' ELSE CAST(SECOND(t) AS CHAR) END
              ), '%Y-%m-%d-%H-%i-%s')
      WHEN (t IS NULL OR t = '00:00:00' OR t = '') THEN
              STR_TO_DATE(concat_Ws('-',
              CASE WHEN YEAR(d)=0 THEN '0001' else cast(YEAR(d) AS CHAR) END,
              CASE WHEN MONTH(d)=0 THEN '01' ELSE cast(MONTH(d) AS CHAR) END,
              CASE WHEN DAY(d)=0 THEN '01' ELSE CAST(DAY(d) AS CHAR) END,
              '00-00-00'
              ), '%Y-%m-%d-%H-%i-%s')
      ELSE
              STR_TO_DATE(concat_Ws('-',
              CASE WHEN YEAR(d)=0 THEN '0001' else cast(YEAR(d) AS CHAR) END,
              CASE WHEN MONTH(d)=0 THEN '01' ELSE cast(MONTH(d) AS CHAR) END ,
              CASE WHEN DAY(d)=0 THEN '01' ELSE CAST(DAY(d) AS CHAR) END,
              CASE WHEN HOUR(t)=0 OR HOUR(t)=24 THEN '00' ELSE CAST(HOUR(t) AS CHAR) END,
              CASE WHEN MINUTE(t)=0 THEN '00' ELSE CAST(MINUTE(t) AS CHAR) END,
              CASE WHEN SECOND(t)=0 THEN '00' ELSE CAST(SECOND(t) AS CHAR) END
              ), '%Y-%m-%d-%H-%i-%s')
      END;



/*
 * Replaces '<cr><lf>' with an escaped linefeed '\n'.
 * Replaces \\ with \
 */
DROP FUNCTION IF EXISTS FixNewlines;
CREATE FUNCTION FixNewlines(t VARCHAR(4000))
    RETURNS VARCHAR(4000) DETERMINISTIC
    RETURN
    REPLACE(REPLACE(REPLACE(t,
        '\r', '\n'),
        '\n\n', '\n'),
        '\\', '')
    ;

/*
 * This is ugly.  mySQL doesnt support replace using regexp
 * These are cases that have occurred.
 */
 
DELIMITER $$
DROP FUNCTION IF EXISTS `colony`.`FixBadTime` $$
CREATE FUNCTION `FixBadTime`(t VARCHAR(30)) RETURNS time DETERMINISTIC
BEGIN
    SET t = replace(t, 'YB', '');
    SET t = replace(t, 'pre-op', '');
    SET t = replace(t, '7:$9', '');
    SET t = replace(t, '1&:20', '');
    SET t = replace(t, '/', '0');
    SET t = replace(t, '15:76', '');
    SET t = replace(t, 's11:6', '');
    SET t = replace(t, 'PPP', '');
    SET t = replace(t, ' ', '');
    SET t = replace(t, '@', '2');
    SET t = replace(t, '8:94', '');
    SET t = replace(t, 's14:5', '14:50');
    SET t = replace(t, '8:100', '');
    SET t = replace(t, 'oral', '');
    SET t = replace(t, ':;', ':');
    SET t = replace(t, '1.', '1');
    SET t = replace(t, '4.', '40');
    SET t = replace(t, 'd15:5', '');
    SET t = replace(t, '15:75', '');
    SET t = replace(t, '16:60', '');
    SET t = replace(t, '14:80', '');
    SET t = replace(t, '\\', '');
    SET t = replace(t, '95079', '');
    SET t = replace(t, '83098', '');
    SET t = replace(t, 'it', '');
    SET t = replace(t, ']', '');
    SET t = replace(t, '-', '');
    SET t = replace(t, '#', '');
    SET t = replace(t, '>', ':');
    SET t = replace(t, 'daily', '');
    SET t = replace(t, '15:74', '');
    SET t = replace(t, ';', ':');
    SET t = replace(t, 'L', '');
    SET t = replace(t, '!', '');
    SET t = replace(t, 'j', '');
    SET t = replace(t, '~', '');
    SET t = replace(t,  '`', '');
    SET t = replace(t, '0:700', '07:00');
    SET t = replace(t, '7:300', '07:30');
    SET t = replace(t, 'daily', '');
    SET t = replace(t, 'c', '');
    SET t = replace(t, 'im', '');
    SET t = replace(t, '"', ':');
    SET t = replace(t, 'p', '');

    RETURN CAST(NULLIF(t, '') AS TIME);
END $$

DELIMITER ;