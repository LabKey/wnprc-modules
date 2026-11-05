/*
 * Copyright (c) 2026 Board of Regents of the University of Wisconsin System
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
package org.labkey.wnprc_ehr.etl;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.di.TaskRefTaskImpl;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.pipeline.PipelineJob;
import org.labkey.api.pipeline.RecordedActionSet;
import org.labkey.api.query.SimpleValidationError;
import org.labkey.api.query.ValidationError;

import java.util.ArrayList;
import java.util.List;

/**
 * Permanently deletes EHR records whose QC state is 'Delete Requested', or 'Request: Denied' and stale.
 * Replaces docker/ehrcron/scripts/deleteStudyRecords/deleteStudyRecords.pl.
 */
public class DeleteRequestedRecordsTask extends TaskRefTaskImpl
{
    @Override
    public RecordedActionSet run(@NotNull PipelineJob job)
    {
        // TODO: port deleteStudyRecords.pl — every study dataset plus ehr.tasks, ehr.requests, and ehr.cage_observations
        job.warn("Deleting requested records is not yet implemented");
        return new RecordedActionSet(makeRecordedAction());
    }

    @Override
    public List<ValidationError> preFlightCheck(Container c)
    {
        List<ValidationError> errors = new ArrayList<>(super.preFlightCheck(c));
        if (!c.equals(EHRService.get().getEHRStudyContainer(c)))
            errors.add(new SimpleValidationError("Folder " + c.getPath() + " is not the EHR study container"));
        return errors;
    }
}
