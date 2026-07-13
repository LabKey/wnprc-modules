# Housing Table Switch

This markdown explains the switch in detail about the housing table, the new temporary cageUI housing table, and
how they are connected.

In order to test animal transfers we are going to create a duplicate housing table just for the new cageUI submission
testing. Users will need to submit housing transfers in both the old and new way during this trial phase.
Once the testing is over we will disable the old housing form, and require all housing transfers be submitted on the new 
form. In the code we will change all the references from the new form back to the old form for the cageUI submissions.

This is a list of all uses of the housing table in EHR, we will need to duplicate these in the cageUI project
using the new housing form to ensure everything is working and to understand what changes we will need to have done
in order for the switch to fully work.

Housing Table:
- validateHousing function in EHR trigger script helper
- appendHousingAtTimeCol in defaultEHRCustomizer
- AddScheduleWaterWindow.js
- All housing table queries/views
  - ActiveHousing
  - 

Cages table:
- AddScheduleWaterWindow.js

