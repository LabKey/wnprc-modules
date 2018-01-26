DROP TABLE IF EXISTS wnprc.vvc;
CREATE TABLE wnprc.vvc(
    rowid serial NOT NULL,
    date TIMESTAMP,
    dateapproved TIMESTAMP,
    pi varchar (100) NOT NULL,
    protocol varchar (100) NOT NULL,
    description TEXT,
    rationale TEXT,
    veterinarian userid,
    requestid varchar(100),
    taskid varchar(100),
    QCState integer ,
    /*QCState integer NOT NULL,*/


  -- Default fields for LabKey.
  container  entityid NOT NULL,
  createdby  userid,
  created    TIMESTAMP,
  modifiedby userid,
  modified   TIMESTAMP,

  CONSTRAINT pk_vvc PRIMARY KEY (rowid)


);