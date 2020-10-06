SELECT viral_status.rowid,
viral_status.value,
viral_status.title,
viral_status.category,
viral_status.description,
viral_status.sort_order,
viral_status.date_disabled
FROM ehr_lookups.viral_status
WHERE viral_status.value IN ('SPF4', 'SPF5 (AAV-)', 'SPF5 (RRV-)', 'SPF6 (-AAV & -RRV)', 'Conventional', 'Conventional and SPF4')