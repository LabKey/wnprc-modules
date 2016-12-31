/*
 * Copyright (c) 2015-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT labwork_services.servicename,
labwork_services.dataset,
labwork_services.chargetype,
labwork_services.tissue,
labwork_services.collectionmethod,
labwork_services.method,
labwork_services.alertOnComplete,
labwork_services.outsidelab,
labwork_services.datedisabled
FROM labwork_services
WHERE labwork_services.datedisabled > curdate() OR labwork_services.datedisabled IS NULL