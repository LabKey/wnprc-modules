/*
 * Copyright (c) 2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
module.exports = {
    apps: [{
        name: 'app',
        title: 'Animal Request Form',
        permissionClasses: ['org.labkey.api.security.permissions.ReadPermission'],
        path: './src/client',
    }]
};