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
docker build -t wnprcehr/labkeyXX.X --build-arg LABKEY_TEAMCITY_USERNAME=<your username> --build-arg LABKEY_TEAMCITY_PASSWORD=<your password> labkey
```

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

