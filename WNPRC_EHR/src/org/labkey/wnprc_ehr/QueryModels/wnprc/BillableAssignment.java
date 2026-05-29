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
package org.labkey.wnprc_ehr.QueryModels.wnprc;

import org.joda.time.LocalDate;
import org.labkey.api.data.Results;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.query.FieldKey;

/**
 * Created by jon on 2/16/16.
 */
public class BillableAssignment {
    final protected String animalId;
    final protected String project;
    final protected LocalDate startDate;
    final protected LocalDate endDate;
    final protected String account;

    public BillableAssignment(Results rs) throws Exception {
        try {
            animalId  = rs.getString(FieldKey.fromString("Id"));
            project   = rs.getString(FieldKey.fromString("project"));
            account   = rs.getString(FieldKey.fromString("account"));
            startDate = new LocalDate(rs.getDate(FieldKey.fromString("startdate")));
            endDate   = new LocalDate(rs.getDate(FieldKey.fromString("enddate")));
        }
        catch(RuntimeSQLException e) {
            throw new Exception("Failed to parse account from resultset");
        }
    }

    public String getAnimalID() {
        return animalId;
    }

    public String getProject() {
        return project;
    }

    public String getAccount() {
        return account;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }
}
