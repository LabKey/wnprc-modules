# Non-Schema Module Updates

Occasionally, we need to perform updates that are not necessarily related to a schema created by the module, but do
involve data in the database or changes to datasets in the `study` schema. Those updates are perhaps best done in 
the Java code of the module rather than in the schema update, and that is what the classes in this folder
(/src/java/org/labkey/wnprc_ehr/updates) is designed to handle.

### General Overview

In general, updates/upgrades to modules in LabKey are handled by three overrideable methods defined in the 
`org.labkey.api.module.Module` interface:

  |   |   |
  |---:|---|
  |`beforeUpdate(ModuleContext ctx)`|Called in reverse dependency order on **all** modules before executing subsequent steps|
  |`versionUpdate(ModuleContext ctx)`|Called in no particular order, after **all** modules have executed the before update step|
  |`afterUpdate(ModuleContext ctx)`|Called immediately following the update on a given module, regardless of the completion of any other module updates|
  
The code in this package--comprised of the two components listed below--leverages those steps to execute its non-schema-related updates at the appropriate time, 
including an additional hook for executing any update-related work that needs to wait until all updates have completed
and the module has started up:

  |   |   |   |
  |---|---|---|
  |`org.labkey.wnprc_ehr.updates.ModuleUpdate`|Class|Utility class used to invoke any applicable updates in the package, based on the versions provided by the context.|
  |`org.labkey.wnprc_ehr.updates.ModuleUpdate.Updater`|Interface|Interface defining the functions to be executed at the corresponding steps for a particular version update.|
  
To use these classes, we invoke the corresponding static `doXxxxUpdate` methods on the `ModuleUpdate` class from the 
`beforeUpdate`, `versionUpdate`, and `afterUpdate` methods defined in the `Module` itself, as well as calling 
`ModuleUpdate.onStartup` from the module's startup method (for WNPRC EHR, that's `doStartupAfterSpringConfig`). 

Those
static methods will in turn find all implementations of `ModuleUpdate.Updater` in the `org.labkey.wnprc_ehr.updates` 
package (via reflection), invoke each implementation's `applies(ModuleContext ctx)` method (to get the list of applicable
updaters), and will call the update method on each updater corresponding to the static method, in the order of the values
returned by each updater's `getTargetVersion()` method.

>NOTE: `getTargetVersion()` returns a `double`, so it allows for only two digit groups (e.g., XXX.YYY) rather than an arbitrary
>number, such as would be allowed by SemVer-style versioning (i.e., we cannot use versions like "3.9.20")

By convention, updater implementations should be named with the target version in the classname--for example, an updater
with a target version of "2.3" should be named `UpdateTo2_3`.   