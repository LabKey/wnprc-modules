/*
 * Copyright (c) 2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
module.exports = {
    apps: [
        {
            name: 'RequestEntry',
            title: 'WNPRC Purchasing',
            permissionClasses: ['org.labkey.api.security.permissions.InsertPermission'],
            path: './src/client/RequestEntry',
        },
    ],
};
