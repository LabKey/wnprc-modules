package org.labkey.wnprc_ehr.dataentry.validators;

import org.json.old.JSONObject;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.security.User;
import org.labkey.dbutils.api.SimpleQueryFactory;
import org.labkey.dbutils.api.SimplerFilter;
import org.labkey.wnprc_ehr.dataentry.validators.exception.InvalidProjectException;
import org.labkey.wnprc_ehr.service.dataentry.BehaviorDataEntryService;

import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Created by jon on 12/6/16.
 */
public class ProjectVerifier {
    private final User user;
    private final Container container;
    private final String projectid;

    public ProjectVerifier(String projectid, User user, Container container) {
        this.user = user;
        this.container = container;
        this.projectid = projectid;
    }

    private JSONObject getProjectRecord() throws InvalidProjectException {
        SimplerFilter filter = new SimplerFilter("project", CompareType.EQUAL, Integer.parseInt(projectid));
        JSONObject[] records = new SimpleQueryFactory(user, container).selectRows("ehr", "project", filter).toJSONObjectArray();

        if (records.length > 0) {
            return records[0];
        }
        else {
            throw new InvalidProjectException(String.format("%s does not exist", projectid));
        }
    }

    public ProjectVerifier exists() throws InvalidProjectException {
        getProjectRecord(); // This will throw an exception if the project doesn't exist
        return this;
    }

    public ProjectVerifier isBehaviorProject() throws InvalidProjectException {
        JSONObject project = getProjectRecord();

        String code = project.getString("avail");

        if (code == null || !BehaviorDataEntryService.BEHAVIOR_PROJECT_CODES.contains(code)) {
            throw new InvalidProjectException(String.format(
                    "%s is not a valid behavior project.",
                    projectid
            ));
        }

        return this;
    }

    public ProjectVerifier animalIsAssignedOn(String animalId, Date date) throws InvalidProjectException
    {
        boolean threwException = false;

        try {
            this.animalIsNotAssignedOn(animalId, date);
            threwException = false;
        }
        catch (InvalidProjectException e) {
            threwException = true;
        }

        SimpleDateFormat format = new SimpleDateFormat("MMM dd, yyyy");

        if (!threwException) {
            throw new InvalidProjectException(String.format(
                    "%s is not assigned to %s on %s",
                    animalId,
                    projectid,
                    format.format(date)
            ));
        }

        return this;
    }

    public ProjectVerifier animalIsNotAssignedOn(String animalId, Date date) throws InvalidProjectException {
        SimplerFilter filter = new SimplerFilter("Id", CompareType.EQUAL, animalId);
        filter.addAllClauses(new SimplerFilter("date", CompareType.DATE_LTE, date));

        // Filter for active assignments or ones where the endDate is after the expected date.
        SimpleFilter.OrClause orClause = new SimpleFilter.OrClause();
        orClause.addClause(new SimplerFilter("endDate", CompareType.DATE_GTE, date).getClauses().get(0));
        orClause.addClause(new SimplerFilter("endDate", CompareType.ISBLANK,null).getClauses().get(0));

        filter.addClause(orClause);
        filter.addAllClauses(new SimplerFilter("project", CompareType.EQUAL, Integer.parseInt(projectid)));

        JSONObject[] assignmentsOnDate = new SimpleQueryFactory(user, container).selectRows("study", "assignment", filter).toJSONObjectArray();

        SimpleDateFormat format = new SimpleDateFormat("MMM dd, yyyy");

        if (assignmentsOnDate.length > 0) {
            throw new InvalidProjectException(String.format(
                    "%s is already assigned to project %s on %s",
                    animalId,
                    projectid,
                    format.format(date)
            ));
        }

        return this;
    }
}
