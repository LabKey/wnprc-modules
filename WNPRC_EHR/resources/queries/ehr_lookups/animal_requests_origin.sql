SELECT geographic_origins.rowid,
geographic_origins.meaning,
geographic_origins.description
FROM ehr_lookups.geographic_origins

where geographic_origins.meaning in ('india', 'china', 'mauritius','indonesia','laos','vietnam')