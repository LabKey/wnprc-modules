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
