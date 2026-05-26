/*
 *
 *  * Copyright (c) 2026 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

module.exports = {
    apps: [
        {
            name: "home",
            title: "Cage Display",
            permissionClasses: ['org.labkey.api.security.permissions.ReadPermission'],
            path: './src/client/pages/home'
        },
        {
            name: "editLayout",
            title: "Room Layout Editor",
            permissionClasses: [
                'org.labkey.api.security.permissions.ReadPermission',
                'org.labkey.cageui.security.permissions.CageUILayoutEditorAccessPermission',
            ],
            path: './src/client/pages/layoutEditor'
        },
        {
            name: "updateRackStatus",
            title: "Update Rack Status",
            permissionClasses: [
                'org.labkey.api.security.permissions.ReadPermission',
            ],
            path: './src/client/pages/updateRackStatus'
        },
        {
            name: "housingTransfer",
            title: "Housing Transfer",
            permissionClasses: [
                'org.labkey.api.security.permissions.ReadPermission',
                'org.labkey.cageui.security.permissions.CageUIAnimalEditorPermission'
            ],
            path: './src/client/pages/housingTransfer'
        }
    ]
};
