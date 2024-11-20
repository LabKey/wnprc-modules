DROP TABLE IF EXISTS wnprc.layout_history;
CREATE TABLE wnprc.layout_history
(
    rowid SERIAL NOT NULL,
    room VARCHAR(50) NOT NULL,
    room_object VARCHAR(50),
    rack_group VARCHAR(50),
    rack VARCHAR(50),
    cage VARCHAR(50),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    x_coord DOUBLE PRECISION NOT NULL,
    y_coord DOUBLE PRECISION NOT NULL,
    scale DOUBLE PRECISION NOT NULL,
    container         entityid NOT NULL,
    createdby         userid,
    created           TIMESTAMP,
    modifiedby        userid,
    modified          TIMESTAMP,
    CONSTRAINT PK_layout_history PRIMARY KEY (rowid),
    CONSTRAINT FK_layout_history_container FOREIGN KEY (container) REFERENCES core.Containers (EntityId)
);