DROP TABLE IF EXISTS wnprc.animal_requests;
CREATE TABLE wnprc.animal_requests(
    rowid serial NOT NULL,
    principalinvestigator varchar (100) NOT NULL,
    date TIMESTAMP,
    originneeded varchar (100) NOT NULL,
    speciesneeded varchar (100) NOT NULL, /*new table?*/
    sex varchar (255) NOT NULL, /*new table?*/
    age varchar (100) NOT NULL,
    numberofanimals integer,
    viralstatus varchar(255),
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
    dateordered TIMESTAMP,
    datearrival TIMESTAMP,
    animalsorigin TEXT,

    -- Default fields for LabKey.
    container  entityid NOT NULL,
    createdby  userid,
    created    TIMESTAMP,
    modifiedby userid,
    modified   TIMESTAMP,

  CONSTRAINT pk_animal_requests PRIMARY KEY (rowid)
  --CONSTRAINT fk_animal_requests_viral_status FOREIGN KEY (container,viralstatus) REFERENCES ehr_lookups.viral_status (container,rowid)

);


insert into ehr_lookups.lookups (set_name,container,value) select setname, container, 'SPF4' as value from ehr_lookups.lookup_sets where setname='viral_status';
insert into ehr_lookups.lookups (set_name,container,value) select setname, container, 'SPF5 (AAV-)' as value from ehr_lookups.lookup_sets where setname='viral_status';
insert into ehr_lookups.lookups (set_name,container,value) select setname, container, 'SPF5 (RRV-)' as value from ehr_lookups.lookup_sets where setname='viral_status';

insert into ehr_lookups.lookup_sets (setname,container)  select 'animal_requests_sex' as setname, container from ehr_lookups.lookup_sets where setname='viral_status';

insert into ehr_lookups.lookups (set_name,container,value) select setname, container, 'M' as value from ehr_lookups.lookup_sets where setname='animal_requests_sex';
insert into ehr_lookups.lookups (set_name,container,value) select setname, container, 'F' as value from ehr_lookups.lookup_sets where setname='animal_requests_sex';
insert into ehr_lookups.lookups (set_name,container,value) select setname, container, 'M or F' as value from ehr_lookups.lookup_sets where setname='animal_requests_sex';
insert into ehr_lookups.lookups (set_name,container,value) select setname, container, 'Equal # M & F' as value from ehr_lookups.lookup_sets where setname='animal_requests_sex';

