# Tables Structure

This markdown describes the table structure in the cageUI module, what each table is meant for and how it is used. The
markdown tables listed under each table provide short descriptions on what each column is used for.

## CageUI Schema Tables

These are the tables used by the project within the CageUI Schema.

### Racks
This table represents the racks at the center. Our cages are not removable from racks but they do not have
individual cage ids. Therefore, we have this racks table to act as a wrapper for our cages to determine their 
type and default sizes, since all cages in a rack are the same size.

| objectid                | room                                                                                                     | rackid                                                                                                                                      | rack_type                               | condition                                                                                                      |
|-------------------------|----------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------|----------------------------------------------------------------------------------------------------------------|
| Unique ID for the rack. | Room the rack is currently in, This can be null to represent that the rack is currently not in any room. | Id of the rack. This should be unique for the rack type but if you have different id systems for different rack types this allows for that. | Self explanatory this is the rack type. | Condition of the rack (ex. broken). We have three conditions which you'll see later in the ehr_lookups schema. |

### Rack Types
This table represents the different rack types that are available for racks to be assigned. It holds information about the rack.

| displayName                                                                                                                                                                                   | type                                                            | Manufacturer         | Stationary                                      | length                 | width                 | height                 | size                                                                                                         | sqft                  | 
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|----------------------|-------------------------------------------------|------------------------|-----------------------|------------------------|--------------------------------------------------------------------------------------------------------------|-----------------------|
| Name of the rack type combining several columns into a string so the users have a detailed view of what they are choosing. This is how it is built: {type}-{manufacturer}-{size}-{stationary} | Caging type. This is explained more in the ehr lookups section. | Creators of the rack | Determines if the rack is movable between rooms | Length of cage in rack | Width of cage in rack | Height of cage in rack | Cage size in rack. Our users use this instead of exact sqft to determine if animals can fit inside the cage. | Exact sqft dimensions | 


### Cages
This table was created as an alternative to ehr_lookups.cages since for our center we had improper formatting of certain columns
within that table causing issues. With some work you can probably use the labkey provided cages table, but this allows for 
greater customization of the cages table. If you do use ehr_lookups.cages you will have to add the missing columns to that table via extensible columns, and ensure
they are updated correctly. This table is a list of all cages at the center.

For length, width and height. The numbers here represent the true value of the cage size. The rack type dimensions provide 
a starting default value. Since adding certain modifications changes cage size, that updated size will be reflected here.

| objectid           | positionid                                                          | Rack                           | cage_number                                     | length                                   | Width                                   | Height                                   | sqft                                   | 
|--------------------|---------------------------------------------------------------------|--------------------------------|-------------------------------------------------|------------------------------------------|-----------------------------------------|------------------------------------------|----------------------------------------|
| Unique ID for cage | position of cage within rack goes left to right from top to bottom. | Which rack the cage belongs to | Modifiable number for the cage within the room. | Length of cage, changed by modifications | Width of cage, changed by modifications | Height of cage, changed by modifications | Sqft of cage, changed by modifications |


### Cage Modifications
List of available modifications that can be placed on cages.

| value                  | title | direction                                     | type                  |
|------------------------|-------|-----------------------------------------------|-----------------------|
| Short unique text name | title | Direction the modification can be applied to. | Type of modification. |

The important columns here are mainly direction and type. Two modifications of the same type can not exist on the same 
cage mod location. Meaning you can't place two dividers on the same side of the cage. Direction shows where the modification
might be available from. If I have cage 1 above cage 2 then only modifications with a vertical direction can be placed on this side.
Direct directions are placed directly on the cage itself and have no connections to other cages. Our center uses a one modification
limit where you usually can not have multiple modifications on the same cage location with a few exceptions.
One exception is different types, meaning you can have a vertical separator and a vertical attachment on the same location.
We also do not have multiple direct modifications, meaning there is a limit of one direct modification on a cage at once.

### All History
This is the top level history table. It holds a start and end date along with the original history id that is linked to 
other tables. It also describes if the room is valid, (WIP, you will have to use this at your own discretion with your own
validation). 

| room             | history_type                                              | valid                                 | start_date               | end_date                                              | historyid                                                        |
|------------------|-----------------------------------------------------------|---------------------------------------|--------------------------|-------------------------------------------------------|------------------------------------------------------------------|
| Room for history | Determines if the history is a real room or template room | Determines if the room has any issues | Start date of the layout | end_date of the layout (null if it is current layout) | Unique ID that links to other tables to build a complete history |

### Room History
This is the history table that holds data about the room border and size.

| historyid                  | scale           | border_width        | border_length        |
|----------------------------|-----------------|---------------------|----------------------|
| historyid from all_history | Room size scale | Width of the border | Length of the border |

### Layout History
This is the history table that holds coordinates of cages or room objects for real rooms. As well as any extra context.

