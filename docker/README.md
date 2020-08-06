# Creating and Using Docker Images

This folder contains a set of Docker images and a Docker Compose service definition to start and run a LabKey server like the one used at the WNPRC. Each of the subfolders corresponds to a particular service/image used in the Compose definition (e.g., `postgres/` contains configuration information for the PostgreSQL service), and the Gradle build file helps to build the custom images that do not come from any online Docker repository (such as LabKey and our own custom cron service).

Any service-specific configuration needs to be defined in a `.env` file in this directory, with a pre-built example file provided in `default.env`. Before deploying the services with Compose, you will need to create this `.env` file (e.g., by copying and renaming `default.env`).

The following files need to be rename to use SSL certificates in your local development machine: `cert.pem.default` and `key.pem.default` both files have to be rename to remove the .default . The names have to match the names in `.env` file.

## Building the Custom Images

To build the custom images from a stand-alone clone, navigate to the **docker** folder (**not** the repository root) and execute the following command:
```
./gradlew build
```
From a clone embedded inside a LabKey SVN checkout, you will need to execute the command from the LabKey root, with the appropriate adjustments to the project path:
```
./gradlew :externalModules:wnprc-modules:docker:build
```
Each of the custom images has its own build task as well (e.g., `buildLabkey`, `buildEhrcron`).

Other than using Gradle, the images can each be built directly using Docker by executing a command like this:
```
docker build -t wnprcehr/ehrcron:vX.X.X ehrcron
```
If  changes are only committed to TeamCity or a new based LabKey build needs to be create, use --no-cache option.
```
docker build --no-cache -t wnprcehr/labkey:vX.X.X labkey
```

#### Special Instructions for the LabKey Image

The following build arguments are available for use. The ones that have default values are shown with their defaults. These arguments can be passed by using the --build-arg flag as shown later in this section.

```
LABKEY_TEAMCITY_USERNAME
LABKEY_TEAMCITY_PASSWORD
LABKEY_VERSION=17.2
LABKEY_IS_PREMIUM=false
WNPRC_BRANCH=master
```

The LabKey Docker image requires some extra information in order to download the latest build of LabKey from LabKey's TeamCity server--specifically *your* TeamCity credentials.

To provide those credentials to Gradle for the Gradle builds (the most convenient way) you should add the following properties to your user-specific Gradle configuration (in `~/.gradle/gradle.properties`), without the angle brackets:
```
labkeyTeamcityUsername=<your username>
labkeyTeamcityPassword=<your password>
```

To build using Docker directly, you will need to pass those same credentials as run-time build arguments on the command line:
```
docker build \
    --build-arg LABKEY_TEAMCITY_USERNAME=<your username> \
    --build-arg LABKEY_TEAMCITY_PASSWORD=<your password> \
    -t wnprcehr/labkey:XX.X labkey
```
If you want to build an images for an specific branch within Github, you should pass one additional argument `--build-arg WNPRC_BRANCH`. Your commands will look something like this, use the name of the branch without the fb prefix, the name should match as how TeamCity creates the image:
```
docker build \
    --build-arg LABKEY_TEAMCITY_USERNAME=<your username> \
    --build-arg LABKEY_TEAMCITY_PASSWORD=<your password> \
    --build-arg WNPRC_BRANCH=develop \
    -t wnprcehr/labkeyDev:XX.X labkey
```

