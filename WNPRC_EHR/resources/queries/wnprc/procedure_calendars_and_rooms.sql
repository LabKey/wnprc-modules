SELECT
       calendar_id                          AS calendar_id,
       calendar_type                        AS calendar_type,
       display_name                         AS display_name,
       cast(NULL AS VARCHAR)                AS room,
       calendar_group                       AS calendar_group,
       api_action                           AS api_action,
       folder_id                            AS folder_id,
       show_by_default                      AS show_by_default,
       cast(FALSE AS BOOLEAN)               AS requestable,
       cast(true AS BOOLEAN)                AS ehr_managed,
       default_bg_color                     AS default_bg_color,
       account_name                         AS account_name,
       requires_authorization               AS requires_authorization,
       authorized_groups                    AS authorized_groups
FROM wnprc.procedure_calendars

UNION ALL

SELECT
       email                                AS calendar_id,
       'Office365Resource'                  AS calendar_type,
       displayname                          AS display_name,
       room                                 AS room,
       calendar_group                       AS calendar_group,
       'FetchSurgeryProcedureOutlookEvents' AS api_action,
       folder_id                            AS folder_id,
       show_by_default                      AS show_by_default,
       requestable                          AS requestable,
       ehr_managed                          AS ehr_managed,
       default_bg_color                     AS default_bg_color,
       'ProcedureCalendar'                  AS account_name,
       cast(FALSE AS BOOLEAN)               AS requires_authorization,
       cast(NULL AS VARCHAR)                AS authorized_groups
FROM wnprc.procedure_rooms