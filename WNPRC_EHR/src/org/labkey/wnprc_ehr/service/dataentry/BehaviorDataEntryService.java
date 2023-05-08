package org.labkey.wnprc_ehr.service.dataentry;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.json.JSONObject;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.security.EHRSecurityEscalator;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.security.User;
import org.labkey.api.util.JsonUtil;
import org.labkey.dbutils.api.SimpleQueryFactory;
import org.labkey.dbutils.api.SimplerFilter;
import org.labkey.dbutils.api.exception.MissingPermissionsException;
import org.labkey.api.study.security.SecurityEscalator;
import org.labkey.api.study.security.StudySecurityEscalator;
import org.labkey.dbutils.api.service.SecurityEscalatedService;
import org.labkey.wnprc_ehr.dataentry.validators.AnimalVerifier;
import org.labkey.wnprc_ehr.dataentry.validators.ProjectVerifier;
import org.labkey.wnprc_ehr.dataentry.validators.exception.InvalidAnimalIdException;
import org.labkey.wnprc_ehr.dataentry.validators.exception.InvalidProjectException;
import org.labkey.wnprc_ehr.security.permissions.BehaviorAssignmentsPermission;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Created by jon on 10/28/16.
 */
public class BehaviorDataEntryService extends SecurityEscalatedService
{
    public static Set<String> BEHAVIOR_PROJECT_CODES = new HashSet<>(Arrays.asList(
            "a1",
            "a2",
            "a3",
            "a4",
            "ip",
            "ai"
    ));

    public BehaviorDataEntryService(User user, Container container) throws MissingPermissionsException
    {
        super(user, container, BehaviorAssignmentsPermission.class);
    }

    public static BehaviorDataEntryService get(User user, Container container) throws MissingPermissionsException
    {
        return new BehaviorDataEntryService(user, container);
    }

    public void addBehaviorAssignment(@NotNull String animalId, @NotNull String project, @NotNull Date assignDate, @Nullable Date estimatedRelease, @Nullable String remark) throws InvalidAnimalIdException, InvalidProjectException, DuplicateKeyException, BatchValidationException
    {
        assertAnimalExists(animalId);
        assertValidAndAssignableProject(project, animalId, assignDate);

        // Build our row map
        Map<String, Object> rowMap = new HashMap<>();
        rowMap.put("Id", animalId);
        rowMap.put("project", project);
        rowMap.put("date", assignDate);
        rowMap.put("projectedRelease", estimatedRelease);
        rowMap.put("remark", remark);

        getUpdateService("study", "assignment").insertRow(rowMap, "Adding behavior assignment.");
    }

    public void addBehaviorAssignment(@NotNull String animalId, @NotNull String project, @NotNull Date assignDate) throws InvalidAnimalIdException, InvalidProjectException, DuplicateKeyException, BatchValidationException
    {
        addBehaviorAssignment(animalId, project, assignDate, null, null);
    }

    public void addBehaviorAssignment(@NotNull String animalId, @NotNull String project, @NotNull Date assignDate, @Nullable Date estimatedRelease) throws InvalidAnimalIdException, InvalidProjectException, DuplicateKeyException, BatchValidationException
    {
        addBehaviorAssignment(animalId, project, assignDate, estimatedRelease, null);
    }

    public void addBehaviorAssignment(@NotNull String animalId, @NotNull String project, @NotNull Date assignDate, @Nullable String remark) throws InvalidAnimalIdException, InvalidProjectException, DuplicateKeyException, BatchValidationException
    {
        addBehaviorAssignment(animalId, project, assignDate, null, remark);
    }

    public void releaseAnimalFromBehaviorProject(@NotNull String animalId, @NotNull String project, @NotNull Date releaseDate) throws InvalidAnimalIdException, BatchValidationException, InvalidProjectException, InvalidKeyException
    {
        assertAnimalExists(animalId);
        new ProjectVerifier(project, getEscalationUser(), container).exists().isBehaviorProject().animalIsAssignedOn(animalId, releaseDate);

        SimplerFilter idFilter = new SimplerFilter("Id", CompareType.EQUAL, animalId);
        idFilter.addAllClauses(new SimplerFilter("project", CompareType.EQUAL, Integer.valueOf(project)));

        SimpleQueryFactory queryFactory = new SimpleQueryFactory(getEscalationUser(), container);

        List<Map<String, Object>> rowsToUpdate = new ArrayList<>();

        for (JSONObject assignment : JsonUtil.toJSONObjectList(queryFactory.selectRows("study", "CurrentBehaviorAssignments", idFilter)))
        {
            // Build our row map
            Map<String, Object> rowMap = new HashMap<>();

            rowMap.put("lsid", assignment.getString("lsid"));
            rowMap.put("Id", assignment.getString("id"));
            rowMap.put("project", assignment.getString("project"));
            rowMap.put("endDate", releaseDate);

            rowsToUpdate.add(rowMap);
        }

        getUpdateService("study", "assignment").updateRows(rowsToUpdate, "Releasing animal from behavior project.");
    }

    private void assertAnimalExists(@NotNull String animalId) throws InvalidAnimalIdException
    {
        // Check to make sure the animal exists.
        (new AnimalVerifier(animalId, user, container)).exists().isAliveAndAtCenter();
    }

    public void releaseAnimalFromBehaviorProject(@NotNull String animalId, @NotNull String project) throws InvalidAnimalIdException, BatchValidationException, InvalidKeyException, InvalidProjectException
    {
        releaseAnimalFromBehaviorProject(animalId, project, new Date());
    }

    private void assertValidAndAssignableProject(@NotNull String project, @NotNull String animalId, @NotNull Date assignDate) throws InvalidProjectException
    {
        ProjectVerifier projectVerifier = new ProjectVerifier(project, getEscalationUser(), container);

        projectVerifier
                .exists()
                .isBehaviorProject()
                .animalIsNotAssignedOn(animalId, assignDate);
    }

    @Override
    public User getEscalationUser()
    {
        return EHRService.get().getEHRUser(container);
    }

    @Override
    public Set<SecurityEscalator> getEscalators(User user, Container container, String escalationComment)
    {
        Set<SecurityEscalator> escalators = new HashSet<>();

        escalators.add(EHRSecurityEscalator.beginEscalation(user, container, escalationComment));
        escalators.add(StudySecurityEscalator.beginEscalation(user, container, escalationComment));

        return escalators;
    }
}
