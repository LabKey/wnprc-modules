# Animal Integration Into The CageUI

Currently, a dump file for all info related to integrating animal moves into the cageUI project.

## Housing Conditions
- Animals can have multiple housing conditions assigned to them.
- Each animal should display both dividers codes and actual housing condition codes.
- When a housing change is made on the cage:
    - Update condition codes for all animals in the cage.
    - Show a popup reminder to check the lock before proceeding.
    - Refer to the flow chart doc on how housing changes perform

## Condition Codes
 - Each animal has their own condition codes
### Categories
1. Pairing Codes (e.g., single, pair, group, GI, etc)
2. Caging Codes (e.g., breeding, PC, VC)

### Special Notes:
- Choosing Research codes 2, 3, 13 requires selecting a project number.
- Putting code 13 generates a B condition code (Breeding).

## Transfers
- Paired animals should be included in transfers.
  - Paired animals count as any of the following
    - Grouped (3+ animals)
    - Paired (2 animals)
    - PC (Protected Contact)
    - VC (Visual Contact)
    - Breeding
- On the next page of the transfer process, include destinations for all animals involved.
- Separate sections are needed for each animal in the transfer form.
- Users can remove animals from the form or choose "no change."
- Transfer "Performed By", autofill but editable (text field) as "performed by" can have multiple initials

## Record Keeping
- When adding an animal to a new room:
    - Bring in animals from the destination room/cage onto the housing form.
- In dates take the new date, and old records mark the out date with the new in date.

## Special Rooms
- Blacklist special rooms for specific housing conditions.
- Room X is reserved for all special rooms, with the actual room noted in remarks.

## Permissions & Alerts
- Condition codes should be locked (permission-based: managers, colony records, Kim, Alisha).
- Alert notifications are required for overrides.
- Users cannot move an animal under research unless it's part of a research project, except with manager/supervisor permission.

## Alerts/Reports
- Generate alerts for any record with remarks filled.
- Create a daily report for colony records about animal transfers that include remarks or research details.
- Code 26 must have a remark and should appear in daily reports.
- Behavioral codes (9, 26) require remarks if special housing is involved.

## Breeding
- Breeding code 13 opens and 14 ends.
- If an animal is coming out of breeding without selecting code 14, display a popup reminder to select it.

## Additional Notes
- Remove XS code after discussing with ASD meeting.


# New Table/Old Table Update Plan

What new tables are required to complete the integration?


What old tables can be used to complete the integration?

## Handling Condition Codes
- study.housing
  - Issues with the current table
    - Each animal in the record is only allowed one condition code. This violates the rule that animals can have multiple codes.
      - Solutions?
        - Housing codes are strictly for housing, new table to hold multiple condition codes.
        - Extend a new column for each category of condition codes.
          - Add category to ehr_lookups.housing_condition_codes
- study.demographics
  - Issues
    - Same with housing, each animal has one condition code
    - No history of past housing
- study.ActiveHousing
  - Issues
    - No history
    - same with housing, each animal has only one condition
      - Solutions?
        - Same as housing table

### Proposal

I think that the best option here given the options is to extend columns onto the housing tables.
Both study.housing and study.ActiveHousing will need these columns, possibly demographics as well.

I am not sure why demographics has condition codes as a column when the same data can be found from ActiveHousing or Housing.
Possibly rework demographics to remove the dependencies on the condition code.

I think separating the housing condition codes into two categories is the best option. This will require one extensible column.
Might require a script to fix data from the original old column.

1. Caging Codes
2. Pairing Codes

Suggestion: Keep old column as pairing Codes, new column is caging codes.

Here is a list of codes that belong to each column

1. Caging Codes
   - VC
   - PC
   - GPC
2. Pairing Codes
   - C
   - S
   - P
   - B
   - PI
   - PIA
   - PM
   - PMA
   - PF
   - P
   - GMF
   - GM
   - GF
   - GMA
   - G
   - GI
   - GIA
   - GB
   - GBI
   
This is a list of codes found in ehr_lookups.housing_condition_codes that do not yet appear in the flowchart. 

These are possibly unused codes? or has not yet been explained. Ask questions to resolve these codes.

Codes:
- AF: with adopted father
- AM: with adopted mother
- F: with the father
- M: with the mother
- GAF: in a group with adopted father
- GAM: in a group with adopted mother
- GAMAF: in a group with adopted mother and adopted father
- GAMF: in group with father and adopted mother
- GBIAF: mother/dam in group breeding with adopted infant and father/sire
- GMAF: in a group with the mother/dam and adopted father/sire
- GMAFA: infant in group with adopted mother/dam and adopted father/sire
- GMFA: infant in a group with mother/dam and adopted father/sire
- PFA: infant paired with adopted father/sire