# Setup ehrcron image

This docker service rans the backup scripts for the LabKey server. It mainly uses Perl to access the DBMS to backup the database that is running the system.

To enable the back cron job go to folder `scripts/pg_backup` copy and rename the file `lkbackup.default` to `lkbackup.ini` and replace with the correct credentials to be able to ran the backups to both a folder in the host machine and a remote drive in the network.
Also the .env file contains the location of the back directory in the local computer and on the remote shared drive.

Docker Hub has two repositories that use this Dockerfile, one for production and a second one for test server. The variable PERL_PROD in the .env file is use to determine which repo the server will use. If the variable is set to prod, the server will pull from wnprcehr/ehrcronprod, if the variable is empty the server will pull the image from wnprcehr/ehrcron. 

The lkbackup.ini has three different sections:  
`[general]` passes credentials for Perl to connect to the DBMS  
`[lk_config]` configuration of the LabKey service  
`[file_rotation]` variables for the rotation on the two different locations
