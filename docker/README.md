# Creating and Using Docker Images

This folder contains a set of folders with Dockerfiles and a Compose file which define services to start and run a LabKey server like the one used at the WNPRC. Each of the subfolders corresponds to a particular service/image used in the Compose definition (e.g., `postgres/` contains configuration information for the PostgreSQL service), and the Gradle build file helps to build the custom images that do not come from any online Docker repository (such as LabKey and our own custom cron service).

Any service-specific configuration needs to be defined in a `.env` file in this directory, with a pre-built example file provided in `default.env`. All the variables in the `default.env` file have a prefix to the corresponding service (e.g. LK = LabKey, PG = postgres) and they are all organized alphabetically to make it easier to group all variables that affect the different services. Before deploying the services with Compose, you will need to create the `.env` file (e.g., by copying and renaming `default.env`).

The following files need to be rename to use SSL certificates in your local development machine: `cert.pem.default` and `key.pem.default` both files have to be rename to remove the .default . The names have to match the names in `.env` file.

## Downloading Docker Images from Docker Hub

WNPRC maintains a service contract with Docker Hub. This contract allows the IDS unit to build images in this cloud service thus not requiring to locally build images in our production server, test environment and developer machines. The contract allows for five accounts to be associated with the WNPRCEHR Organization. The  `idsshared` account can be used to download and access our private LabKey images (i.e. [labkeysnapshot](https://hub.docker.com/repository/docker/wnprcehr/labkeysnapshot/general) and [labkey](https://hub.docker.com/repository/docker/wnprcehr/labkey/general)), the token and password for that account can be found in `Keypass-IDS.kdbx` in the `wnprc.drive.wisc.edu` shared folder.

Another alternative is to login via the Docker CLI (`docker login`) with the shared username and password. Gradle tasks can login to Docker Hub without the need to type the password but the credentials need to be stored in the gradle.properties. It is best to use a token and/or a password saved on the user's home folder file called `~/.gradle/gradle.properties`, this is the same file used during the LabKey development setup. Add the following lines replacing the data inside brackets.

```
dockerhubUsername=idsshared
dockerhubPassword=<dockerPassword>
dockertokenpath=<dockerhubToken>
```
For a list of all the task use the following commands:

```
./gradlew tasks
```

Docker images can be downloaded from Docker Hub using the following commands, user has to be logged into Docker Hub as explained in the previous chapter. All Gradle tasks to interact with the Docker engine locally have two versions, one using a [plugin](https://github.com/bmuschko/gradle-docker-plugin) and the second one uses direct command line via the Docker CLI. Thus, all the tasks defined in the `build.gradle` file have two versions. Either of the following commands download all the custom images managed by the IDS unit.

```
./gradlew downloadAll
./gradlew downloadAllPlug
```

To download a specific image from a feature branch use the following commands replacing the Labkey version (i.e. XX.YY = 24.11) and the name of the branch inside the brackets:
```
./gradlew downloadLabkey -PbranchName=<XX.YY_fb_name>
./gradlew dowloadLabkeyPlug -PbranchName=<XX.YY_fb_name>

./gradlew downloadEhrcron -PbranchName=<XX.YY_fb_name> 
./gradlew downloadEhrcronPlug -PbranchName=<XX.YY_fb_name>
```

## Building the Custom Images

To build the custom images from a stand-alone clone, navigate to the **docker** folder (**not** the repository root) and execute the following command:
```
./gradlew buildAll -PbranchName=<XX.YY_fb_name>
```
From a clone embedded inside a LabKey development setup with all the source code, you will need to execute the command from the LabKey root, with the appropriate adjustments to the project path:
```
./gradlew :externalModules:wnprc-modules:docker:buildall -PbranchName=<XX.YY_fb_name>
```
Each of the custom images has its own build task as well (e.g., `buildLabkey`, `buildEhrcron`) and all have corresponding tasks using the pluging (e.g. `buildEhrcronPlug`, `buildPostfixPlug`). The Labkey and ehrcranrnutils images depend on hooks (`~/hooks/build`) which is used in Docker Hub to correctly interpret GitHub branches naming convencion and build the image for the correct architecture (i.e., arm64 and adm64). This same hook is used by the gradle task to download the correct LabKey installer from TeamCity and create the corresponding Docker image. These build tasks does not have a companion option using the plugin version.

For newer Apple Silicon all docker images can be built for ARM processors or as multi-platform builds by using the platform argument. Before building a multi-platform version a new builder has to be created.
```
docker buildx create --name=container 
```
This builder uses an emulator to create images for AMD processor. In the Apple Silicon the build process for AMD images take longer therefore is best to just use arm64 or the default builder.
```
--platform linux/arm64
--platform linux/arm64,linux/amd64
```  

Other than using Gradle, the images can each be built directly using Docker by executing a command like this:
```
docker build -t wnprcehr/ehrcron:vX.X.X ehrcron
docker build --builder container --platform linux/arm64 -t wnprcehr/cranrnutils:cranrnutils_YY.MM_featureBranch --load cranrnutils
```
If  changes are only committed to TeamCity or a new based LabKey build needs to be created, use --no-cache option. To build localy, you must obtain the URL to download the installer from TeamCity. The Dockerfile connects to TeamCity using a set of credentials and downloads the LabKey installer.
```
docker build --build-arg LABKEY_TEAMCITY_USERNAME=<teamcityUser> --build-arg LABKEY_TEAMCITY_PASSWORD=<teamCityPWD> --build-arg TEAMCITY_URL=<Z> --build-arg TOMCAT_IMAGE=<TOMCAT_IMAGE> --build-arg LK_VERSION=<LK_VERSION> --no-cache --rm=true -t wnprcehr/labkey:XX.YY labkey
```

#### Special Instructions for the LabKey Image

The following build arguments are available for use. These arguments can be passed by using the --build-arg flag as shown later in this section.

```
LABKEY_TEAMCITY_USERNAME
LABKEY_TEAMCITY_PASSWORD
LK_VERSION=21.11
TOMCAT_IMAGE
TEAMCITY_URL
```

The LabKey Docker image requires some extra information in order to download the latest build of LabKey from LabKey's TeamCity server--specifically *your* TeamCity credentials.

To provide those credentials to Gradle for the Gradle builds (the most convenient way) you should add the following properties to your user-specific Gradle configuration (in `~/.gradle/gradle.properties`), without the angle brackets:
```
labkeyTeamcityUsername=<your username>
labkeyTeamcityPassword=<your password>
```

To build using Docker directly, you will need to pass those same credentials as run-time build arguments on the command line:
```
docker build                                                        \
--builder container --platform linux/arm64,linux/amd64              \
--build-arg LABKEY_TEAMCITY_USERNAME=<your username>                \
--build-arg LABKEY_TEAMCITY_PASSWORD=<your password>                \
--build-arg TEAMCITY_URL=<Teamcity url to download installer>       \
--build-arg FB_NAME=<Feature_Branch>                                \
--build-arg LK_VERSION=<YY.MM> --no-cache --rm=true --load          \
-t wnprcehr/labkey:YY.MM_Feature_Branch labkey
```
If you want to build an image for a specific branch within Github, you should pass one additional argument `--build-arg TOMCAT_IMAGE`. Your commands will look something like this, use the name of the branch without the fb prefix, the name should match as how TeamCity creates the image:
```
docker build \
    --build-arg LABKEY_TEAMCITY_USERNAME=<your username> \
    --build-arg LABKEY_TEAMCITY_PASSWORD=<your password> \
    --build-arg TOMCAT_IMAGE=fb_ \
    -t wnprcehr/labkeyDev:XX.X labkey
```

The LabKey image depends on the Tomcat image, which can be dowloaded from Docker Hub or built locally. This image takes a long time to build from scratch, it is best to download it from Docker Hub. Here are the commands to download or build this image.
```
./gradlew downloadCranr -PbranchName=<XX.YY_fb_name>
./gradlew downloadTomcatPlug -PbranchName=<XX.YY_fb_name>

./gradlew buildCranr -PbranchName=<XX.YY_fb_name>
./gradlew buildCranrPlug -PbranchName=<XX.YY_fb_name>

docker build --no-cache -t wnprcehr/tomcat:tomcat9_<XX.YY_fb_name> tomcat
```


## Deploying the Docker Compose Services
There are several services controlled by the compose.yaml and production.yaml files. Splitting the Docker services in these two files allows us to use the same GitHub repository in two different servers without having to make changes locally except for changes in the `.env` file. 

The Docker services ran in production EHR, nightly-ehr and test servers are the following:
||Service|Functionality|YAML File|Repository|
|---|---|---|---|---|
|1|postgres|database|compose.yaml|[postgres](https://hub.docker.com/_/postgres)|
|2|labkey|Application|compose.yaml|[labkeysnapshot](https://hub.docker.com/repository/docker/wnprcehr/labkeysnapshot/general)|
|3|cadvisor|Monitor server resources|compose.yaml|[Google cadvisor](https://github.com/google/cadvisor/releases)|
|4|mailcatcher|Applicaton to record emails sent by server|compose.yaml||
|5|mailserver|Postfix mail erver|compose.yaml||
|6| ngnix|Web server|compose.yaml||
|7| perlscripts|Manage cron jobs for backups and delete records|production.yaml|[ehrcronprod](https://hub.docker.com/repository/docker/wnprcehr/ehrcronprod/general), [ehrcron](https://hub.docker.com/repository/docker/wnprcehr/ehrcron/general)|



Docker images including LabKey version number and branch are control by variables defined in the `.env` file. The compose (i.e. `compose.yaml`) file has the following string for the LabKey service `wnprcehr/labkey${LK_PROD}:$LK_VERSION${LK_FB}`. LK_PROD has to be empty except for the production environment which gets replace with **SNAPSHOT**. LK_VERSION gets replace with the version of LabKey that is going to be used (i.e. 24.11) and LK_FB get the name of the feature branch to test, in production LK_FB is blank. In production this string gets converted to `wnprcehr/labkeysnapshot:22.11` which match the tag in Docker Hub for the [labkeysnapshot repository](https://hub.docker.com/repository/docker/wnprcehr/labkeysnapshot/tags?page=1&ordering=last_updated). For feature branches the string gets converted to `wnprcehr/labkey:22.11_<feature_branch_name>` with the corresponding fb name coming from GitHub, these images are hosted in the [labkey repository](https://hub.docker.com/repository/docker/wnprcehr/labkey/tags?page=1&ordering=last_updated) with their corresponding tags.

To deploy the services, you again either use Gradle or use Docker Compose directly. To use Gradle, execute the following build tasks:
```
# for spinning up all the services
./gradlew :docker:up

# for tearing down all the services
./gradlew :docker:down
```
To use Docker Compose, you can execute commands like the following (*from this directory*, where your `.env` file is located), these commands will work on the production server as well as the other servers:
```
# for spinning up all the services in production server
docker compose -f compose.yaml -f production.yaml up -d

# for tearing down all the services in production server*
docker compose -f compose.yaml -f production.yaml down --timeout 60
```

Add `-f compose.yaml -f production.yaml` to make changes in the production server. If this is not added the system will provide a warning that there are orphan services running.
```
# for spinning up all the services
docker compose up -d

# for tearing down all the services*
docker compose down --timeout 60

# for spinning up just one of the services (e.g., postgres)
docker compose up -d postgres

# for taking down just one of the services (e.g., postgres)
docker compose stop postgres --timeout 60

# for removing just one of the services this makes sure the system uses the latest version (e.g., postgres)
docker compose rm postgres --timeout 60

# for accesing running services to inspect changes use the following commands (e.g., labkey or postgres)
docker compose exec labkey /bin/bash
```
All other Docker Compose commands (`logs`, `ps`, etc.) work also.

*Note that sometimes the postgres container closes before the database itself is completely shut down. Be sure to disconnect your pgAdmin and IntelliJ database connections, if any, stop labkey, and then do a shutdown. Otherwise the next time postgres starts it will go into an automatic recovery mode and take a long time to start back up. By adding a timeout of 60 seconds it allows the database to close every connection, shutdown gracefully and avoid the recovery process. 

## Docker setup in production EHR
Running EHR in the production mode, requires  different images for ehrcron and the **SNAPSHOT** version of LabKey. The verison of LabKey is controlled by the following variables stored in `.env` file: `LK_PROD`, `LK_VERSION` and `LK_FB`. These varaibles get replace in the following string `wnprcehr/labkey${LK_PROD}:$LK_VERSION${LK_FB}` during runtime. The string becomes `wnprcehr/labkeysnapshot:24.11` which are the tags in this [repo](https://hub.docker.com/repository/docker/wnprcehr/labkeysnapshot/tags). The version of ehrcron image is also controlled by the `.env` file. The variables `PERL_PROD`, `LK_VERSION` and `LK_FB` are used to modify the name of the image defined in the `production.yaml` file from `wnprcehr/ehrcron$PERL_PROD:$LK_VERSION${LK_FB}` to `wnprcehr/ehrcronprod:24.11`. These are the tags defined in this [repo](https://hub.docker.com/repository/docker/wnprcehr/ehrcronprod/general). The ehrcronprod image has the following scheduled jobs:
1. Email notifications - deprecated April, 2025
1. Delete records with QCStatus of ` Delete Requested` from all study datasets
1. Backup script which rans overnight


## Running multiple instances of LabKey in same Server

We created a folder called `development` in this repo. This folder contains a simplify version of the main `compose.yaml` file. It only has two services: labkey and ngnix. To start a secondary version of labkey in the test server. Copy the development folder, and rename it to particular project. Within the new folder, you have to edit three files:

 1. `.env`
 1. `nginx/nginx.conf`
 1. `compose.yaml`

In the `.env` file, edit the following variables: `LK_DANGER_PORT` to a number other than 8080, this is the port which LabKey service will use outside the Docker container. `LK_SECURE_PORT` this port is the one users will need to add to the test server URL to access your instance of LabKey (e.g. https://.primate.wisc.edu:8443). List of ports and databases used for each instance of LabKey in the test-server can be found in this private page: [Test_Servers](https://github.com/WNPRC-EHR-Services/EHR_Documentation/blob/master/sop/Test_Servers.md). Update the list once your instance is up and running. `LK_BASE_URL` to a unique name for your new LabKey service, it has to match the name you will modify in the `compose.yaml` file. `PG_NAME` to a database you are planning to use with your new instances of LabKey.

In the `ngnix.conf` file you need to edit the following: `proxy_pass` at the end of the file, to the name you have selected for your new service, it also has to match the name on your `compose.yaml` and `.env` files.

Finally, in your `compose.yaml` file edit the name of the LabKey service, it should be unique, therefore check other development folders for all the names used.

All the auxiliary LabKey instances can be managed via the manage_all_continers.sh script. This script accepts two values (i.e., -s || -d), `-s` - starts all the containers in the docker folder and `-d` - shuts down all the instances running in the server. This script starts with the primary which contains postgres and than looks for any folder that has the prefix dev.

## Loading a Database Backup Using the Script

Along with the Docker-specific utilities in this folder, there is a (Bash-only) script to restore a database backup into a local Docker container: **load_database_backup.sh**. By default, this script will download the latest backup from the production server (assumed to have been created the same day at 1AM) and restore that backup into a PostgreSQL container as defined in the docker-compose.yml and .env files in this folder. Depending on the resources on the local machine or server, it is possible to increase the number of processors for the restore process. Change the number in line 132 right after -j option, which by default is set to 4 processes.

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

## Configuration of nightly-ehr.primate.wisc.edu

This server is configured to update every night after the production server completes a complete backup and moves the created file to a long term ITSS storage (i.e., `PrimateFS`). The script called `load_database_update_testserver.sh` is based on `load_database_backup.sh` and it is configured to run as a cron job in the `nightly-ehr.primate.wisc.edu` server by the root user. 

To check the current configuraion type: `sudo crontab -l`. To modify the configuration type: `sudo crontab -e`.

The script uses multiple parameters: `-postgres` - location of postgres executable (i.e., /usr/lib/postgresql/15/bin/), `--dbname` - name of the database to replace, `--jobs` - number of processes to run the backup, `--production` - restore a complete database, `--path` - location of the backup files (~/labkey_backup/database/daily/). 

The script also downloads the latest image of LabKeySnapshot from Docker Hub and cleans all the old images from the local image repository. 

## Additional Configurations

In some instance, the shared memory and effective cache size should be modified for dev machines. In the docker/postgres/postgresql.cong file modify line shared_buffers and effective_cache_size to 1024MB and 2048MB respectively.

```
shared_buffers = 1024MB			# min 128kB

effective_cache_size = 2048MB
```
