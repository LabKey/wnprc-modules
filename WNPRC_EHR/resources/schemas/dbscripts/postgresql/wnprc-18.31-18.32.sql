DROP TABLE IF EXISTS wnprc.surgery_procedure_rooms;
CREATE TABLE wnprc.surgery_procedure_rooms
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

    CONSTRAINT pk_surgery_procedure_rooms PRIMARY KEY (room)
);

DROP TABLE IF EXISTS wnprc.surgery_procedure_type;
CREATE TABLE wnprc.surgery_procedure_type
(
    displayname VARCHAR(50),
    type        VARCHAR(50),
    -- Default fields for LabKey.
    container   entityid NOT NULL,
    createdby   userid,
    created     TIMESTAMP,
    modifiedby  userid,
    modified    TIMESTAMP,

    CONSTRAINT pk_surgery_procedure_type PRIMARY KEY (type)
);

DROP TABLE IF EXISTS wnprc.surgery_procedure_name;
CREATE TABLE wnprc.surgery_procedure_name
(
    displayname VARCHAR(50),
    name        VARCHAR(50),
    type        VARCHAR(50),
    -- Default fields for LabKey.
    container   entityid NOT NULL,
    createdby   userid,
    created     TIMESTAMP,
    modifiedby  userid,
    modified    TIMESTAMP,

    CONSTRAINT pk_surgery_procedure_name PRIMARY KEY (name)
);

DROP TABLE IF EXISTS wnprc.surgery_procedure_calendars;
CREATE TABLE wnprc.surgery_procedure_calendars
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

    CONSTRAINT pk_surgery_procedure_calendars PRIMARY KEY (calendar_id)
);

DELETE FROM study.qcstate WHERE label = 'Request: On Hold';

INSERT INTO study.qcstate (label, description, container, publicdata)
VALUES ('Request: On Hold', 'Request has been put on hold', '29e3860b-02b5-102d-b524-493dbd27b599', FALSE);