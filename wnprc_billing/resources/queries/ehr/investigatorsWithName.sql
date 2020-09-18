SELECT
rowid,
(CASE WHEN lastName IS NOT NULL AND firstName IS NOT NULL
          THEN (lastName ||', '|| firstName)
      WHEN lastName IS NOT NULL AND firstName IS NULL
          THEN lastName
      WHEN lastName IS NULL AND firstName IS NULL
          THEN userid.displayName
      ELSE
          firstName
    END) AS investigatorWithName,
userid,
financialAnalyst

FROM ehr.investigators