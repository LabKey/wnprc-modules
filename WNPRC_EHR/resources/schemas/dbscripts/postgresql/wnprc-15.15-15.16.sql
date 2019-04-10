DROP TABLE IF EXISTS wnprc.animal_requests;
CREATE TABLE wnprc.animal_requests(
    rowid serial NOT NULL,
    principalinvestigator varchar (100) NOT NULL,
    date TIMESTAMP,
    speciesneeded varchar (100) NOT NULL, /*new table?*/
    sex varchar (100) NOT NULL, /*new table?*/
    age varchar (100) NOT NULL,
    numberofanimals integer,
    viralstatus varchar(100) NOT NULL, /*new table?*/
    dateneeded TIMESTAMP,
    protocol varchar (100) NOT NULL,
    project varchar (100),
    account varchar (100),
    comments TEXT,
    requestid varchar(100),
    taskid varchar(100),
    QCState integer ,

    -- Fields for after approval/denial
    dateapprovedordenied TIMESTAMP,
    dateorderd TIMESTAMP,
    datearrival TIMESTAMP,
    animalsorigin TEXT,

    -- Default fields for LabKey.
    container  entityid NOT NULL,
    createdby  userid,
    created    TIMESTAMP,
    modifiedby userid,
    modified   TIMESTAMP,

  CONSTRAINT pk_animal_requests PRIMARY KEY (rowid)

);