-- wnprc-21.006-21.007.sql was added after wnprc-22.000-22.001.sql, in which case wnprc-21.006-21.007.sql would not run on some dev machines
-- this script is a correct conditionalized version of what wnprc-21.006-21.007.sql intended to achieve
alter table wnprc.animal_requests add column if not exists pregnantanimalsrequiredterminfant varchar(100);
alter table wnprc.animal_requests add column if not exists pregnantanimalsrequiredtermdam varchar(100);
alter table wnprc.animal_requests add column if not exists majorsurgery varchar(100);
alter table wnprc.animal_requests add column if not exists previousexposures text;
alter table wnprc.animal_requests add column if not exists contacts text;
