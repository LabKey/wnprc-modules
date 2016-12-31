/*
 * Copyright (c) 2012-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/* EHR-11.35-11.36.sql */

drop TABLE ehr.client_errors;

--modify column sizes:
alter table ehr.project alter column title TYPE varchar(200);
alter table ehr.project alter column inves TYPE varchar(200);
alter table ehr.project alter column reqname TYPE varchar(200);

alter table ehr.project alter column protocol TYPE varchar(200);

alter table ehr.protocol_counts alter column protocol TYPE varchar(200);

alter table ehr.requests alter column title TYPE varchar(200);

alter table ehr.tasks alter column title TYPE varchar(200);

alter table ehr.qcstatemetadata alter column qcstatelabel TYPE varchar(200);

alter table ehr.formpanelsections alter column formtype TYPE varchar(200);
alter table ehr.formpanelsections alter column destination TYPE varchar(200);
alter table ehr.formpanelsections alter column title TYPE varchar(200);

alter table ehr.formtemplaterecords alter column storeid TYPE varchar(1000);

alter table ehr.formtemplates alter column title TYPE varchar(200);
alter table ehr.formtemplates alter column formtype TYPE varchar(200);

alter table ehr.notificationrecipients alter column notificationtype TYPE varchar(200);

alter table ehr.notificationtypes alter column notificationtype TYPE varchar(200);

--add container columns:
alter table ehr.supplemental_pedigree add column container entityid;

--update the wisconsin site - only active EHR user
update ehr.supplemental_pedigree p set container = (select entityid from core.containers where name = 'EHR');

/* EHR-11.36-11.37.sql */

CREATE TABLE ehr.status
(
  rowid SERIAL NOT NULL,
  label varchar(200) NOT NULL,
  description varchar(4000),
  publicdata boolean DEFAULT false,
  draftdata boolean DEFAULT false,
  isdeleted boolean DEFAULT false,
  isrequest boolean DEFAULT false,
  allowfuturedates boolean DEFAULT false,
  CONSTRAINT pk_status PRIMARY KEY (rowid)
);

INSERT INTO ehr.status (rowid, label, description, publicdata, draftdata, isdeleted, isrequest, allowfuturedates)

(select q.rowid, q.label, q.description, q.publicdata, m.draftdata, m.isdeleted, m.isrequest, m.allowfuturedates
from study.qcstate q left join ehr.qcstatemetadata m on q.label = m.QCStateLabel);

--drop table ehr.qcstatemetadata;