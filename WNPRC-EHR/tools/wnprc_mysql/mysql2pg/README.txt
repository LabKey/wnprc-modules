this folder contains scripts designed to dump all WNPRC mySQL tables to TSV files,
then import them into a postgres schema called col_dump

it does not create the postgres tables.  it was modified from the existing study export scripts
located in the tools folder of the EHR module.   see the included col_dump.sql file to create the
expected postgres schema.

batchtsv.sh will dump all mySQL tables to TSV files
generatetsv.sh is called by batchtsv.sh

importdata.sh should be run second.  it will import all of the TSV files created above and import into postgres

these scripts were originally created during the period when the mySQL system was being synced daily into LabKey.
they are no longer necessary, as the legacy mySQL system has been turned off.