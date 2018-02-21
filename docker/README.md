# Creating and Using Docker Images

This folder contains a set of Docker images and a Docker Compose service definition to start and run a LabKey server like the one used at the WNPRC. Each of the subfolders corresponds to a particular service/image used in the Compose definition (e.g., `postgres/` contains configuration information for the PostgreSQL service), and the Gradle build file helps to build the custom images that do not come from any online Docker repository (such as LabKey and our own custom cron service).

Any service-specific configuration needs to be defined in a `.env` file in this directory, with a pre-built example file provided in `default.env`. Before deploying the services with Compose, you will need to create this `.env` file (e.g., by copying and renaming `default.env`).

## Building the Custom Images

To build the custom images from a stand-alone clone, navigate to the parent folder (the repository root) and execute the following command:
```
./gradlew :docker:build
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

#### Special Instructions for the LabKey Image

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
    -t wnprcehr/labkeyXX.X labkey
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

# for tearing down all the services
docker-compose down

# for spinning up just one of the services (e.g., postgres)
docker-compose up -d postgres

# for taking down just one of the services (e.g., postgres)
docker-compose stop postgres
```
All other Docker Compose commands (`logs`, `ps`, etc.) work also.

## Loading a Database Backup Using the Script

Along with the Docker-specific utilities in this folder, there is a (Bash-only) script to restore a database backup into a local Docker container: **load_database_backup.sh**. By default, this script will download the latest backup from the production server (assumed to have been created the same day at 1AM) and restore that backup into a PostgreSQL container as defined in the docker-compose.yml and .env files in this folder.

The script has very few options, as shown in these examples:
```bash
# download the latest backup into the default docker-compose project. this
# assumes 'produser' is a user on the production server with access to the backups,
# and will request the password for produser (unless you have other authentication 
# set up for the production server)
./load_database_backup.sh -u produser


# restore the specified local dump into the 'test' docker-compose project
./load_database_backup.sh -f /path/to/dumpfile.pg -p test
```
The use of the `-p` flag allows us to use this script to manage multiple instances of the LabKey PostgreSQL container on the same server, provided that each instance is run from its own folder with its own .env file (to specify ports, data file locations, etc.)



