DROP TABLE IF EXISTS wnprc.session_log;
CREATE TABLE wnprc.session_log
(
    rowid                   serial NOT NULL,
    start_time              TIMESTAMP,
    end_time                TIMESTAMP,
    schema_name             varchar(100),
    query_name              varchar(100),
    task_id                 varchar(255),
    number_of_records       integer,
    batch_add_used          boolean,
    bulk_edit_used          boolean,
    user_agent              varchar(255),
    errors_occurred         boolean,
    form_framework_type     integer,

    -- Default fields for LabKey.
    container         entityid NOT NULL,
    createdby         userid,
    created           TIMESTAMP,
    modifiedby        userid,
    modified          TIMESTAMP,

    CONSTRAINT pk_session_log_rowid PRIMARY KEY (rowid),
    CONSTRAINT fk_session_log_form_framework_type FOREIGN KEY (form_framework_type) REFERENCES ehr.form_framework_types (rowid)
);

