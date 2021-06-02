# Setup ehrcron image

This docker service rans the backup scripts for the LabKey server. It mainly uses Perl to access the DBMS to backup the database that is running the system.

To enable the back cron job go to folder `scripts/pg_backup` copy and rename the file `lkbackup.default` to `lkbackup.ini` and replace with the correct credentials to be able to ran the backups to both a folder in the host mahcine and a remote drive in the network.

The lkbackup.ini has three different sections:  
`[general]` passes credentials for Perl to connect to the DBMS  
`[lk_config]` configuration of the LabKey service  
`[file_rotation]` variables for the rotation on the two different locations
