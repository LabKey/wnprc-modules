# Setup ehrcron image

This service rans the backup system for our LabKey server. It mainly uses Perl to access the DBMS to backup the database that is running the system.

To enable the back cron job go to folder `scripts/pg_backup` copy and rename the file `lkbackup.default` to `lkbackup.ini` and replace with the correct credentials to be able to ran the backups of the system.
