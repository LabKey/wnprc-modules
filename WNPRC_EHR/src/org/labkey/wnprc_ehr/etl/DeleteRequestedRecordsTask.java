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
import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.di.TaskRefTaskImpl;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.pipeline.PipelineJob;
import org.labkey.api.pipeline.RecordedActionSet;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.SimpleValidationError;
import org.labkey.api.query.UserSchema;
import org.labkey.api.query.ValidationError;
import org.labkey.api.security.User;
import org.labkey.api.study.Dataset;
import org.labkey.api.study.StudyService;
import org.labkey.api.view.ViewContext;


import java.sql.SQLException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Date;


/**
 * Permanently deletes EHR records whose QC state is 'Delete Requested', or 'Request: Denied' and stale.
 * Replaces docker/ehrcron/scripts/deleteStudyRecords/deleteStudyRecords.pl.
 */
public class DeleteRequestedRecordsTask extends TaskRefTaskImpl
{
    private static final boolean DRY_RUN = false;

    @Override
    public RecordedActionSet run(@NotNull PipelineJob job)
    {
        // 1. Setup.
        Container c = job.getContainer();
        User u = job.getUser();
        UserSchema study = QueryService.get().getUserSchema(u, c, "study");
        UserSchema ehr = QueryService.get().getUserSchema(u, c, "ehr");
        Date oneDayAgo = Date.from(LocalDate.now().minusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant());

        // 2. Gets datasets to clean out:
        //      - Every dataset in 'study'
        //      - ehr.tasks
        //      - ehr.requests
        //      - ehr.cage_observations
        Map<TableInfo, String> tables = new LinkedHashMap<>();
        for (Dataset ds : StudyService.get().getStudy(c).getDatasets()) {
            tables.put(study.getTable(ds.getName()), "lsid");
        }
        tables.put(ehr.getTable("tasks"), "taskid");
        tables.put(ehr.getTable("requests"), "requestid");
        tables.put(ehr.getTable("cage_observations"), "rowid");

        // 3. Creates filters:
        //      - QCState = 'Delete Requested'
        //      - QCState = 'Request: Denied' && modified before yesterday
        SimpleFilter deleteRequestedFilter = new SimpleFilter("qcstate/label", EHRService.QCSTATES.DeleteRequested.getLabel(), CompareType.EQUAL);
        SimpleFilter requestDeniedFilter = new SimpleFilter("qcstate/label", EHRService.QCSTATES.RequestDenied.getLabel(), CompareType.EQUAL);
        requestDeniedFilter.addCondition("modified", oneDayAgo, CompareType.DATE_LT);

        // Pushes a fake web context so the update service works outside a web request.
        try (ViewContext.StackResetter ignored = ViewContext.pushMockViewContext(u, c, job.getActionURL())) {
            for (Map.Entry<TableInfo, String> entry : tables.entrySet()) {
                TableInfo ti = entry.getKey();
                String pk = entry.getValue();

                try {
                    // 5. Finds the full rows matching either filter.
                    List<Map<String, Object>> rows = new ArrayList<>();
                    for (SimpleFilter filter : List.of(deleteRequestedFilter, requestDeniedFilter)) {
                        rows.addAll(new TableSelector(ti, filter, null).getMapCollection());
                    }

                    // 6. Deletes the matching rows.
                    if (!rows.isEmpty()) {
                        // DRY RUN: Shows what would be deleted.
                        if (DRY_RUN) {
                            job.info("DRY RUN, would delete " + rows.size() + " rows from " + ti.getName());
                            for (Map<String, Object> row : rows) {
                                job.info("Would delete from " + ti.getName() + ": " + row);
                            }
                        }
                        // REAL RUN: Deletes necessary rows.
                        else {
                            job.info("Deleting " + rows.size() + " rows from " + ti.getName());
                            List<Map<String, Object>> keys = new ArrayList<>();
                            for (Map<String, Object> row : rows) {
                                job.info("Deleting from " + ti.getName() + ": " + row);
                                Map<String, Object> key = new CaseInsensitiveHashMap<>();
                                key.put(pk, row.get(pk));
                                keys.add(key);
                            }
                            ti.getUpdateService().deleteRows(u, c, keys, null, new HashMap<>());
                        }
                    }
                }

                // 7. Logs the error and continues with the next table.
                catch (BatchValidationException | InvalidKeyException | QueryUpdateServiceException | SQLException e) {
                    job.error(e.getMessage(), e);
                }
            }
        }
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
