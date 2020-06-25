DROP TABLE IF EXISTS wnprc.procedure_rooms;
CREATE TABLE wnprc.procedure_rooms
(
    room                VARCHAR(50),
    displayname         VARCHAR(100),
    type                VARCHAR(50),
    email               VARCHAR(50),
    show_by_default     BOOLEAN DEFAULT TRUE,
    default_bg_color    VARCHAR(20),
    -- Default fields for LabKey.
    container           entityid NOT NULL,
    createdby           userid,
    created             TIMESTAMP,
    modifiedby          userid,
    modified            TIMESTAMP,

    CONSTRAINT pk_procedure_room PRIMARY KEY (room)
);

DROP TABLE IF EXISTS wnprc.procedure_categories;
CREATE TABLE wnprc.procedure_categories
(
    displayname VARCHAR(50),
    category    VARCHAR(50),
    -- Default fields for LabKey.
    container   entityid NOT NULL,
    createdby   userid,
    created     TIMESTAMP,
    modifiedby  userid,
    modified    TIMESTAMP,

    CONSTRAINT pk_procedure_category PRIMARY KEY (category)
);

DROP TABLE IF EXISTS wnprc.procedure_names;
CREATE TABLE wnprc.procedure_names
(
    displayname VARCHAR(50),
    name        VARCHAR(50),
    category    VARCHAR(50),
    -- Default fields for LabKey.
    container   entityid NOT NULL,
    createdby   userid,
    created     TIMESTAMP,
    modifiedby  userid,
    modified    TIMESTAMP,

    CONSTRAINT pk_procedure_name PRIMARY KEY (name)
);

DROP TABLE IF EXISTS wnprc.procedure_calendars;
CREATE TABLE wnprc.procedure_calendars
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

    CONSTRAINT pk_procedure_calendar_id PRIMARY KEY (calendar_id)
);

-- DELETE FROM study.qcstate WHERE label = 'Request: On Hold';
--
-- INSERT INTO study.qcstate (label, description, container, publicdata)
-- VALUES ('Request: On Hold', 'Request has been put on hold', '29e3860b-02b5-102d-b524-493dbd27b599', FALSE);