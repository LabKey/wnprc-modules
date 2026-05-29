/*
 * Copyright (c) 2016-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
e.employeeid,
e.LastName,
e.FirstName,
e.Email,
e.Title,
e.Unit,
e.Category,
e.Location,
e.OfficePhone

FROM "/WNPRC/WNPRC_Units/Animal_Services/Compliance_Training/Private/EmployeeDB/".ehr_compliancedb.employees e

WHERE

e.EndDate is null