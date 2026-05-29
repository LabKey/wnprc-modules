/*
 * Copyright (c) 2021-2026 Board of Regents of the University of Wisconsin System
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
package org.labkey.wnprc_ehr.security.roles;

import org.labkey.api.security.permissions.Permission;
import org.labkey.api.security.roles.AbstractRole;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;
import org.labkey.wnprc_ehr.security.permissions.WNPRCAnimalRequestsEditPermission;
import org.labkey.wnprc_ehr.security.permissions.WNPRCAnimalRequestsViewPermission;

public class WNPRCAnimalRequestsRole extends AbstractRole
{

        public WNPRCAnimalRequestsRole(){
                this("WNPRC Animal Requests", "Role for viewing/editing animal request items", WNPRCAnimalRequestsViewPermission.class, WNPRCAnimalRequestsEditPermission.class);
        }

        protected WNPRCAnimalRequestsRole(String name, String description, Class<? extends Permission>... perms) {
                super(name, description, WNPRC_EHRModule.class, perms);
        }

}
