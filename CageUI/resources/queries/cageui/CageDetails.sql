SELECT
    (h.room || '-' || TO_CHAR(c.cage_number, '0000')) AS Location,
    h.room AS Room,
    c.cage_number AS Cage,
    rt.name AS "Rack Type",
    c.length AS Length,
    c.width AS Width,
    c.height AS Height
FROM cageui.cages c
JOIN cageui.layout_history lh ON lh.cage = c.objectid
JOIN cageui.all_history h ON lh.historyid = h.historyid
JOIN cageui.racks r ON c.rack = r.objectid
JOIN cageui.rack_types rt ON r.rack_type = rt.rowid
where h.end_date is null;