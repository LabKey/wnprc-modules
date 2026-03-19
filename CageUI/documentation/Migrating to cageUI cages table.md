

# Housing Changes

### 1. Add New Cage Column
#### A.
We have to remove the old cage table that is used in ehr_lookups with the new cage table in the cageui module. 
For the WNPRC this change needed to be done in the following files.

1. >WNPRC_EHR/resources/queries/study/Housing.query.xml
2. >WNPRC_EHR/resources/queries/study/Housing/.qview.xml
3. >WNPRC_EHR/resources/queries/study/Housing/Active Housing.qview.xml
4. >WNPRC_EHR/resources/queries/study/Housing/Current Housing Plus Weight.qview.xml
5. >WNPRC_EHR/resources/referenceStudy/study/datasets/datasets_metadata.xml
6. >WNPRC_EHR/resources/web/ehr/metadata/Default.js
7. >WNPRC_EHR/resources/web/ehr/metadata/Metadata.js
8. >WNPRC_EHR/resources/web/wnprc_ehr/wnprcOverRides.js

#### B.
After changing these files, go into the table definition editor in EHR and rename the cage column to cageOld.
Then add a new column named cage. This will rename the previous cage column while preserving the data and 
allowing us to work with the new cage column under the old name.

As we add new data to the housing table we should insert it under the new column if using the new housing system.
If using the old housing system, insert it under the old column. This will allow us to use the old housing system while
testing the new system until we are ready to switch over to the new housing system.

At the WNPRC we will only be using the new system in a select few rooms for testing. Unfortunately, the users will have
to submit their housing changes under both systems during this phase until we are ready to switch over. This will ensure
data integrity.

### 3. Cage Details
Add override for cageDetails.html and cageDetails.view.xml including new cages table instead of cages from ehr_lookups.


Next go through and update the links so they point to your module instead of "ehr". 
Add rooms.query.xml file to your ehr_lookups schema and edit the url there as well.

Old: 
>/ehr/WNPRC/EHR/cageDetails.view?room=a140a&cage=0001

New: 
>/wnprc_ehr/WNPRC/EHR/cageDetails.view?room=a140a&cage=0001


