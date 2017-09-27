/*
 * Copyright (c) 2011-2013 LabKey Corporation
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
package org.labkey.ehr.security;

import org.labkey.api.ehr.security.*;
import org.labkey.api.security.Group;
import org.labkey.api.security.permissions.DeletePermission;
import org.labkey.api.security.permissions.InsertPermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.security.permissions.UpdatePermission;

/**
 * User: bbimber
 * Date: March 22, 2011
 */
public class EHRFullSubmitterRole extends AbstractEHRDatasetRole
{
    public EHRFullSubmitterRole()
    {
        super("EHR Full Submitter", "Users with this role are permitted to submit and approve records.  They cannot modify public data.",
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
//                EHRReviewRequiredDeletePermission.class,
                EHRReviewRequiredInsertPermission.class,
                EHRReviewRequiredUpdatePermission.class,
                EHRScheduledDeletePermission.class,
                EHRScheduledInsertPermission.class,
                EHRScheduledUpdatePermission.class
        );

        addExcludedPrincipal(org.labkey.api.security.SecurityManager.getGroup(Group.groupGuests));
    }
}
