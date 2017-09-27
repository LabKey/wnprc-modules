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
