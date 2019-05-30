SELECT lsid, to_char(date_conception, 'yyyy-MM-dd') || ' (Sire: ' || sireid || ')' AS date_conception
FROM study.pregnancies