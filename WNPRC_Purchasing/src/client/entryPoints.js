/*
 * Copyright (c) 2020-2026 Board of Regents of the University of Wisconsin System
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
