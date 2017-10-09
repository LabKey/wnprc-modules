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