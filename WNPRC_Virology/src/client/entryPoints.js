/*
 * Copyright (c) 2023-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
module.exports = {
    apps: [
        {
            name: 'DropdownSelect',
            title: 'Virology Frontend Page',
            permissionClasses: ['org.labkey.api.security.permissions.InsertPermission'],
            path: './src/client/AccountsForm',
            generateLib: true
        },
    ],
};

