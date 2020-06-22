DROP TABLE IF EXISTS wnprc.on_call_calendars;
CREATE TABLE wnprc.on_call_calendars
(
    calendar_id       VARCHAR(100),
    calendar_type     VARCHAR(100),
    display_name      VARCHAR(500),
    api_action        VARCHAR(200),
    folder_id         VARCHAR(200),
    show_by_default   BOOLEAN DEFAULT TRUE,
    default_bg_color  VARCHAR(20),

    -- Default fields for LabKey.
    container         entityid NOT NULL,
    createdby         userid,
    created           TIMESTAMP,
    modifiedby        userid,
    modified          TIMESTAMP,

    CONSTRAINT pk_on_call_calendar_id PRIMARY KEY (calendar_id)
);