| historyid                  | cage                        | object_type                                                                                                                | extra_context                               | x_coord                            | y_coord                            |
|----------------------------|-----------------------------|----------------------------------------------------------------------------------------------------------------------------|---------------------------------------------|------------------------------------|------------------------------------|
| historyid from all_history | Real cage within the layout | Type of object that the coords belong to. Since this history contains cages and objects it can be any placeable item type. | Any extra context attached to cages/objects | Global x coordinate of cage/object | Global y coordinate of cage/object |

### Template Layout History
Since templates don't contain real cages the history table is easier to maintain and we can just use ids to maintain the cages/objects. This is why we keep separate histories for both tables. 

| historyid                  | rack_group              | group_rotation                    | rack                                                  | cage                                                           | object_type                          | extra_context          | x_coord                            | y_coord                            |
|----------------------------|-------------------------|-----------------------------------|-------------------------------------------------------|----------------------------------------------------------------|--------------------------------------|------------------------|------------------------------------|------------------------------------|
| historyid from all_history | Rack group for the cage | Rotation of the rack for the cage | rack id for cages rack (not real rack in racks table) | cage number for template layout (not real cage in cages table) | type of object the coords belongs to | Extra context for item | Global x coordinate of cage/object | Global y coordinate of cage/object |


### Rack History
History table for the racks within a layout.

| historyid                  | objectid                         | room                                                                                                  | condition      | Notes                                  |
|----------------------------|----------------------------------|-------------------------------------------------------------------------------------------------------|----------------|----------------------------------------|
| historyid from all_history | Racks object id from racks table | Room for rack, if this is null it means the rack was removed from the room during that history change | Rack condition | Any notes applied to the rack by users |

This table is updated by a trigger script when the racks table is updated, this keeps a history of changes.
### Cage History
History table for the cages within a layout.

| historyid                  | rack_group                         | group_rotation            | cage                           | cage_number          | length | width | height | sqft |
|----------------------------|------------------------------------|---------------------------|--------------------------------|----------------------|--------|-------|--------|------|
| historyid from all_history | The rack group that the cage is in | Current rotation for cage | cage objectid from cages table | cage number for cage | Length | Width | Height | sqft |

This table is updated by a trigger script when the cages table is updated, this keeps a history of changes.

### Cage Modifications History

| historyid                  | cage                           | modid                          | parent_modid                                                         | modification                                         | subid                                        | location                          |
|----------------------------|--------------------------------|--------------------------------|----------------------------------------------------------------------|------------------------------------------------------|----------------------------------------------|-----------------------------------|
| historyid from all_history | Cage objectid from cages table | Unique id for the modification | This is also a unique id for the modification. Explained more below. | Modification value from the cage_modifications table | subsection id for mod, explained more below. | Location on cage for modification |

For some modifications they are applied to two cages. Consider a divider shared between two cages A and B. 
This divider is technically applied to both cages, the right side of A and the left side of B. The modid would be a 
unique id for both mods, but if I change the modification from cage A then the parent_modid that appears on the modification
history for cage B would have cage A modid. This allows us to track where the modification was changed from and the original change.

Next to explain is subid. The subid (subsection id) is used for larger cages. Our pen cage template is 8x8 cells; this means
that two 4x4 cell cages can be next to it and each of those cages can have a different modification. In our pens case this means
that each side has two lines in the svg that can have different modifications. The subid determines what subsection has which mod.
A subsection is a line within the svg file that follows the path of left -> right or top -> down. These lines have to be 
 referenced exactly by id when changing modifications, so the system knows what line to edit when changing mods. Take a look
at the pen svg file to gain an understanding of this.


## EHR Lookups Schema Tables
Below are the tables added to ehr_lookups to provide available options for certain columns within the cageui schema tables.
The values in these tables are also stored as enums for development purposes so ensure that they are in sync for the best results.

### CageUI Condition Codes
Rack status conditions such as operational, damaged, etc

### CageUI Item Types
Available item types that can be placed within a layout. For "Caging" items ensure there is a real and default type.
Description in this lookup refers to the "size" of the caging unit. Since all our caging units are squares this size is the 
LxW of cells that the unit occupies on the layout.

### CageUI Modification Directions
Direction that a modification goes between.

Vertical means the mod is applied vertically between two cages.

Horizontal means the mod is applied horizontally between two cages.

Direct means the mod is applied directly on the cage and not between two cages.


### CageUI Modification Locations
Available locations of the modification with respect to cages.
Left, right, top, bottom, direct. Self-explanotory this column is used by the modifications history to determine where
on the cage the modification is located.

### CageUI Modification Types
Type of modification, Attachment or separator. Separators are usually dividers/floors between cages.
Attachments are added onto the cage. Attachments can go between multiple cages, an example of this is CTunnels.

### CageUI Rack Manufacturers
Manufacturers of racks used by rack types table.

