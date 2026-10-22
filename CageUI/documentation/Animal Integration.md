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
Update the condition code table to include categories and assignments.

Right now we have four categories; pairing, special, social, and caging codes.

Three assignments: any, infant, adult.

Only animals that fit the assignment can have that code (some codes are "duplicates" but from different perspectives)


We will create a new table in cageUI module called housing_condition_records. One row in this table
is equal to one row in the housing table to hold that housing records codes. We can write a calculated column
to produce a user-friendly code based on the categories.