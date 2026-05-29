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
package org.labkey.wnprc_ehr.security.roles;

import org.labkey.api.ehr.security.*;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.security.SecurableResource;
import org.labkey.api.security.permissions.DeletePermission;
import org.labkey.api.security.permissions.InsertPermission;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.security.permissions.UpdatePermission;
import org.labkey.api.security.roles.AbstractRole;
import org.labkey.api.study.Dataset;
import org.labkey.wnprc_ehr.WNPRC_EHRModule;

/**
 * Created by jon on 7/21/16.
 */
public class WNPRCFullSubmitterWithReviewerRole extends AbstractRole {
    public WNPRCFullSubmitterWithReviewerRole() {
        this("EHR Full Submitter With Reviewer", "Users with this role are permitted to submit and approve records.  They cannot modify public data, but can edit and delete Request for Review records",
                ReadPermission.class,
                InsertPermission.class,
                UpdatePermission.class,
                DeletePermission.class,

//                EHRAbnormalDeletePermission.class,
                EHRAbnormalInsertPermission.class,
                EHRAbnormalUpdatePermission.class,
//                EHRCompletedDeletePermission.class,
                EHRCompletedInsertPermission.class,
//                EHRCompletedUpdatePermission.class,
//                EHRDeleteRequestedDeletePermission.class,
                EHRDeleteRequestedInsertPermission.class,
                EHRDeleteRequestedUpdatePermission.class,
                EHRInProgressDeletePermission.class,
                EHRInProgressInsertPermission.class,
                EHRInProgressUpdatePermission.class,
//                EHRRequestCompleteDeletePermission.class,
                EHRRequestCompleteInsertPermission.class,
                EHRRequestCompleteUpdatePermission.class,
                EHRRequestApprovedDeletePermission.class,
                EHRRequestApprovedInsertPermission.class,
                EHRRequestApprovedUpdatePermission.class,
                EHRRequestSampleDeliveredInsertPermission.class,
                EHRRequestSampleDeliveredUpdatePermission.class,
                EHRRequestSampleDeliveredDeletePermission.class,
                EHRRequestDeniedDeletePermission.class,
                EHRRequestDeniedInsertPermission.class,
                EHRRequestDeniedUpdatePermission.class,
                EHRRequestCancelledDeletePermission.class,
                EHRRequestCancelledInsertPermission.class,
                EHRRequestCancelledUpdatePermission.class,
                EHRRequestPendingDeletePermission.class,
                EHRRequestPendingInsertPermission.class,
                EHRRequestPendingUpdatePermission.class,
                EHRReviewRequiredDeletePermission.class,
                EHRReviewRequiredInsertPermission.class,
                EHRReviewRequiredUpdatePermission.class,
                EHRScheduledDeletePermission.class,
                EHRScheduledInsertPermission.class,
                EHRScheduledUpdatePermission.class
        );

        excludeGuests();
    }

    protected WNPRCFullSubmitterWithReviewerRole(String name, String description, Class<? extends Permission>... perms) {
        super(name, description, WNPRC_EHRModule.class, perms);
    }

    @Override
    public boolean isApplicable(SecurableResource resource)
    {
        return resource instanceof Dataset &&
                ((Dataset)resource).getContainer().getActiveModules().contains(ModuleLoader.getInstance().getModule(WNPRC_EHRModule.class));
    }
}
