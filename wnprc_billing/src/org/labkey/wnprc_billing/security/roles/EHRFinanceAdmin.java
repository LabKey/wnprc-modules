/*
 * Copyright (c) 2023-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.labkey.wnprc_billing.security.roles;

import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.security.permissions.UpdatePermission;
import org.labkey.api.security.roles.AbstractRole;
import org.labkey.wnprc_billing.security.permissions.EHRFinanceAdminPermission;

public class EHRFinanceAdmin extends AbstractRole {
    public EHRFinanceAdmin() {
        super("EHR Finance Admin",
                "This role allows users to modify the current program income account.",
                EHRFinanceAdminPermission.class
        );
//        super("EHR Finance Admin",
//                "This role allows users to modify the current program income account.",
//                EHRFinanceAdminPermission.class
//        );
    }
}