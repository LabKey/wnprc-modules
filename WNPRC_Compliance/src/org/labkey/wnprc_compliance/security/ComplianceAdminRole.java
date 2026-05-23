/*
 * Copyright (c) 2018-2026 Board of Regents of the University of Wisconsin System
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
package org.labkey.wnprc_compliance.security;

import org.labkey.api.security.roles.AbstractRole;

/**
 * Created by jon on 2/13/17.
 */
public class ComplianceAdminRole extends AbstractRole {
    public ComplianceAdminRole() {
        super("WNPRC Compliance Admin",
                "This role allows a user to manage all data in the WNPRC Compliance Module.",
                ComplianceAdminPermission.class);
    }
}
