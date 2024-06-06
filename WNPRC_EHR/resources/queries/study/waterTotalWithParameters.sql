/*
 * Changing ehr_lookup.calendar to use parameters to improve performance when rendering
 * water calendar . Limiting the water total calculation to only the months displayed in
 * the in the calendar view.
 */
PARAMETERS(STARTTARGET TIMESTAMP , ENDTARGETDATE TIMESTAMP)
SELECT
    *,
    ENDTARGETDATE AS reportEndDate,

FROM ehr_lookups.calendar
WHERE (TargetDate >= STARTTARGET AND TargetDate <= ENDTARGETDATE)