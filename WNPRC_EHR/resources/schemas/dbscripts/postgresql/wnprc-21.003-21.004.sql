CREATE TABLE IF NOT EXISTS wnprc.procedure_rooms
(
    room                VARCHAR(50),
    displayname         VARCHAR(100),
    type                VARCHAR(50),
    calendar_group      VARCHAR(100),
    email               VARCHAR(50),
    show_by_default     BOOLEAN DEFAULT TRUE,
    requestable         BOOLEAN DEFAULT TRUE,
    ehr_managed         BOOLEAN DEFAULT TRUE,
    folder_id           VARCHAR(200),
    default_bg_color    VARCHAR(20),

    -- Default fields for LabKey.
    container           entityid NOT NULL,
    createdby           userid,
    created             TIMESTAMP,
    modifiedby          userid,
    modified            TIMESTAMP,

    CONSTRAINT pk_procedure_room PRIMARY KEY (room)
);

CREATE TABLE IF NOT EXISTS wnprc.procedure_categories
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

CREATE TABLE IF NOT EXISTS wnprc.procedure_names
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

    CONSTRAINT pk_procedure_name PRIMARY KEY (name),
    CONSTRAINT fk_procedure_categories_category FOREIGN KEY (category) REFERENCES wnprc.procedure_categories (category)
);

CREATE TABLE IF NOT EXISTS wnprc.procedure_scheduled_rooms
(
    objectid        entityid NOT NULL,
    room            VARCHAR(100),
    date            TIMESTAMP,
    enddate         TIMESTAMP,
    event_id        VARCHAR(255),
    requestid       VARCHAR(100),

    -- Default fields for LabKey.
    container       entityid NOT NULL,
    createdby       userid,
    created         TIMESTAMP,
    modifiedby      userid,
    modified        TIMESTAMP,

    CONSTRAINT pk_procedure_scheduled_rooms_rowid PRIMARY KEY (objectid),
    CONSTRAINT fk_procedure_rooms_room FOREIGN KEY (room) REFERENCES wnprc.procedure_rooms (room),
    --CONSTRAINT fk_procedure_rooms_type FOREIGN KEY (room_type) REFERENCES wnprc.procedure_categories (category),
    CONSTRAINT fk_procedure_scheduled_rooms_requestid FOREIGN KEY (requestid) REFERENCES ehr.requests (requestid)
);

CREATE TABLE IF NOT EXISTS wnprc.azure_accounts
(
    display_name        VARCHAR(100),
    account             VARCHAR(100),
    enabled             BOOLEAN DEFAULT TRUE,
    refresh_interval    INTEGER,
    application_id      VARCHAR(100),
    authority           VARCHAR(100),
    upn                 VARCHAR(100),
    name                VARCHAR(100),
    scopes              VARCHAR(1000),

    -- Some of the default fields for LabKey.
    createdby       userid,
    created         TIMESTAMP,
    modifiedby      userid,
    modified        TIMESTAMP,

    CONSTRAINT pk_azure_accounts_name PRIMARY KEY (name)
);

CREATE TABLE IF NOT EXISTS wnprc.procedure_calendars
(
    calendar_id             VARCHAR(100),
    calendar_type           VARCHAR(100),
    calendar_group          VARCHAR(100),
    display_name            VARCHAR(500),
    account_name            VARCHAR(100),
    api_action              VARCHAR(200),
    folder_id               VARCHAR(200),
    show_by_default         BOOLEAN DEFAULT TRUE,
    requires_authorization  BOOLEAN DEFAULT FALSE,
    default_bg_color        VARCHAR(20),
    authorized_groups       VARCHAR(500),

    -- Default fields for LabKey.
    container         entityid NOT NULL,
    createdby         userid,
    created           TIMESTAMP,
    modifiedby        userid,
    modified          TIMESTAMP,

    CONSTRAINT pk_procedure_calendar_id PRIMARY KEY (calendar_id),
    CONSTRAINT fk_azure_accounts_name FOREIGN KEY (account_name) REFERENCES wnprc.azure_accounts (name)
);

CREATE TABLE IF NOT EXISTS wnprc.procedure_surgeons
(
    userid            userid NOT NULL,

    -- Default fields for LabKey.
    container         entityid NOT NULL,
    createdby         userid,
    created           TIMESTAMP,
    modifiedby        userid,
    modified          TIMESTAMP,

    CONSTRAINT pk_procedure_surgeons_id PRIMARY KEY (userid)
);

CREATE TABLE IF NOT EXISTS wnprc.procedure_units
(
    unit_display_name   VARCHAR(100),
    unit                VARCHAR(100),

    -- Default fields for LabKey.
    container         entityid NOT NULL,
    createdby         userid,
    created           TIMESTAMP,
    modifiedby        userid,
    modified          TIMESTAMP,

    CONSTRAINT pk_procedure_units_unit PRIMARY KEY (unit)
);