The LabKey build also requires the official Oracle Java Server JRE image, which is only available via Docker Hub if you accept the terms and conditions of use from Oracle directly. In order to get the image, you will need:

  1. An account on the [Docker store](https://store.docker.com)
  1. A "purchased" copy of the (free) [Oracle Java 8 SE (Server JRE)](https://store.docker.com/images/oracle-serverjre-8) image.

You will also need to login via the Docker CLI (`docker login`) with your username and password from the Docker website. Be advised that if you are using `sudo` to execute Docker commands as the super user, you'll need to `sudo docker login` as well.

## Deploying the Docker Compose Services

To deploy the services, you again either use Gradle or use Docker Compose directly. To use Gradle, execute the following build tasks:
```
# for spinning up all the services
./gradlew :docker:up

# for tearing down all the services
./gradlew :docker:down
```
To use Docker Compose, you can execute commands like the following (*from this directory*, where your `.env` file is located):
```
# for spinning up all the services
docker-compose up -d

# for tearing down all the services*
docker-compose down

# for spinning up just one of the services (e.g., postgres)
docker-compose up -d postgres

# for taking down just one of the services (e.g., postgres)
docker-compose stop postgres
```
All other Docker Compose commands (`logs`, `ps`, etc.) work also.

*Note that sometimes the postgres container closes before the database itself is completely shut down. Be sure to disconnect your pgAdmin and IntelliJ database connections, if any, stop labkey, and then do a shutdown. Otherwise the next time postgres starts it will go into an automatic recovery mode and take a long time to start back up.

## Running multiple instances of LabKey in same Server

We created a folder called `development` in this repo. This folder contains a simplify version of the main `docker-compose` file. It only has two services: labkey and ngnix. To start a secondary version of labkey in the test server. Copy the development folder, and rename it to particular project. Within the new folder, you have to edit three of files:

 1. `.env`
 1. `nginx/nginx.conf`
 1. `docker-compose.yml`

In the `.env` file, edit the following variables: `LABKEY_DANGER_PORT` to other number than 8080, this is the port which Labkey service will use outside the Docker container. `LABKEY_SECURE_PORT` this port is the one user will need to add to the test server URL to access your instance of LabKey (e.g. https://test-ehrvm.primate.wisc.edu:8443). List of ports and databases used for each instance of LabKey in the test-server can be found in this private page: [Test_Servers](https://github.com/WNPRC-EHR-Services/EHR_Documentation/blob/master/sop/Test_Servers.md). Update the list once your instance is up and running. `LK_BASE_URL` to a unique name for your new labkey service, it has to match the name you will modify in the `docker-compose` file. `PG_NAME` to a database you are planning to use with your new instances of LabKey.

In the `ngnix.conf` file you need to edit the following: `proxy_pass` at the end of the file, to the name you have selected for your new service, it also has to match the name on your `docker-compose` and `.env` files.

Finally, in your `docker-compose` file edit the name of the labkey service, it should be unique, therefore check other development folder for all the names used.

## Loading a Database Backup Using the Script

Along with the Docker-specific utilities in this folder, there is a (Bash-only) script to restore a database backup into a local Docker container: **load_database_backup.sh**. By default, this script will download the latest backup from the production server (assumed to have been created the same day at 1AM) and restore that backup into a PostgreSQL container as defined in the docker-compose.yml and .env files in this folder. Depending on resource on local machine or server, it is possible to increase the number of processors for the restore process. Change the number in line 132 right after -j option, by default is set to 4 processes.

The script has very few options, as shown in these examples:
```bash
# download the latest backup into the default docker-compose project. this
# assumes 'produser' is a user on the production server with access to the backups,
# and will request the password for produser (unless you have other authentication
# set up for the production server)
./load_database_backup.sh -u produser

# restore the specified local dump into the 'test' docker-compose project
./load_database_backup.sh -f /path/to/dumpfile.pg -p test

# restore using a specific version of postgres--pass the bin folder, not the executable--and
# do not delete the tmp folder after the restore finishes (for debugging)
./load_database_backup.sh --postgres /usr/etc/postgresql94/bin/ --debug
```
The use of the `-p` flag allows us to use this script to manage multiple instances of the LabKey PostgreSQL container on the same server, provided that each instance is run from its own folder with its own .env file (to specify ports, data file locations, etc.)

## Additional Configurations

In some instance, the shared memory and effective cache size should be modified for dev machines. In the docker/postgres/postgresql.cong file modify line shared_buffers and effective_cache_size to 1024MB and 2048MB respectively.

```
shared_buffers = 1024MB			# min 128kB

effective_cache_size = 2048MB
```
