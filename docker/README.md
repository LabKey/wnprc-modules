# Creating and Using Docker Images

This folder contains a set of Docker images and a Docker Compose service definition to start and run a LabKey server like the one used at the WNPRC. Each of the subfolders corresponds to a particular service/image used in the Compose definition (e.g., `postgres/` contains configuration information for the PostgreSQL service), and the Gradle build file helps to build the custom images that do not come from any online Docker repository (such as LabKey and our own custom cron service).

Any service-specific configuration needs to be defined in a `.env` file in this directory, with a pre-built example file provided in `default.env`. All the variables in the `default.env` file has a prefix to the corresponding service (e.g. LK = labkey, PG = postgres) and they are all organized alphabetically to make it easier to group all variables that affect the different services. Before deploying the services with Compose, you will need to create this `.env` file (e.g., by copying and renaming `default.env`).

The following files need to be rename to use SSL certificates in your local development machine: `cert.pem.default` and `key.pem.default` both files have to be rename to remove the .default . The names have to match the names in `.env` file.

## Downloading Docker Images from Docker Hub

WNPRC maintains a service contract with Docker Hub. This allows the IDS unit to build images in this cloud service thus not requiring to locally build images in our production server, test environment and developer machines. The contract allows for five accounts to be associated with the WNPRCEHR Organization. The  `idsshared` account can be used to download and access our private LabKey images (i.e. [labkeysnapshot](https://hub.docker.com/repository/docker/wnprcehr/labkeysnapshot/general) and [labkey](https://hub.docker.com/repository/docker/wnprcehr/labkey/general)), the token and password for that account can be found in `Keypass-IDS.kdbx` in the `wnprc.dirve.wisc.edu` shared folder.

Another alternative is to login via the Docker CLI (`docker login`) with the shared username and password. Gradle tasks can login to Docker Hub without the need to type the password. 

All the docker images can be downloaded from Docker Hub using the following commands, user has to be login into Docker Hub. It is best to use a token and/or a password saved on the user's home folder file called `~/.gradle/gradle.properties` by adding the following lines.

```
dockerhubUsername=idsshared
dockerhubPassword=<dockerPassword>
dockertokenpath=<dockerhubToken>
```

Gradle tasks to interact with Docker have two versions, one using a [plugin](https://github.com/bmuschko/gradle-docker-plugin) and the second one uses direct command line via the Docker CLI. All the tasks defined in the `build.gradle` file have the two flavors. Either of the following command downloads all the custom images manage by the IDS unit.

```
./gradlew downloadAll
./gradlew downloadAllPlug
```

To download a specific images from a feature branch use the following commands replacing the Labkey version (i.e. XX.YY = 22.11) and the name of the branch inside the brackets:
```
./gradlew downloadLabkey -PdockerString=<XX.YY_fb_name>
./gradlew dowloadLabkeyPlug -PdockerString=<XX.YY_fb_name>

./gradlew downloadEhrcron -PdockerString=<XX.YY_fb_name> 
./gradlew downloadEhrcronPlug -PdockerString=<XX.YY_fb_name>
```

For a list of all the task use the follwowing commands:

```
./gradlew tasks
```

## Building the Custom Images

To build the custom images from a stand-alone clone, navigate to the **docker** folder (**not** the repository root) and execute the following command:
```
./gradlew buildAll -PdockerString=<XX.YY_fb_name>
```
From a clone embedded inside a LabKey platform source code, you will need to execute the command from the LabKey root, with the appropriate adjustments to the project path:
```
./gradlew :externalModules:wnprc-modules:docker:buildall -PdockerString=<XX.YY_fb_name>
```
Each of the custom images has its own build task as well (e.g., `buildLabkey`, `buildEhrcron`) and all have corresponding tasks using the pluging (e.g. `buildEhrcronPlug`, `buildPostfixPlug`). The Labkey images depends on a hook (`docker/labkey/hooks/build`) which is used in Docker Hub to correctly interprete GitHub branches naming convencion. This same hook is used by the gradle task to download the correct LabKey installer and create the Docker image. This build tasks does not have a companion option using the plugin.

Other than using Gradle, the images can each be built directly using Docker by executing a command like this:
```
docker build -t wnprcehr/ehrcron:vX.X.X ehrcron
```
If  changes are only committed to TeamCity or a new based LabKey build needs to be create, use --no-cache option. To build localy, you must obtain the URL to download the installer from TeamCity. The Dockerfile connect to TeamCity using a set of credentials and downloads the LabKey installer.
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
docker build \
    --build-arg LABKEY_TEAMCITY_USERNAME=<your username> \
    --build-arg LABKEY_TEAMCITY_PASSWORD=<your password> \
    -t wnprcehr/labkey:XX.X labkey
```
If you want to build an images for an specific branch within Github, you should pass one additional argument `--build-arg TOMCAT_IMAGE`. Your commands will look something like this, use the name of the branch without the fb prefix, the name should match as how TeamCity creates the image:
```
docker build \
    --build-arg LABKEY_TEAMCITY_USERNAME=<your username> \
    --build-arg LABKEY_TEAMCITY_PASSWORD=<your password> \
    --build-arg TOMCAT_IMAGE=fb_ \
    -t wnprcehr/labkeyDev:XX.X labkey
```

The LabKey image depends on the Tomcat image, which can be dowload from Docker Hub or build locally. This image takes a long time to build from scratch, it is best to download it from Docker Hub. Here are the commands to download or build this image.
```
./gradlew downloadTomcat -PdockerString=<XX.YY_fb_name>
./gradlew downloadTomcatPlug -PdockerString=<XX.YY_fb_name>

./gradlew buildTomcat -PdockerString=<XX.YY_fb_name>
./gradlew buildTomcatPlug -PdockerString=<XX.YY_fb_name>

docker build --no-cache -t wnprcehr/tomcat:tomcat9_<XX.YY_fb_name> tomcat
```


## Deploying the Docker Compose Services
Docker images including LabKey version number and branch are control by variables defined in the .env file. The compose (i.e. `compose.yaml`) file has the following string for the LabKey service `wnprcehr/labkey${LK_PROD}:$LK_VERSION${LK_FB}`. LK_PROD has to be empty except for the production environment which gets replace with **SNAPSHOT**. LK_VERSION gets replace with the version of LabKey that is going to be used (i.e. 22.11) and LK_FB get the name of the branch to test, in production this variable is blank. In production this string gets converted to `wnprcehr/labkeysnapshot:22.11` which match the tag in Docker Hub for the [labkeysnapshot repository](https://hub.docker.com/repository/docker/wnprcehr/labkeysnapshot/tags?page=1&ordering=last_updated). For feature branches the string gets converted to `wnprcehr/labkey:22.11_<feature_branch_name>` with the corresponding fb name coming from GitHub, these images are hosted in the [labkey repository](https://hub.docker.com/repository/docker/wnprcehr/labkey/tags?page=1&ordering=last_updated) with their corresponding tags.

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
docker compose up -d

# for tearing down all the services*
docker compose down

# for spinning up just one of the services (e.g., postgres)
docker compose up -d postgres

# for taking down just one of the services (e.g., postgres)
docker compose stop postgres
```
All other Docker Compose commands (`logs`, `ps`, etc.) work also.

*Note that sometimes the postgres container closes before the database itself is completely shut down. Be sure to disconnect your pgAdmin and IntelliJ database connections, if any, stop labkey, and then do a shutdown. Otherwise the next time postgres starts it will go into an automatic recovery mode and take a long time to start back up.

## Running multiple instances of LabKey in same Server

We created a folder called `development` in this repo. This folder contains a simplify version of the main `compose.yaml` file. It only has two services: labkey and ngnix. To start a secondary version of labkey in the test server. Copy the development folder, and rename it to particular project. Within the new folder, you have to edit three of files:

 1. `.env`
 1. `nginx/nginx.conf`
 1. `compose.yaml`

In the `.env` file, edit the following variables: `LK_DANGER_PORT` to other number than 8080, this is the port which Labkey service will use outside the Docker container. `LK_SECURE_PORT` this port is the one user will need to add to the test server URL to access your instance of LabKey (e.g. https://.primate.wisc.edu:8443). List of ports and databases used for each instance of LabKey in the test-server can be found in this private page: [Test_Servers](https://github.com/WNPRC-EHR-Services/EHR_Documentation/blob/master/sop/Test_Servers.md). Update the list once your instance is up and running. `LK_BASE_URL` to a unique name for your new labkey service, it has to match the name you will modify in the `compose.yaml` file. `PG_NAME` to a database you are planning to use with your new instances of LabKey.

In the `ngnix.conf` file you need to edit the following: `proxy_pass` at the end of the file, to the name you have selected for your new service, it also has to match the name on your `compose.yaml` and `.env` files.

Finally, in your `compose.yaml` file edit the name of the labkey service, it should be unique, therefore check other development folder for all the names used.

All the auxiliary LabKey instances can be manage via the manage_all_continers.sh script. This script accepts two values (-s || -d), s starts all the containers in the docker folder. Starts with the primary which contains postgres and than looks for any folder that starts with dev.

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
