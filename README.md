# WNPRC Modules (for LabKey)

This repository includes all the custom LabKey modules developed by the WNPRC for use in the EHR system. Each subfolder contains a separate module.

## Build Prerequisites

In order to build the WNPRC EHR modules, the following steps are required:

  1. Checkout the `release17.2` branch from the LabKey SVN repository.
  1. Edit the `settings.gradle` file in the root to uncomment/include the following lines (around line 70):
      ```gradle
      BuildUtils.includeModules(this.settings, 
          rootDir, BuildUtils.EHR_EXTERNAL_MODULE_DIRS, excludedExternalModules)
      BuildUtils.includeModules(this.settings, 
          [":server:customModules:ehr", ":server:customModules:EHR_ComplianceDB"])
       ```
  
  1. Execute the following gradle build commands from the context of the SVN root:
      ```bash
      ./gradlew :externalModules:labModules:LDK:publishLibsPublicationToMavenLocal
      ./gradlew :server:customModules:ehr:publishLibsPublicationToMavenLocal
      ```
      
In order to run it, we assume you have Docker installed (see the next section for more on that).
      
# Using the `:docker` Build Tasks

This project is set up assuming the following architecture:

  1. There is a "release" copy of tomcat/LabKey running somewhere in development mode, which has its `externalModules` directory linked to `build/modules`.
  1. There is a postgres daemon running somewhere, connected to that tomcat/LabKey server.
  
In order to ease that setup, the repo contains a Dockerfile for a "labkey" image and a docker-compose that sets up the system with the appropriate volumes mounted for local development. To run it, do the following:

  1. Set the following variables in your `~/.gradle/gradle.properties` file:
      ```gradle
      labkeyTeamcityUsername=<your username>
      labkeyTeamcityPassword=<your password>
      ```
  1. Execute `:docker:build`. You will only need to do this once, to build and store the Docker image.
  1. Execute `:docker:up` to start the server. This will look at the `docker-compose.yml` file in the docker folder and will start the LabKey image built by the previous step as well as a default postgres database container, hooking the two together and exposing LabKey at `http://localhost:8080`. Any modules built using `:deployModule` will be automatically loaded by LabKey, due to the `build/modules` folder being mounted as a volume in the LabKey container.
  1. Execute `:docker:down` to bring the server down. This will shut down both LabKey and postgres.
  
Otherwise, all docker and docker-compose commands apply; for example, to see the logs for the LabKey container, one would execute the following command from the project root:

```bash
docker-compose -f docker/docker-compose.yml logs -f labkey
```
  
    
