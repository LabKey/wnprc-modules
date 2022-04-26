# WNPRC Modules (for LabKey)

This repository includes all the custom LabKey modules developed by the WNPRC for use in the EHR system. Each subfolder contains a separate module.

## Building the WNPRC Modules

To build the WNPRC EHR modules for development:

  1. Follow the instructions to [set up a LabKey development machine](https://labkey.org/Documentation/wiki-page.view?name=devMachine).
  1. From the **LabKey root directory**:      
      1. Clone this repo into the external modules directory:
          ```bash
          git clone https://github.com/WNPRC-EHR-Services/wnprc-modules.git externalModules/wnprc-modules
          ```
      1. Add the following to **~/.gradle/gradle.properties**:
          ```gradle
          moduleSet=../../externalModules/wnprc-modules/gradle/settings/wnprc
      1. Build LabKey, which includes all of our modules, too:
          ```bash
          ./gradlew deployApp
          ```
From there, all standard Gradle rules apply; you can build individual modules or even individual steps. For example:
```bash
# deploy our modules only
./gradlew :externalModules:wnprc-modules:deployModules

# build just the WNPRC_EHR module
./gradlew :ext:wnp:WNPRC_EHR:build

# re-run webpack for the breeding module
./gradlew :ext:wnp:bre:webpack

```