# WNPRC Modules (for LabKey)

This repository includes all the custom LabKey modules developed by the WNPRC for use in the EHR system. Each subfolder contains a separate module.

## Building the WNPRC Modules

To build the WNPRC EHR modules for development:

  1. Follow the instructions to [set up a LabKey development machine](https://labkey.org/Documentation/wiki-page.view?name=devMachine).
  1. From the **LabKey root directory**:
      1. Switch to the **release17.2** branch from SVN:
          ```bash
          svn switch ^/branches/release17.2
          ```
      1. Clone this repo into the external modules directory:
          ```bash
          git clone https://github.com/WNPRC-EHR-Services/wnprc-modules.git externalModules/wnprc-modules
          ```
      1. Add the following to **settings.gradle**, somewhere around line 70:
          ```gradle
          BuildUtils.includeModules(this.settings, [
                   ":externalModules:labModules:laboratory"
                  ,":externalModules:labModules:LDK"
                  ,":externalModules:labModules:Viral_Load_Assay"
                  ,":server:customModules:ehr"
                  ,":server:customModules:EHR_ComplianceDB"
          ])
          
          include 'externalModules:wnprc-modules'
          file('externalModules/wnprc-modules').listFiles().findAll { d ->
              d.isDirectory() && (new File(d.getAbsolutePath(), 'build.gradle')).exists()
          }.each { d ->
              include "externalModules:wnprc-modules:${d.getName()}"
          }
          ```
      1. Build LabKey proper, with the lab modules included:
          ```bash
          ./gradlew deployApp
          ```
      1. Build our modules:
          ```bash
          ./gradlew :externalModules:wnprc-modules:deployModules
          ```
      
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
  
    
