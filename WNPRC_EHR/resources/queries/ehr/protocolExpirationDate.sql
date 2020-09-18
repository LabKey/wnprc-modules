-- noinspection SqlNoDataSourceInspectionForFile

/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

 --we add 3 years to the approve date to get the expiration date
SELECT
  p.protocol,
  TIMESTAMPADD('SQL_TSI_YEAR', 3, p.approve) as expirationDate

FROM ehr.protocol p
