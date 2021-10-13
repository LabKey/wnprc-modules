package org.labkey.wnprc_ehr;

import com.google.common.collect.MapDifference;
import com.google.common.collect.Maps;
import org.apache.commons.beanutils.ConversionException;
import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.commons.lang3.time.DateUtils;
import org.jetbrains.annotations.NotNull;
import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.Results;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.ConvertHelper;
import org.labkey.api.data.JdbcType;
import org.labkey.api.data.Selector;
import org.labkey.api.data.Sort;
import org.labkey.api.data.Table;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.EHRDemographicsService;
import org.labkey.api.data.TableSelector;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.security.EHRSecurityEscalator;
import org.labkey.api.ldk.notification.NotificationService;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryHelper;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.security.UserManager;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.view.ActionURL;
import org.labkey.api.study.security.SecurityEscalator;
import org.labkey.dbutils.api.SimpleQueryFactory;
import org.labkey.dbutils.api.SimpleQueryUpdater;
import org.labkey.dbutils.api.SimplerFilter;
import org.labkey.webutils.api.json.JsonUtils;
import org.labkey.wnprc_ehr.notification.AnimalRequestNotification;
import org.labkey.wnprc_ehr.notification.AnimalRequestNotificationUpdate;
import org.labkey.wnprc_ehr.notification.DeathNotification;
import org.labkey.wnprc_ehr.notification.ProjectRequestNotification;
import org.labkey.wnprc_ehr.notification.ViralLoadQueueNotification;
import org.labkey.wnprc_ehr.notification.VvcNotification;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.sql.ResultSet;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Created by jon on 7/13/16.
 */
public class TriggerScriptHelper {
    protected final Container container;
    protected final User user;
    protected static final Logger _log = LogManager.getLogger(TriggerScriptHelper.class);
    protected final SimpleQueryFactory queryFactory;

    private TriggerScriptHelper(int userId, String containerId) {
        user = UserManager.getUser(userId);
        if (user == null) {
            throw new RuntimeException("User does not exist: " + userId);
        }

        container = ContainerManager.getForId(containerId);
        if (container == null) {
            throw new RuntimeException("Container does not exist: " + containerId);
        }

        queryFactory = new SimpleQueryFactory(user, container);
    }

    public static TriggerScriptHelper create(int userId, String containerId) {
        return new TriggerScriptHelper(userId, containerId);
    }
    @NotNull
    private User getUser()
    {
        return user;
    }

    @NotNull
    private Container getContainer()
    {
        return container;
    }

    private TableInfo getTableInfo(String schema, String query)
    {
        return getTableInfo(schema, query, false);
    }

    private TableInfo getTableInfo(String schema, String query, boolean suppressError)
    {
        UserSchema us = QueryService.get().getUserSchema(getUser(), getContainer(), schema);
        if (us == null)
        {
            if (!suppressError)
                throw new IllegalArgumentException("Unable to find schema: " + schema);

            return null;
        }

        TableInfo ti = us.getTable(query);
        if (ti == null)
        {
            if (!suppressError)
                throw new IllegalArgumentException("Unable to find table: " + schema + "." + query);

            return null;
        }

        return ti;
    }

    private TableInfo getTableInfo(String schema, String query, boolean suppressError, String Parameters)
    {
        //getTableInfo(schema,query, suppressError);
        new QueryService.ParameterDeclaration("StartDate", JdbcType.DATE, Parameters);
        new QueryService.ParameterDeclaration("NumDays", JdbcType.INTEGER, "60");

        UserSchema us = QueryService.get().getUserSchema(getUser(), getContainer(), schema);
        if (us == null)
        {
            if (!suppressError)
                throw new IllegalArgumentException("Unable to find schema: " + schema);

            return null;
        }

        TableInfo ti = us.getTable(query);

        if (ti == null)
        {
            if (!suppressError)
                throw new IllegalArgumentException("Unable to find table: " + schema + "." + query);

            return null;
        }

        return ti;
    }

    public Map<String, Object> getExtraContext()
    {
        Map<String, Object> map = new HashMap<>();
        map.put("quickValidation", true);
        map.put("generatedByServer", true);

        return map;
    }

    public void sendDeathNotification(final List<String> ids) {

        if (!NotificationService.get().isServiceEnabled() && NotificationService.get().isActive(new DeathNotification(), container)){
            _log.info("Notification service is not enabled, will not send death notification");
            return;
        }
        for (String id : ids) {
            DeathNotification idNotification = new DeathNotification();
            idNotification.setParam(DeathNotification.idParamName, id);
            idNotification.sendManually(container, user);
        }
    }

    public void sendPregnancyNotification(final List<String> ids, final List<String> objectids) {
//        if (!NotificationService.get().isServiceEnabled() && NotificationService.get().isActive(new PregnancyNotification(), container)){
//            _log.info("Notification service is not enabled, will not send pregnancy notification");
//            return;
//        }
//        if (ids.size() != objectids.size()) {
//            _log.warn("Mismatch between list of animal ids and object ids.  Will not send pregnancy notification");
//            return;
//        }
//        for (int i = 0; i < ids.size(); i++) {
//            PregnancyNotification pregnancyNotification = new PregnancyNotification();
//            pregnancyNotification.setParam(PregnancyNotification.idParamName, ids.get(i));
//            pregnancyNotification.setParam(PregnancyNotification.objectidsParamName, objectids.get(i));
//            pregnancyNotification.sendManually(container, user);
//        }
    }

    // Will insert the given rows into the given schema and table
    public void insertRows(List<Map<String, Object>> insertRows, String schema, String table) throws QueryUpdateServiceException, SQLException, BatchValidationException, DuplicateKeyException {
        SimpleQueryUpdater queryUpdater = new SimpleQueryUpdater(user, container, schema, table);
        queryUpdater.insert(insertRows);
    }

    public void updateUltrasoundMeasurements(List<Map<String, Object>> updatedRows) throws QueryUpdateServiceException, SQLException, BatchValidationException, DuplicateKeyException, InvalidKeyException {
        if (updatedRows != null && updatedRows.size() > 0) {
            String ultrasoundId = (String) updatedRows.get(0).get("ultrasound_id");

            List<Map<String, Object>> rowsToDelete = new ArrayList<>();
            List<Map<String, Object>> rowsToInsert = new ArrayList<>();

            final double THRESHOLD = .001;

            for (Map<String, Object> updatedRow : updatedRows) {
                Pattern separator = Pattern.compile(";");
                List<Double> newMeasurements = separator
                        .splitAsStream((String) updatedRow.get("measurements_string"))
                        .filter(x -> (x != null && x.length() > 0))
                        .map(Double::parseDouble)
                        .collect(Collectors.toList());
                List<JSONObject> existingMeasurements = getMeasurements(ultrasoundId, (String) updatedRow.get("measurement_name"));

                for (int i = 0; i < existingMeasurements.size(); i++) {
                    for (int j = 0; j < newMeasurements.size(); j++) {
                        if (Math.abs(existingMeasurements.get(i).getDouble("measurement_value") - newMeasurements.get(j)) < THRESHOLD) {
                            existingMeasurements.remove(i--);
                            newMeasurements.remove(j);
                            break;
                        }
                    }
                }

                for (JSONObject existingMeasurement : existingMeasurements) {
                    rowsToDelete.add(existingMeasurement);
                }

                for (Double newMeasurement : newMeasurements) {
                    JSONObject newRow = new JSONObject();
                    newRow.put("Id", updatedRow.get("Id"));
                    newRow.put("date", updatedRow.get("date"));
                    newRow.put("measurement_name", updatedRow.get("measurement_name"));
                    newRow.put("measurement_label", updatedRow.get("measurement_label"));
                    newRow.put("measurement_value", newMeasurement);
                    newRow.put("measurement_unit", updatedRow.get("measurement_unit"));
                    newRow.put("ultrasound_id", updatedRow.get("ultrasound_id"));
                    newRow.put("taskid", updatedRow.get("taskid"));
                    newRow.put("QCStateLabel", updatedRow.get("QCStateLabel"));
                    rowsToInsert.add(newRow);
                }
            }

            SimpleQueryUpdater queryUpdater = new SimpleQueryUpdater(user, container, "study", "ultrasound_measurements");
            if (rowsToDelete.size() > 0) {
                queryUpdater.delete(rowsToDelete);
            }
            if (rowsToInsert.size() > 0) {
                queryUpdater.insert(rowsToInsert);
            }
//            try (SecurityEscalator escalator = EHRSecurityEscalator.beginEscalation(user, container, "Escalating so that ultrasound followup_required field can be changed to false")) {
//                queryUpdater.update(rowsToUpdate);
//            } catch (Exception e) {
//                _log.error(e);
//            }
        }
    }

    private List<JSONObject> getMeasurements(String ultrasoundId, String measurementName) {
        SimpleQueryFactory queryFactory = new SimpleQueryFactory(user, container);
        SimplerFilter filter = new SimplerFilter("ultrasound_id", CompareType.EQUAL, ultrasoundId);
        filter.addCondition("measurement_name", CompareType.EQUAL, measurementName);

        JSONArray ultrasound_measurements = queryFactory.selectRows("study", "ultrasound_measurements", filter);
        List<JSONObject> measurementsList = JsonUtils.getListFromJSONArray(ultrasound_measurements);

        return measurementsList;
    }

    public void updateBreedingOutcome(final List<String> lsids) {
        SimpleQueryUpdater queryUpdater = new SimpleQueryUpdater(user, container, "study", "breeding_encounters");

        List<Map<String, Object>> updateRows = new ArrayList<>();
        for (String lsid : lsids) {
            JSONObject row = new JSONObject();
            row.put("lsid", lsid);
            row.put("outcome", true);
            updateRows.add(row);
        }

        try (SecurityEscalator escalator = EHRSecurityEscalator.beginEscalation(user, container, "Escalating so that breeding encounter outcome can be changed to true")) {
            queryUpdater.update(updateRows);
        } catch (Exception e) {
            _log.error(e);
        }
    }

    public void updateUltrasoundFollowup(final String id, final Date date) {
        SimpleQueryFactory queryFactory = new SimpleQueryFactory(user, container);
        SimplerFilter filter = new SimplerFilter("Id", CompareType.EQUAL, id);
        filter.addCondition("date", CompareType.DATE_LTE, date);
        filter.addCondition("followup_required", CompareType.EQUAL, true);

        JSONArray encounters = queryFactory.selectRows("study", "ultrasounds", filter);
        List<JSONObject> ultrasounds = JsonUtils.getListFromJSONArray(encounters);

        List<Map<String, Object>> updateRows = new ArrayList<>();
        for (JSONObject row : ultrasounds) {
            row.put("followup_required", false);
            updateRows.add(row);
        }

        SimpleQueryUpdater queryUpdater = new SimpleQueryUpdater(user, container, "study", "ultrasounds");
        try (SecurityEscalator escalator = EHRSecurityEscalator.beginEscalation(user, container, "Escalating so that ultrasound followup_required field can be changed to false")) {
            queryUpdater.update(updateRows);
        } catch (Exception e) {
            _log.error(e);
        }

    }

    public List<Map<String, String>> createBreedingRecordsFromHousingChanges(final List<Map<String, Object>> housingRows) {
        boolean stopExecution = false;
        List<Map<String, String>> errorStrings = new ArrayList<>();

        List<String> requiredFields = new ArrayList<>();
        requiredFields.add("Id");
        requiredFields.add("date");
        requiredFields.add("room");
        requiredFields.add("cage");
        requiredFields.add("reason");

        //Filter out any rows that aren't related to breeding
        List<Map<String, Object>> filteredHousingRows = new ArrayList<>();
        for (Map<String, Object> housingRow : housingRows) {
            String reasonField = (String) housingRow.get("reason");
            String[] reasons = reasonField != null ? reasonField.split(",") : new String[0];
            boolean breeding = false;
            for (String reason : reasons) {
                if ("Breeding".equals(reason) || "Breeding ended".equals(reason)) {
                    breeding = true;
                    housingRow.put("reason", reason);
                    break;
                }
            }
            if (breeding) {
                for(String field : requiredFields) {
                    if (housingRow.get(field) == null) {
                        errorStrings.add(getError(field, "Field '" + field + "' is required.", "ERROR"));
                        stopExecution = true;
                    }
                }
                housingRow.put("sex", EHRDemographicsService.get().getAnimal(container, (String) housingRow.get("Id")).getOrigGender());
                filteredHousingRows.add(housingRow);
            }
        }

        if (stopExecution) {
            return errorStrings;
        }

        String keySeparator = "|";
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm");
        Map<String, List<Map<String, Object>>> groupedAnimals = new TreeMap<>();

        //Uncomment the below line to use the test data
        //filteredHousingRows = getBreedingEncounterTestData();

        //Group rows into lists of animals that were caged together at the same time
        for (Map<String, Object> housingRow : filteredHousingRows) {
            String key = sdf.format(housingRow.get("date")) + keySeparator + housingRow.get("room") + keySeparator + housingRow.get("cage");
            if (groupedAnimals.get(key) == null) {
                List<Map<String, Object>> newRow = new ArrayList<>();
                newRow.add(housingRow);
                groupedAnimals.put(key, newRow);
            } else {
                groupedAnimals.get(key).add(housingRow);
            }
        }

        //Process these groups in order from earliest to most recent
        for (Map.Entry<String, List<Map<String, Object>>> entry : groupedAnimals.entrySet()) {
            List<Map<String, Object>> group = entry.getValue();
            for (int i = 0; i < group.size(); i++) {
                if (group.get(i).get("sex").equals("f") && group.get(i).get("reason").equals("Breeding")) {
                    List<JSONObject> openEncounters = getOpenEncounters((String) group.get(i).get("Id"));
                    if (openEncounters.size() == 0) {
                        //There are no open breeding encounters, so create a new one
                        List<Map<String, Object>> insertRows = createNewBreedingEncounter(group, i);
                        if (StringUtils.isEmpty((String) insertRows.get(0).get("sireid"))) {
                            errorStrings.add(getError("Id", "Starting a breeding encounter requires a female and at least one male.", "ERROR"));
                        } else {
                            saveBreedingEncounter(insertRows, false);
                        }
                    } else if (openEncounters.size() == 1){
                        //Close currently open breeding encounter and then start new one
                        List<Map<String, Object>> updateRows = closeOngoingBreedingEncounter(filteredHousingRows, openEncounters, group, i);
                        saveBreedingEncounter(updateRows, true);
                        List<Map<String, Object>> insertRows = createNewBreedingEncounter(group, i);
                        if (StringUtils.isEmpty((String) insertRows.get(0).get("sireid"))) {
                            errorStrings.add(getError("Id", "Starting a breeding encounter requires a female and at least one male.", "ERROR"));
                        } else {
                            saveBreedingEncounter(insertRows, false);
                        }
                    } else {
                        //This should not happen
                        if (group.get(i).get("Id").equals(group.get(i).get("currentId"))) {
                            errorStrings.add(getError("reason", "Female (" + group.get(i).get("Id") + ") has multiple breeding encounters open", "ERROR"));
                        }
                    }
                } else if (group.get(i).get("sex").equals("f") && group.get(i).get("reason").equals("Breeding ended")) {
                    //get open breeding encounter record
                    List<JSONObject> openEncounters = getOpenEncounters((String) group.get(i).get("Id"));
                    if (openEncounters.size() == 1) {
                        List<Map<String, Object>> updateRows = closeOngoingBreedingEncounter(filteredHousingRows, openEncounters, group, i);
                        saveBreedingEncounter(updateRows, true);
                    } else if (openEncounters.size() == 0 && group.get(i).get("Id").equals(group.get(i).get("currentId"))) {
                        errorStrings.add(getError("reason", "There is no open breeding encounter for '" + group.get(i).get("Id") + "'. If you are updating an existing housing change this may be fine.", "WARN"));
                    } else if (openEncounters.size() > 1 && group.get(i).get("Id").equals(group.get(i).get("currentId"))) {
                        errorStrings.add(getError("reason", "Female (" + group.get(i).get("Id") + ") has multiple breeding encounters open", "ERROR"));
                    }
                }
            }
        }
        return errorStrings;
    }

    public String lookupValue(String key, String study, String queryName, String keyCol, String displayColumn) {
        JSONArray results = queryFactory.selectRows(study, queryName, new SimplerFilter(keyCol, CompareType.EQUAL, key));
        if (results.length() > 0) {
            return results.getJSONObject(0).getString(displayColumn);
        }
        else {
            return null;
        }
    }

    public String lookupGender(String code) {
        return lookupValue(code, "ehr_lookups", "gender_codes", "code", "meaning");
    }

    public void sendHusbandryNotification(String requestId, String id, String project){


    }

    //TODO: created methods to record daterequested
    public void updateVVC(){

    }
    //TODO: send notification once the vvc is requested
    public void sendVvcNotification(String requestid, String hostname){
        _log.info("Using Java helper to send vvc request "+ requestid);
        Module ehr = ModuleLoader.getInstance().getModule("EHR");
        VvcNotification notifcation = new VvcNotification(ehr, requestid, user, hostname);
        notifcation.sendManually(container,user);

    }

    private List<Map<String, Object>> createNewBreedingEncounter(List<Map<String, Object>> group, int index) {
        List<Map<String, Object>> animalsInEncounter = new ArrayList<>();
        animalsInEncounter.add(group.get(index));
        for (int j = 0; j < group.size(); j++)
        {
            if (group.get(j).get("sex").equals("m") && group.get(j).get("reason").equals("Breeding"))
            {
                animalsInEncounter.add(group.get(j));
            }
        }
        StringBuilder sireid = new StringBuilder();
        StringBuilder remark = new StringBuilder("--Breeding Started--\n");
        boolean remarkFound = false;
        if (!StringUtils.isEmpty((String) animalsInEncounter.get(0).get("remark")))
        {
            remarkFound = true;
            remark.append(animalsInEncounter.get(0).get("Id"))
                    .append(": ")
                    .append(animalsInEncounter.get(0).get("remark"))
                    .append("\n");
        }
        for (int j = 1; j < animalsInEncounter.size(); j++)
        {
            sireid.append(animalsInEncounter.get(j).get("Id"));
            if (!StringUtils.isEmpty((String) animalsInEncounter.get(j).get("remark")))
            {
                remarkFound = true;
                remark.append(animalsInEncounter.get(j).get("Id"))
                        .append(": ")
                        .append(animalsInEncounter.get(j).get("remark"))
                        .append("\n");
            }
            if (j + 1 < animalsInEncounter.size())
            {
                sireid.append(",");
            }
        }
        if (!remarkFound)
        {
            remark.append("no remarks\n");
        }
        JSONObject encounter = new JSONObject();
        encounter.put("objectid", UUID.randomUUID().toString());
        encounter.put("Id", animalsInEncounter.get(0).get("Id"));
        encounter.put("sireid", sireid.toString());
        encounter.put("date", animalsInEncounter.get(0).get("date"));
        encounter.put("project", animalsInEncounter.get(0).get("project"));
        encounter.put("QCState", EHRService.get().getQCStates(container).get(EHRService.QCSTATES.InProgress.getLabel()).getRowId());
        encounter.put("performedby", animalsInEncounter.get(0).get("performedby"));
        encounter.put("remark", remark.toString());
        encounter.put("outcome", false);
        List<Map<String, Object>> rows = new ArrayList<>();
        rows.add(encounter);
        return rows;
    }

    private List<Map<String, Object>> closeOngoingBreedingEncounter(List<Map<String, Object>> filteredHousingRows, List<JSONObject> openEncounters, List<Map<String, Object>> group, int index) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm");
        JSONObject openEncounter = openEncounters.get(0);
        StringBuilder remark = new StringBuilder("\n--Breeding Ended--");
        boolean remarkFound = false;
        boolean ejacConfirmed = group.get(index).get("ejacConfirmed") != null ? (Boolean) group.get(index).get("ejacConfirmed") : false;

        if (!StringUtils.isEmpty((String) group.get(index).get("remark")) && group.get(index).get("reason").equals("Breeding ended")) {
            remarkFound = true;
            remark.append("\n")
                    .append(group.get(index).get("Id"))
                    .append(": ")
                    .append(group.get(index).get("remark"));
        }

        String[] sireList = openEncounter.getString("sireid").split(",");
        for (int j = 0; j < sireList.length; j++) {
            for(int k = 0; k < filteredHousingRows.size(); k++) {
                if (sireList[j].equals(filteredHousingRows.get(k).get("Id")) && sdf.format(filteredHousingRows.get(k).get("date")).equals(sdf.format(group.get(index).get("date"))) && filteredHousingRows.get(k).get("reason").equals("Breeding ended")) {
                    if (!StringUtils.isEmpty((String) filteredHousingRows.get(k).get("remark"))) {
                        remarkFound = true;
                        remark.append("\n")
                                .append(sireList[j])
                                .append(": ")
                                .append(filteredHousingRows.get(k).get("remark"));
                    }
                    if (filteredHousingRows.get(k).get("ejacConfirmed") != null && ((Boolean) filteredHousingRows.get(k).get("ejacConfirmed"))) {
                        remarkFound = true;
                        ejacConfirmed = true;
                        remark.append("\n")
                                .append(sireList[j])
                                .append(": ")
                                .append("Ejaculation Confirmed");
                    }
                }
            }
        }

        openEncounter.put("enddate", group.get(index).get("date"));
        openEncounter.put("ejaculation", ejacConfirmed);
        openEncounter.put("QCState", EHRService.get().getQCStates(container).get(EHRService.QCSTATES.Completed.getLabel()).getRowId());

        if (!remarkFound) {
            remark.append("\nno remarks");
        }
        openEncounter.put("remark", openEncounter.getString("remark") != null ? openEncounter.getString("remark") + remark : remark.toString());

        List<Map<String, Object>> rows = new ArrayList<>();
        rows.add(openEncounter);
        return rows;
    }

    private List<JSONObject> getOpenEncounters(String id) {
        SimpleQueryFactory queryFactory = new SimpleQueryFactory(user, container);
        SimplerFilter filter = new SimplerFilter("Id", CompareType.EQUAL, id);
        filter.addCondition("QCState", CompareType.EQUAL, EHRService.get().getQCStates(container).get(EHRService.QCSTATES.InProgress.getLabel()).getRowId());

        JSONArray encounters = queryFactory.selectRows("study", "breeding_encounters", filter);
        List<JSONObject> encounterList = JsonUtils.getListFromJSONArray(encounters);

        return encounterList;
    }

    private void saveBreedingEncounter(List<Map<String, Object>> rows, boolean isUpdate) {
        SimpleQueryUpdater queryUpdater = new SimpleQueryUpdater(user, container, "study", "breeding_encounters");
        try {
            if (isUpdate) {
                queryUpdater.update(rows);
            } else {
                queryUpdater.insert(rows);
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private Map<String, String> getError(String field, String message, String severity) {
        Map<String, String> error = new HashMap<>();
        error.put("field", field);
        error.put("message", message);
        error.put("severity", severity);
        return error;
    }

    private List<Map<String, Object>> getBreedingEncounterTestData() {
        List<Map<String, Object>> testData = new ArrayList<>();

        //female 1 - end
        JSONObject row4 = new JSONObject();
        row4.put("Id", "testid1");
        row4.put("date", new Timestamp(118, 10, 20, 13, 15, 0, 0));
        row4.put("room", "room1");
        row4.put("cage", "cage1");
        row4.put("remark", "female 1 end");
        row4.put("ejacConfirmed", false);
        row4.put("reason", "Breeding ended");
        row4.put("performedby", "person1");
        row4.put("sex", "f");
        testData.add(row4);

        //male 1a - end
        JSONObject row5 = new JSONObject();
        row5.put("Id", "testid2");
        row5.put("date", new Timestamp(118, 10, 20, 13, 15, 0, 0));
        row5.put("room", "room1");
        row5.put("cage", "cage1");
        row5.put("remark", "male 1a end");
        row5.put("ejacConfirmed", true);
        row5.put("reason", "Breeding ended");
        row5.put("performedby", "person1");
        row5.put("sex", "m");
        testData.add(row5);

        //male 1b - end
        JSONObject row6 = new JSONObject();
        row6.put("Id", "testid3");
        row6.put("date", new Timestamp(118, 10, 20, 13, 15, 0, 0));
        row6.put("room", "room1");
        row6.put("cage", "cage1");
        row6.put("remark", "male 1b end");
        row6.put("ejacConfirmed", false);
        row6.put("reason", "Breeding ended");
        row6.put("performedby", "person1");
        row6.put("sex", "m");
        testData.add(row6);

        //female 1 - start
        JSONObject row1 = new JSONObject();
        row1.put("Id", "testid1");
        row1.put("date", new Timestamp(118, 10, 20, 8, 15, 0, 0));
        row1.put("room", "room1");
        row1.put("cage", "cage1");
        row1.put("remark", "female 1 start");
        row1.put("project", "project1");
        row1.put("reason", "Breeding");
        row1.put("performedby", "person1");
        row1.put("sex", "f");
        testData.add(row1);

        //male 1a - start
        JSONObject row2 = new JSONObject();
        row2.put("Id", "testid2");
        row2.put("date", new Timestamp(118, 10, 20, 8, 15, 0, 0));
        row2.put("room", "room1");
        row2.put("cage", "cage1");
        row2.put("remark", "male 1a start");
        row2.put("project", "project1");
        row2.put("reason", "Breeding");
        row2.put("performedby", "person1");
        row2.put("sex", "m");
        testData.add(row2);

        //male 1b - start
        JSONObject row3 = new JSONObject();
        row3.put("Id", "testid3");
        row3.put("date", new Timestamp(118, 10, 20, 8, 15, 0, 0));
        row3.put("room", "room1");
        row3.put("cage", "cage1");
        row3.put("remark", "male 1b start");
        row3.put("project", "project1");
        row3.put("reason", "Breeding");
        row3.put("performedby", "person1");
        row3.put("sex", "m");
        testData.add(row3);

        //female 2a - start
        JSONObject row7 = new JSONObject();
        row7.put("Id", "testid4");
        row7.put("date", new Timestamp(118, 10, 22, 8, 15, 0, 0));
        row7.put("room", "room2");
        row7.put("cage", "cage2");
        row7.put("remark", "female 2a start");
        row7.put("project", "project2");
        row7.put("reason", "Breeding");
        row7.put("performedby", "person1");
        row7.put("sex", "f");
        testData.add(row7);

        //female 2b - start
        JSONObject row8 = new JSONObject();
        row8.put("Id", "testid5");
        row8.put("date", new Timestamp(118, 10, 22, 8, 15, 0, 0));
        row8.put("room", "room2");
        row8.put("cage", "cage2");
        row8.put("remark", "female 2b start");
        row8.put("project", "project2");
        row8.put("reason", "Breeding");
        row8.put("performedby", "person1");
        row8.put("sex", "f");
        testData.add(row8);

        //male 2 - start
        JSONObject row9 = new JSONObject();
        row9.put("Id", "testid6");
        row9.put("date", new Timestamp(118, 10, 22, 8, 15, 0, 0));
        row9.put("room", "room2");
        row9.put("cage", "cage2");
        row9.put("remark", "male 2 start");
        row9.put("project", "project2");
        row9.put("reason", "Breeding");
        row9.put("performedby", "person1");
        row9.put("sex", "m");
        testData.add(row9);

        //male 3 - start
        JSONObject row13 = new JSONObject();
        row13.put("Id", "testid6");
        row13.put("date", new Timestamp(118, 10, 22, 11, 15, 0, 0));
        row13.put("room", "room3");
        row13.put("cage", "cage3");
        row13.put("remark", "male 3 start");
        row13.put("project", "project3");
        row13.put("reason", "Breeding");
        row13.put("performedby", "person1");
        row13.put("sex", "m");
        testData.add(row13);

        //female 2b - end
        JSONObject row11 = new JSONObject();
        row11.put("Id", "testid5");
        row11.put("date", new Timestamp(118, 10, 22, 11, 15, 0, 0));
        row11.put("room", "room2");
        row11.put("cage", "cage4");
        row11.put("remark", "female 2b end");
        row11.put("ejacConfirmed", true);
        row11.put("reason", "Breeding ended");
        row11.put("performedby", "person1");
        row11.put("sex", "f");
        testData.add(row11);

        //male 2 - end
        JSONObject row12 = new JSONObject();
        row12.put("Id", "testid6");
        row12.put("date", new Timestamp(118, 10, 22, 11, 15, 0, 0));
        row12.put("room", "room2");
        row12.put("cage", "cage2");
        row12.put("remark", "male 2 end");
        row12.put("ejacConfirmed", false);
        row12.put("reason", "Breeding ended");
        row12.put("performedby", "person1");
        row12.put("sex", "m");
        testData.add(row12);

        //female 2a/3 - end/start
        JSONObject row10 = new JSONObject();
        row10.put("Id", "testid4");
        row10.put("date", new Timestamp(118, 10, 22, 11, 15, 0, 0));
        row10.put("room", "room3");
        row10.put("cage", "cage3");
        row10.put("remark", "female 2a/3 start again");
        row10.put("project", "project2");
        row10.put("reason", "Breeding");
        row10.put("performedby", "person1");
        row10.put("sex", "f");
        testData.add(row10);

        return testData;
    }

    public void sendAnimalRequestNotification(Integer rowid, String hostName){
        _log.info("Using java helper to send email for animal request record: "+rowid);
        Module ehr = ModuleLoader.getInstance().getModule("EHR");
        AnimalRequestNotification notification = new AnimalRequestNotification(ehr, rowid, user, hostName);
        notification.sendManually(container, user);
    }
    public void sendAnimalRequestNotificationUpdate(Integer rowid, Map<String,Object> row, Map<String,Object> oldRow, String hostName){
        _log.info("Using java helper to send email for animal request record: "+rowid);
        Module ehr = ModuleLoader.getInstance().getModule("EHR");
        AnimalRequestNotificationUpdate notification = new AnimalRequestNotificationUpdate(ehr, rowid, row, oldRow, user, hostName);
        Maps.difference(row,oldRow);
        notification.sendManually(container, user);
    }

    public void sendProjectNotification(Integer key, String hostName){
        _log.info("Using java helper to send email for project request record: "+key);
        Module ehr = ModuleLoader.getInstance().getModule("EHR");
        ProjectRequestNotification notification = new ProjectRequestNotification(ehr,key,user,hostName);
        Container ehrContainer =  ContainerManager.getForPath("/WNPRC/EHR");
        notification.sendManually(ehrContainer,user);
    }

    //Method to check is an afternoon water 1:30 PM
    //TODO: this method should be called from water amounts, when staff is requesting more water to be done by animal care in the PM
    public String checkScheduledWaterTask(List<Map<String, Object>> recordsInTransaction)
    {
        int i=0;

        if (recordsInTransaction != null)
        {
            Calendar currentTime = Calendar.getInstance();
            Calendar limitTime = Calendar.getInstance();
            limitTime.set(Calendar.HOUR_OF_DAY, 13);
            limitTime.set(Calendar.MINUTE, 30);

            for (Map<String, Object> origMap : recordsInTransaction)
            {
                Map<String, Object> map = new CaseInsensitiveHashMap<>(origMap);
                if (!map.containsKey("date"))
                {
                    _log.warn("TriggerScriptHelper.checkScheduledWaterTask was passed a previous record lacking a date");
                    continue;
                }

                try
                {
                    String objectId = ConvertHelper.convert(map.get("objectid"), String.class);
                    if (objectId != null)
                    {
                        Date waterClientDate=ConvertHelper.convert(map.get("date"), Date.class);
                        int qcState = ConvertHelper.convert(map.get("qcstate"), Integer.class);
                        Calendar waterDate = Calendar.getInstance();
                        waterDate.setTime(waterClientDate);
                        //ConvertHelper.convert(map.get("qcstate"), Number.class);
                        if (waterDate.after(limitTime) || currentTime.after(limitTime))
                        {

                            //Check the value for the schedule qcstate
                            int tempOrdinal = EHRService.QCSTATES.Scheduled.ordinal();
                            if (ConvertHelper.convert(map.get("assignedto"), String.class).equals("animalcare") && (qcState-1) == EHRService.QCSTATES.Scheduled.ordinal())
                                i++;
                        }
                    }
                }
                catch (ConversionException e)
                {
                    _log.error("TriggerScriptHelper.checkScheduleWaterTask was unable to parse date or qcstate", e);
                    throw e;
                }
            }
        }
        if (i>0)
        {
            return "At least one water is schedule after than 1:30 PM" ;
        }

        return null;
    }

    //Method to validate if a water order is assignedTo animalcare and is added after 1:30PM
    //This method will be called from the waterAmount.js triggerScript
    //Parameters:   animalId -  to check for water amounts already in the system
    //              clientDate - date from client form
    //              recordSource - validate from what interface the record coming from
    //              assignedTo - check who the water amount is assigned to
    //              dataSet - the dataset that trigger the validation
    public String checkUploadTime (String animalId, Date clientDate, String recordSource, String assignedTo, String dataSet){
        String errorMessage = null;

        ZonedDateTime treshholdTime = ZonedDateTime.now().withHour(13).withMinute(30);
        java.util.Date date = new Date();

        Calendar waterClientDate = Calendar.getInstance();
        waterClientDate.setTime(clientDate);

        if (date.toInstant().isAfter(treshholdTime.toInstant())){
            if (assignedTo.equals("animalcare") && recordSource.equals("LabWaterForm")){
                errorMessage = "Additional water for today assignedTo animalCare cannot be entered after 1:30 PM";
            }
        }

        return errorMessage;
    }
    public String checkEncounterTime (String animalId, Date clientDate, List<Map<String,Object>> mainEncounterDates, String dataSet){
        Date internalDate = new Date();
        if (mainEncounterDates!=null){
            for (Map<String,Object> origMap : mainEncounterDates){

                Map <String,Object> map = new CaseInsensitiveHashMap<>(origMap);
                try{
                    internalDate = ConvertHelper.convert(map.get("mainEncounterDate"),Date.class);

                }catch(ConversionException e){
                    _log.error("TriggerScriptHelper.checkEncounterTime",e);

                }
            }

        }
        String errorMessage = null;

        Calendar apprenticeClientDate = Calendar.getInstance();
        apprenticeClientDate.setTime(clientDate);

        Calendar encounterDateTime = Calendar.getInstance();
        encounterDateTime.setTime(internalDate);

        final long MILLI_TO_HOUR = 1000 * 60 * 60;

        if ( mainEncounterDates != null &&
                Math.abs(encounterDateTime.toInstant().minus(apprenticeClientDate.getTimeInMillis(),ChronoUnit.MILLIS).toEpochMilli()/MILLI_TO_HOUR)>24){
            errorMessage = "Encounter time cannot be more than 24 hours before or after any of the other records in this form.";
        }

        return errorMessage;
    }

    public String changeWaterAmountQC(String treatmentId, List<Map<String, Object>> recordsInTransaction){
        StringBuilder errorMessage = new StringBuilder();
        String success = null;
        List<Map<String,Object>> watersRecordsToUpdate = new ArrayList<>();

        if (recordsInTransaction != null)
        {
            for (Map<String,Object> origMap : recordsInTransaction)
            {
                Map<String, Object> map = new CaseInsensitiveHashMap<>(origMap);

                //if (dataSource.equals("atLeastAWaterAmount")){

                String allTreatmentId = ConvertHelper.convert(map.get("treatmentId"), String.class);

                if (allTreatmentId.equals(treatmentId))
                {
                    String[] treatmentArray = allTreatmentId.split(";");
                    // String clientVolume = ((Map)((List)recordsInTransaction.get(0).get("waterObjects")).get(0)).get("volume").toString();
                    List<Map<String, Object>> waterFromExtraContext = ((List) recordsInTransaction.get(0).get("waterObjects"));


                    String clientVolume = null;
                    for (String objectId : treatmentArray)
                    {
                        for (Map extraContextRows : waterFromExtraContext)
                        {

                            if (objectId.equals(extraContextRows.get("treatmentId")) && "waterAmount".equals(extraContextRows.get("dataSource")))
                            {
                                Map<String, Object> updateWaterAmount = new CaseInsensitiveHashMap<>();
                                updateWaterAmount.put("lsid", extraContextRows.get("lsid"));
                                updateWaterAmount.put("volume", extraContextRows.get("volume"));
                                //updateWaterAmount.put("");
                                watersRecordsToUpdate.add(updateWaterAmount);
                                // clientVolume = extraContextRows.get("volume").toString();
                            }
                        }

                    }
                }



                   // JSONArray waterAmounts = ConvertHelper.convert(map.get("waterObjects"), JSONArray.class);
                    //waterAmounts.length();


                }


            success = changeRowQCStatus("waterAmount", "lsid",  "volume",watersRecordsToUpdate);
            if (!success.isBlank()){
                errorMessage.append(success);
            }

        }


        //if (treatmentId != null && dataSource.equals("waterAmount")){


        return  errorMessage.toString();
    }

    public String changeRowQCStatus(String tableName, String keyColumn, String columnCheck, List<Map<String, Object>> rowsToUpdate){
        String returnMessage = new String();

        TableInfo genericTable = getTableInfo("study",tableName);

        List<Map<String,Object>> toUpdate = new ArrayList<>();
        List<Map<String,Object>> oldKeys = new ArrayList<>();

        if (rowsToUpdate != null)
        {
            for (Map<String,Object> origMap : rowsToUpdate)
            {
                Map<String, Object> map = new CaseInsensitiveHashMap<>(origMap);
                String keyValue = ConvertHelper.convert(map.get(keyColumn), String.class);
                Object verifyValue = map.get(columnCheck);

                if (keyValue != null){

                    SimpleFilter filter = new SimpleFilter(FieldKey.fromString(keyColumn),keyValue);
                    filter.addCondition(FieldKey.fromString("qcstate"),EHRService.get().getQCStates(container).get(EHRService.QCSTATES.Scheduled.getLabel()).getRowId());

                    TableSelector filteredTable = new TableSelector(genericTable, PageFlowUtil.set(keyColumn, "qcstate", columnCheck), filter, null);
                    Map<String, Object>[] waterAmountObjects = filteredTable.getMapArray();


                    if (waterAmountObjects.length > 0)
                    {
                        for (Map<String, Object> waterAmountMap : waterAmountObjects)
                        {
                            String internalObjectId = ConvertHelper.convert(waterAmountMap.get(keyColumn), String.class);
                            String columnClass = waterAmountMap.get(columnCheck).getClass().getSimpleName();

                            //Double serverValue = ConvertHelper.convert(waterAmountMap.get(columnCheck),Double.class);
                            //Double clientValue = Double.parseDouble(verifyValue);

                            //TODO: finding a way to compare to values independent of the type of objects they are
                            //this only address if the object is a double
                            if (!verifyValue.equals(waterAmountMap.get(columnCheck))){
                            //if (!waterAmountMap.get(columnCheck).equals(Double.parseDouble(verifyValue.toString()))){
                                returnMessage = "Server and Client values do not match";
                                return returnMessage;
                            }

                            Map<String, Object> updateWaterAmount = new CaseInsensitiveHashMap<>();
                            updateWaterAmount.put(keyColumn, internalObjectId);
                            updateWaterAmount.put("QCState", EHRService.get().getQCStates(container).get(EHRService.QCSTATES.Completed.getLabel()).getRowId());
                            updateWaterAmount.put("QCStateLabel", EHRService.QCSTATES.Completed.getLabel());
                            updateWaterAmount.put("skipWaterRegulationCheck", true);
                            toUpdate.add(updateWaterAmount);

                            Map<String, Object> keyMap = new CaseInsensitiveHashMap<>();
                            keyMap.put(keyColumn, internalObjectId);
                            oldKeys.add(keyMap);


                        }
                    }
                }
            }
        }
        try
        {
            if (!toUpdate.isEmpty())
            {
                Container container = getContainer();
                User user = getUser();

                List<Map<String, Object>> updatedRows = genericTable.getUpdateService().updateRows(user, container, toUpdate, oldKeys, null, null);
                if (updatedRows.isEmpty()){
                    returnMessage = "Error changing QCState for waterAmount table";

                }
            }
        }catch (Exception e){
            returnMessage= "Error exception changing QCState for waterAmount table";
        }

        return returnMessage;

    }

    public void updateWaterRow(String performedby, String parentId) throws Exception{

        if (parentId != null)
        {
            TableInfo waterTable = getTableInfo("study", "waterGiven");

            List<Map<String, Object>> toUpdate = new ArrayList<>();
            List<Map<String, Object>> oldKeys = new ArrayList<>();
            List<String> taskIds = new ArrayList<>();

            //This will always return only one row from the water table show I changed the map on volumeObject
            SimpleFilter schedulewater = new SimpleFilter(FieldKey.fromString("lsid"), parentId);
            TableSelector volumes = new TableSelector(waterTable, PageFlowUtil.set("lsid", "volume", "taskid", "objectid"), schedulewater, null);
            Map <String,Object>[] volumeObject = volumes.getMapArray();

            if (volumeObject.length > 0)
            {
                for (Map<String,Object> volumeMap : volumeObject)
                {
                    String lsid = ConvertHelper.convert(volumeMap.get("lsid"), String.class);
                    Double oldVolume = ConvertHelper.convert(volumeMap.get("volume"), Double.class);

                    taskIds.add(ConvertHelper.convert(volumeMap.get("taskid"), String.class));

                    Map<String, Object> r = new CaseInsensitiveHashMap<>();

                    r.put("lsid", lsid);
                    r.put("volume", 0);
                    r.put("qcstate",EHRService.QCSTATES.Completed.getQCState(getContainer()).getRowId());
                    r.put("parentid", null);
                    r.put("remarks", "Request completed by:" + performedby+" Volume given: "+oldVolume);
                    r.put("scheduledVolume",oldVolume);
                    //r.put("enddate", row.g);
                    toUpdate.add(r);

                    Map<String, Object> keyMap = new CaseInsensitiveHashMap<>();
                    keyMap.put("lsid", lsid);
                    oldKeys.add(keyMap);
                }

                if (!toUpdate.isEmpty())
                {
                    Container container = getContainer();
                    User user = getUser();
                    Map<String, Object> context = getExtraContext();
                    List<Map<String, Object>> updatedRows = waterTable.getUpdateService().updateRows(user, container, toUpdate, oldKeys, null, context);
                    if (!updatedRows.isEmpty())
                    {
                        completeWaterGivenTask(taskIds, waterTable);
                    }
                }
            }
        }
    }

    private void completeWaterGivenTask(List<String> taskIds, TableInfo waterTable)
    {
        TableInfo taskTable = getTableInfo("ehr", "tasks");

        SimpleFilter waterTasks = new SimpleFilter(FieldKey.fromString("taskid"), taskIds, CompareType.IN);
        waterTasks.addCondition(FieldKey.fromString("qcstate/label"), EHRService.QCSTATES.Scheduled.getLabel(),CompareType.EQUAL);
        TableSelector wt = new TableSelector(waterTable, Collections.singleton("taskid"),waterTasks,null);

        List<String> remainingTask = wt.getArrayList(String.class);
        if (remainingTask.isEmpty())
        {
            SimpleFilter waterTasksToCompleted = new SimpleFilter(FieldKey.fromString("taskid"), taskIds, CompareType.IN);
            TableSelector completedWaterTask = new TableSelector(waterTable,Collections.singleton("taskid"),waterTasksToCompleted,null);
            List<String> lwt = completedWaterTask.getArrayList(String.class);
            //Look for task in Task table to complete task

            //note: allow draft records to count
            SimpleFilter filtertask = new SimpleFilter(FieldKey.fromString("taskid"), lwt, CompareType.IN);
            TableSelector tasks = new TableSelector(taskTable, filtertask, null);
            tasks.forEach(new Selector.ForEachBlock<ResultSet>()
            {
                @Override
                public void exec(ResultSet rs) throws SQLException
                {
                    String taskid = rs.getString("taskid");

                    Map<String, Object> toUpdate = new CaseInsensitiveHashMap<>();
                    toUpdate.put("qcstate", EHRService.QCSTATES.Completed.getQCState(getContainer()).getRowId());
                    toUpdate.put("taskid", taskid);
                    Table.update(getUser(), taskTable, toUpdate, taskid);
                }
            });
        }
    }

    public String waterLastThreeDays(String id, Date date, List<Map<String, Object>> recordsInTransaction){

        StringBuilder errorMsg = new StringBuilder();
        errorMsg.append("This animal has not received the required water for the last three days, requires exception from Vet staff <br>");
        int waterdays =0;

        if (recordsInTransaction.size() > 0)
        {
            Calendar waterTime = Calendar.getInstance();
            Calendar limitTime = Calendar.getInstance();
            waterTime.setTime(date);
            limitTime.setTime(date);
            limitTime.add(Calendar.DATE, -2);
            //limitTime.set(Calendar.MINUTE, 30);

            try
            {
                String animalId = id;


                //Using two hashtable for keeping track of unique waters and one for the sum of waters for the last three days
                Hashtable<Calendar, WaterInfo> waterAmount = new Hashtable<Calendar, WaterInfo>();
                Hashtable<String, WaterInfo> uniqueWater = new Hashtable<String, WaterInfo>();

                //have to zero out the time for all the time too match exactly, the db does not return times with the date from waterPrePivot
                limitTime.set(Calendar.MILLISECOND, 0);
                limitTime.set(Calendar.SECOND, 0);
                limitTime.set(Calendar.MINUTE, 0);
                limitTime.set(Calendar.HOUR, 0);
                limitTime.set(Calendar.HOUR_OF_DAY, 0);
                limitTime.set(Calendar.AM_PM, 0);
                for (int i = 0; i <= 2; i++)
                {
                    //Calendar tempCalendar = Calendar.getInstance();
                    Calendar tempCalendar = (Calendar) limitTime.clone();


                    tempCalendar.add(Calendar.DATE, i);
                    //initiating the total amount of water for a day with -1.0, this allow for including animals in the project
                    WaterInfo tempWater = new WaterInfo(tempCalendar.getTime(), -1.0);
                    waterAmount.put(tempCalendar, tempWater);
                }
                Double avWeight = new Double (0);

                TableInfo waterGiven = getTableInfo("study","WaterRecentWeight");
                SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id"), animalId);
                filter.addCondition(FieldKey.fromString("date"), limitTime.getTime(),CompareType.DATE_GTE);
                filter.addCondition(FieldKey.fromString("volume"), "null", CompareType.NONBLANK);
                TableSelector rawPreviousWater = new TableSelector(waterGiven, PageFlowUtil.set("id", "date", "volume", "InnerWeight", "objectid"),filter, null);
                Map<String, Object>[] waterFromServer = rawPreviousWater.getMapArray();

                //updating and adding waters from server, objectid will take are of any duplicates

                if (waterFromServer.length>0){
                    for (Map<String,Object> saveWater : waterFromServer){
                        WaterInfo waters = new WaterInfo(ConvertHelper.convert(saveWater.get("date"), Date.class), ConvertHelper.convert(saveWater.get("volume"), Double.class),ConvertHelper.convert(saveWater.get("InnerWeight"), Double.class));
                        String waterId = new String(ConvertHelper.convert(saveWater.get("objectid"), String.class));
                        uniqueWater.put(waterId, waters);

                    }
                }

                for (Map<String, Object> origMap : recordsInTransaction)
                {
                    Map<String, Object> map = new CaseInsensitiveHashMap<>(origMap);
                    if (!map.containsKey("date"))
                    {
                        _log.warn("TriggerScriptHelper.checkScheduledWaterTask was passed a previous record lacking a date");
                        continue;
                    }

                    Date rowDate = ConvertHelper.convert(map.get("date"), Date.class);
//                    Calendar zeroMills = Calendar.getInstance();
//                    zeroMills.setTime(rowDate);
//                    zeroMills.set(Calendar.MILLISECOND, 0);
//                    rowDate=zeroMills.getTime();

                    //only one row does not go to add the water amount uploaded

                    if (date.compareTo(rowDate)>=0)
                    {
                        Double weightDate = ConvertHelper.convert(map.get("weight"), Double.class);
                        if (weightDate == null){
                            TableInfo animalWeight = getTableInfo("study","demographicsMostRecentWeight");
                            SimpleFilter filterWeight = new SimpleFilter(FieldKey.fromString("Id"), animalId);
                            TableSelector ts = new TableSelector(animalWeight, Collections.singleton("MostRecentWeight"), filterWeight, null);
                            weightDate = ts.getObject(Double.class);
                        }
                        WaterInfo clientWater = new WaterInfo(ConvertHelper.convert(map.get("date"), Date.class), ConvertHelper.convert(map.get("volume"), Double.class),weightDate);
                        String clientObjectid = ConvertHelper.convert(map.get("objectid"), String.class);
                        uniqueWater.put(clientObjectid, clientWater);
                    }
                }

                if (!uniqueWater.isEmpty()){

                    Collection waterCollection = uniqueWater.values();

                    for (Object wi : waterCollection){
                        WaterInfo tempWater = (WaterInfo)wi;
                        Calendar tempCal = Calendar.getInstance();
                        tempCal.setTime(tempWater.getDate());


                        addWaterToDate(waterAmount, tempCal, tempWater.getQuantity(), tempWater.getWeigth());
                    }
                }

                if (!waterAmount.isEmpty()){
                    int maxDays  = 0;
                    int initialDays = 0;
                    Collection waterLastThreedays = waterAmount.values();

                    for (Object wl : waterLastThreedays){
                        WaterInfo waterCheck = (WaterInfo)wl;

                        if (waterCheck.getQuantity()==-1){
                            initialDays ++;
                        }
                        if (waterCheck.getQuantity()/waterCheck.getWeigth()<20){
                            maxDays++;
                        }
                    }
                    if (maxDays>2 && initialDays == 0){
                        return errorMsg.toString();
                    }
                }


            }catch(ConversionException e)
            {
                _log.error("TriggerScriptHelper.verifyBloodVolume was unable to parse date or qcstate", e);
                throw e;

            }






            if (waterdays>=2){

                return errorMsg.toString();
            }else
            {
                return null;
            }
        }
        return null;

    }

    public void addWaterToDate (Hashtable<Calendar, WaterInfo> waterAmount, Calendar HashDate, Double volume, Double weight){

        HashDate.set(Calendar.MILLISECOND, 0);
        HashDate.set(Calendar.SECOND, 0);
        HashDate.set(Calendar.MINUTE, 0);
        HashDate.set(Calendar.HOUR, 0);
        HashDate.set(Calendar.HOUR_OF_DAY, 0);
        HashDate.set(Calendar.AM_PM, 0);

        WaterInfo waterDate = waterAmount.get(HashDate);
        Double tempVolume = waterDate.getQuantity();
        if (tempVolume >= 0){
            tempVolume += volume;
            WaterInfo tempWater= new WaterInfo(tempVolume,weight);
            waterAmount.put(HashDate,tempWater);

        }else if (tempVolume == -1){

            WaterInfo tempWater= new WaterInfo(volume,weight);
            waterAmount.put(HashDate,tempWater);

        }


    }

    public JSONArray checkWaterRegulation(String animalId, Date clientStartDate, Date clientEndDate, String frequency, String waterSource, String objectId, Integer project, Map<String, Object> extraContext){

        String meaningFrequency = getMeaningFromRowid( frequency, "husbandry_frequency", "wnprc" );
        JSONArray arrayOfErrors = new JSONArray();
        JSONArray extraContextArray = new JSONArray();

        boolean existingOrder = false;

        Map<String, JSONObject> majorErrorMap = new HashMap<>();
        Map<String, JSONObject> errorMap = new HashMap<>();

        //TODO: Check is the animal is at least one time in the WaterSchedule Table
        if(checkIfAnimalInCondition(animalId,clientStartDate).size()==0){
            JSONObject returnErrors = new JSONObject();
            returnErrors.put("field", "Id");
            returnErrors.put("severity","ERROR");
            returnErrors.put("message","Animal not in waterScheduledAnimals table, contact compliance staff to enter new animals into the water monitoring system");
            majorErrorMap.put(objectId, returnErrors);

        }

        if (majorErrorMap.isEmpty()){
            //Setting interval to start the water schedule, the system generates the calendar thirty days before
            Calendar startInterval = Calendar.getInstance();
            startInterval.setTime(clientStartDate);
            startInterval.add(Calendar.DATE, -30);
            startInterval = DateUtils.truncate(startInterval, Calendar.DATE);

            final String intervalLength = "180";
            final String shortInterval = "15";

            //Sending parameters to the query that generates the water schedule from water orders and water amounts
            Map<String, Object> parameters = new CaseInsensitiveHashMap<>();
            parameters.put("NumDays",intervalLength);
            parameters.put("StartDate", startInterval.getTime());

            List<WaterDataBaseRecord> waterRecords = new ArrayList<>();

            Calendar startDate = Calendar.getInstance();
            startDate.setTime(clientStartDate);

            //Look for any orders that overlap in the waterScheduleCoalesced table
            TableInfo waterSchedule = getTableInfo("study","waterScheduleCoalesced");
            SimpleFilter filter = new SimpleFilter(FieldKey.fromString("animalId"), animalId);
            filter.addCondition(FieldKey.fromString("date"), startDate.getTime(),CompareType.DATE_GTE);
            filter.addCondition(FieldKey.fromString("waterSource"),"regulated");
            //filter.addCondition(FieldKey.fromString("frequency"), frequency);

            //Adding all the water records from database to a list of waterRecord objects that can be compared
            TableSelector waterOrdersFromDatabase = new TableSelector(waterSchedule, PageFlowUtil.set( "taskId","objectid","lsid","animalId", "date", "startDateCoalesced","endDateCoalescedFuture","dataSource","project","frequency", "assignedTo","volume"), filter, null);
            waterOrdersFromDatabase.setNamedParameters(parameters);
            waterRecords.addAll(waterOrdersFromDatabase.getArrayList(WaterDataBaseRecord.class));

            JSONObject returnErrors = new JSONObject();


            for (WaterDataBaseRecord waterRecord : waterRecords)
            {
                //If the record is updated it should allow to enter new information.
                if (waterRecord.getObjectId().compareTo(objectId) != 0){

                    //Checking id the animal already has a water order, if so the function will not add an
                    //entry to the waterScheduledAnimals
                    if (waterRecord.getDataSource().equals("waterOrders"))
                    {
                        existingOrder = true;
                    }

                    LocalDate startLoop = convertToLocalDateViaSqlDate(clientStartDate);
                    LocalDate endOfLoop;

                    //Open water orders do not  have and end date but to compared we need to add a date to the loop
                    //we used the same date for generating the waterScheduleCoalesced
                    if (clientEndDate ==  null){
                        endOfLoop = convertToLocalDateViaSqlDate(clientStartDate).plusDays(Integer.parseInt(intervalLength));

                    }else{

                        endOfLoop = convertToLocalDateViaSqlDate(clientEndDate);
                    }

                    //For loop to compare the new interval for the waterOrder with every record in database
                    for (LocalDate loopDate = startLoop ; !loopDate.isAfter(endOfLoop); loopDate = loopDate.plusDays(1)){

                        if (loopDate.compareTo(convertToLocalDateViaSqlDate(waterRecord.getDate()))==0){

                            String serverMeaning = getMeaningFromRowid( waterRecord.getFrequency(), "husbandry_frequency", "wnprc" );

                            //Check frequency compatibility with water orders in the server
                            if (!checkFrequencyCompatibility(serverMeaning, meaningFrequency))
                            {

                                //Formatting the dates to return a legible date for error message
                                DateTimeFormatter dateFormatted = DateTimeFormatter.ISO_LOCAL_DATE;
                                String startFormatDate = dateFormatted.format(convertToLocalDateViaSqlDate(waterRecord.getStartDateCoalesced()));
                                String endFormattedDate;

                                LocalDate endDateFromServer = convertToLocalDateViaSqlDate(waterRecord.getEndDateCoalescedFuture());

                                //If the  date in the server is after the endOfLoop date, we return "Future" as the date
                                if (endDateFromServer.isAfter(endOfLoop))
                                {
                                    endFormattedDate = "Future";
                                }
                                else
                                {
                                    endFormattedDate = dateFormatted.format(endDateFromServer);
                                }

                                //Creating the link to allow users to edit the error returned by this function.
                                ActionURL editURL = new ActionURL("EHR", "manageRecord", container);

                                editURL.addParameter("schemaName", "study");
                                editURL.addParameter("queryName", waterRecord.getDataSource());
                                editURL.addParameter("keyField", "lsid");
                                editURL.addParameter("key", waterRecord.getLsid());

                                //Check overlapping waters since they have startDate and endDate
                                //TODO: add error to extraContext to handle water order within the calendar UI
                                if (waterRecord.getDataSource().equals("waterOrders"))
                                {
                                    //show error when the clientStartDate is greater than an order already in the system, the overlap is
                                    //at the beginning of the new order
                                    if (clientStartDate.getTime() > waterRecord.getStartDateCoalesced().getTime())
                                    {
                                        returnErrors.put("field", "date");
                                        //return error if the clientEndDate is greater than the startDate from the order in the server
                                        //
                                    }
                                    //Check if record from database startDate is smaller than the clientEndDate
                                    //New water order overlaps with an existing water order on the system starting earlier than the new order's endDate
                                    else if (Date.from(endOfLoop.atStartOfDay(ZoneId.systemDefault()).toInstant()).getTime() > waterRecord.getStartDateCoalesced().getTime())
                                    {
                                        returnErrors.put("field", "enddate");
                                    }
                                    else
                                    {
                                        returnErrors.put("field", "frequency");
                                    }
                                    //Adding dataSource, objetcId, severity and message to the exception in case of error
                                    returnErrors.put("dataSource", waterRecord.getDataSource());
                                    returnErrors.put("message", "Overlapping Water Order already in the system. Start date: " + startFormatDate +
                                            " End Date: " + endFormattedDate +" Frequency: "+waterRecord.getFrequency() +" Source: " + waterRecord.getDataSource() + " <a href='" + editURL.toString() + "' target=\"_blank\" rel=\"noopener noreferrer\"><b> EDIT</b></a>");
                                    returnErrors.put("objectId", waterRecord.getObjectId());
                                    returnErrors.put("severity", "ERROR");

                                }
                                //Performed similar validation with waterAmounts saved in the system
                                //Any existing waterAmount inside the interval should be left as is
                                //WaterAmounts outside the modify water order should return an error to the client
                                if (waterRecord.getDataSource().equals("waterAmount")){

                                    //check if waterAmounts are outside the new order interval add warnings to users
                                    //In waterAmount StartDate and EndDate are the same
                                    if (waterRecord.getStartDateCoalesced().getTime() > Date.from(endOfLoop.atStartOfDay(ZoneId.systemDefault()).toInstant()).getTime()){
                                        returnErrors.put("field", "enddate");
                                        returnErrors.put("severity", "ERROR");
                                        returnErrors.put("message", "There are one or more waterAmounts that are outside the new range for the updated water order");
                                    }
                                }
                            }
                        }
                    }

                    //Additional check to informed of any water amounts in the future that wold stay in the system after the water order is modified
                    //This validation is outside the previous loop because this waterAmounts will be outside the new date range.

                    if (waterRecord.getDataSource().equals("waterAmount")){
                        //JSONObject returnErrors = new JSONObject();
                        JSONObject extraContextObject = new JSONObject();

                        //check if waterAmounts are outside the new order interval add warnings to users
                        //In waterAmount StartDate and EndDate are the same
                        if (waterRecord.getStartDateCoalesced().getTime() > Date.from(endOfLoop.atStartOfDay(ZoneId.systemDefault()).toInstant()).getTime()){

                            // Building link for allow user to edit waterAmounts in future
                            ActionURL editAmountURL = new ActionURL("EHR", "manageRecord", container);
                            editAmountURL.addParameter("schemaName", "study");
                            editAmountURL.addParameter("queryName", waterRecord.getDataSource());
                            editAmountURL.addParameter("keyField", "lsid");
                            editAmountURL.addParameter("key", waterRecord.getLsid());

                            //Format date to printed better version of date for returning it to the client
                            String pattern = "yyyy-MM-dd";
                            SimpleDateFormat simpleDateFormat = new SimpleDateFormat(pattern);
                            String htmlDate = simpleDateFormat.format(waterRecord.getDate());


                            returnErrors.put("field", "animalId");
                            returnErrors.put("severity", "ERROR");
                            //returnErrors.put("message", "The waterAmount on "+ htmlDate +" for the "+ waterRecord.getVolume() +"ml is outside the new range for the updated water order " + " <a href='" + editAmountURL.toString() + "'><b> EDIT</b></a>");
                            returnErrors.put("message", "The waterAmount on "+ htmlDate +" for the "+ waterRecord.getVolume() +"ml is outside the new range for the updated water order " + " <a href='" + editAmountURL.toString() + "'><b> EDIT</b></a>");

                            extraContextObject.put("date", htmlDate);
                            extraContextObject.put("objectId",waterRecord.getObjectId());
                            extraContextObject.put("volume", waterRecord.getVolume());

                            extraContextArray.put(extraContextObject);


                            //extraContext.put("objectId",waterRecord.getObjectId());
                        }
                    }
                    if (!returnErrors.isEmpty() && checkIfAnimalInCondition(animalId,clientStartDate).size()>0){
                        errorMap.put(waterRecord.getObjectId(), returnErrors);
                        extraContext.put("extraContextArray", extraContextArray);
                    }
                }
            }

            //JSONObject returnErrors = new JSONObject();
            if (returnErrors.isEmpty() && !existingOrder)
            {
                //Closing existing lixit order in the system and adding a record in the waterScheduleAnimals table
                TableInfo waterOrders = getTableInfo("study","waterOrders");
                SimpleFilter filterOrders = new SimpleFilter (FieldKey.fromString("Id"), animalId);
                filterOrders.addCondition(FieldKey.fromString("waterSource"),"lixit", CompareType.EQUAL);
                filterOrders.addCondition(FieldKey.fromString("enddateCoalesced"),clientStartDate,CompareType.DATE_GTE);

                TableSelector waterOrderRecords = new TableSelector(waterOrders, PageFlowUtil.set("lsid", "id", "date","frequency","enddateCoalesced"),filterOrders,null);
                Map <String,Object>[] waterOrderObject = waterOrderRecords.getMapArray();
                List<Map<String, Object>> toUpdate = new ArrayList<>();
                List<Map<String, Object>> oldKeys = new ArrayList<>();

                if (waterOrderObject.length > 0){
                    // JSONObject returnErrors = new JSONObject();

                    for (Map<String,Object> waterOrderMap : waterOrderObject){

                        String lsid = ConvertHelper.convert(waterOrderMap.get("lsid"), String.class);

                        Map<String, Object> updateWaterOrder = new CaseInsensitiveHashMap<>();
                        updateWaterOrder.put("lsid", lsid);
                        updateWaterOrder.put("enddate",clientStartDate);
                        updateWaterOrder.put("skipWaterRegulationCheck", true);
                        toUpdate.add(updateWaterOrder);

                        Map<String, Object> keyMap = new CaseInsensitiveHashMap<>();
                        keyMap.put("lsid", lsid);
                        oldKeys.add(keyMap);
                    }

                }

                //TODO: only change water schedule animals if they are not in Lixit
                Map animalCondition = checkIfAnimalInCondition(animalId,clientStartDate);
                if ("lixit".equals(animalCondition.get(animalId).toString())){
                    List<Map<String, Object>> rowToAdd = null;

                    JSONObject scheduledAnimalRecord = new JSONObject();
                    scheduledAnimalRecord.put("date", clientStartDate);
                    scheduledAnimalRecord.put("id", animalId);
                    scheduledAnimalRecord.put("condition", waterSource);
                    scheduledAnimalRecord.put("project", project);
                    scheduledAnimalRecord.put("mlsperKg",animalCondition.get("mlsPerKg"));

                    rowToAdd = SimpleQueryUpdater.makeRowsCaseInsensitive(scheduledAnimalRecord);

                    try
                    {
                        if(!toUpdate.isEmpty()){
                            Container container = getContainer();
                            User user = getUser();
                            List<Map<String, Object>> updateRows = waterOrders.getUpdateService().updateRows(user,container,toUpdate,oldKeys, null, null);
                            if (updateRows.isEmpty()){
                                returnErrors.put("field", "Id");
                                returnErrors.put("severity", "ERROR");
                                returnErrors.put("message", "Error closing Lixit/Ad Lib orders.");

                            }

                        }
                        insertRows(rowToAdd, "study", "waterScheduledAnimals");
                    }
                    catch (Exception e)
                    {
                        returnErrors.put("field", "project");
                        returnErrors.put("severity", "ERROR");
                        returnErrors.put("message", "Error changing condition.");

                        errorMap.put(objectId, returnErrors);
                    }

                }

            }

            errorMap.forEach((objectIdString, JSONObject)->{
                arrayOfErrors.put(JSONObject);
            });

        }



        majorErrorMap.forEach((objectIdString, JSONObject)->{
            arrayOfErrors.put(JSONObject);
        });




        return arrayOfErrors;
    }
    public JSONArray checkWaterSchedule(String  animalId, Date clientDate, String objectId, Double clientVolume, List<Map<String,Object>> waterInForm){
        Double waterInTransaction = 0.0;
        if (waterInForm != null){
            for (Map<String,Object> origMap : waterInForm){

                Map <String,Object> map = new CaseInsensitiveHashMap<>(origMap);

                try {
                    Double volume = ConvertHelper.convert(map.get("volume"),Double.class);
                    if (!objectId.equals(ConvertHelper.convert(map.get("objectid"),String.class)))
                    {
                        waterInTransaction += volume;
                    }
                }catch (ConversionException e){
                    _log.error("TriggerScriptHelper.checkWaterSchedule", e);
                }
            }
        }
        JSONArray arrayOfErrors = new JSONArray();


        Map<String, JSONObject> errorMap = new HashMap<>();
        boolean proceedValidation = true;

        if(checkIfAnimalInCondition(animalId,clientDate).size()==0){
            JSONObject returnErrors = new JSONObject();

            returnErrors.put("field", "id");
            returnErrors.put("severity","ERROR");
            returnErrors.put("message","Animal not in waterScheduledAnimals table, contact compliance staff to enter new animals into the water monitoring system");
            errorMap.put(objectId, returnErrors);
            proceedValidation = false;

        }
        if (proceedValidation)

        {
            Calendar startDate = Calendar.getInstance();
            startDate.setTime(clientDate);

            List<WaterDataBaseRecord> waterGivenRecords = new ArrayList<>();

            //Look for any completed water vol in  waterGiven for the date of the clientDate
            TableInfo waterGiven = getTableInfo("study", "waterGiven");
            SimpleFilter filterWaterGiven = new SimpleFilter(FieldKey.fromString("Id"), animalId);
            filterWaterGiven.addCondition(FieldKey.fromString("date"), startDate.getTime(), CompareType.DATE_EQUAL);
            filterWaterGiven.addCondition(FieldKey.fromString("QCState/label"), "Completed", CompareType.EQUAL);


            //Adding all the water records from database to a list of waterRecord objects that can be compared
            TableSelector waterGivenFromDatabase = new TableSelector(waterGiven, PageFlowUtil.set("taskId", "objectid", "lsid", "animalId", "date", "project", "assignedTo", "volume"), filterWaterGiven, null);

            waterGivenRecords.addAll(waterGivenFromDatabase.getArrayList(WaterDataBaseRecord.class));

            Double waterCompleted = 0.0;
            for (WaterDataBaseRecord waterRecord : waterGivenRecords)
            {
                if (waterRecord.getVolume() != null && !objectId.equals(waterRecord.getObjectId()))
                {
                    waterCompleted += waterRecord.getVolume();
                }
            }


            //Setting interval to start the water schedule, the system generates the calendar thirty days before
            Calendar startInterval = Calendar.getInstance();
            startInterval.setTime(clientDate);
            startInterval.add(Calendar.DATE, -5);
            startInterval = DateUtils.truncate(startInterval, Calendar.DATE);

            final String intervalLength = "10";

            //Sending parameters to the query that generates the water schedule from water orders and water amounts
            Map<String, Object> parameters = new CaseInsensitiveHashMap<>();
            parameters.put("NumDays", intervalLength);
            parameters.put("StartDate", startInterval.getTime());

            List<WaterDataBaseRecord> waterRecords = new ArrayList<>();

            //Look for any orders that overlap in the waterScheduleCoalesced table
            TableInfo waterSchedule = getTableInfo("study", "waterScheduleCoalesced");
            SimpleFilter filter = new SimpleFilter(FieldKey.fromString("animalId"), animalId);
            filter.addCondition(FieldKey.fromString("date"), startDate.getTime(), CompareType.DATE_EQUAL);
            filter.addCondition(FieldKey.fromString("QCState/label"), "Scheduled", CompareType.EQUAL);
            filter.addCondition(FieldKey.fromString("waterSource"), "regulated");

            //Adding all the water records from database to a list of waterRecord objects that can be compared
            TableSelector waterOrdersFromDatabase = new TableSelector(waterSchedule, PageFlowUtil.set("taskId", "objectid", "lsid", "animalId", "date", "startDateCoalesced", "endDateCoalescedFuture", "dataSource", "project", "frequency", "assignedTo", "volume"), filter, null);
            waterOrdersFromDatabase.setNamedParameters(parameters);
            waterRecords.addAll(waterOrdersFromDatabase.getArrayList(WaterDataBaseRecord.class));

            Double waterScheduledFromServer = 0.0;

            for (WaterDataBaseRecord waterRecord : waterRecords)
            {
                if (waterRecord.getVolume() != null && !objectId.equals(waterRecord.getObjectId()))
                {

                    if (waterRecord.getAnimalId().equals(animalId))
                    {
                        waterScheduledFromServer += waterRecord.getVolume();
                    }
                    Double totalScheduleWater = waterCompleted + waterScheduledFromServer + clientVolume + waterInTransaction;

                    JSONObject returnErrors = new JSONObject();
                    returnErrors.put("field", "volume");
                    returnErrors.put("severity", "INFO");
                    returnErrors.put("message", "Animal was given "+ waterCompleted + " mL and has scheduled water orders for " + waterScheduledFromServer +
                            " mL, assigned to " + waterRecord.getAssignedTo() + ". Adding " + clientVolume + " mL and other records in this form makes a total of " + totalScheduleWater + " mL.");
                    //Always attaches the error to the row in client and overwrites if there is more than one record
                    errorMap.put(objectId, returnErrors);

                }

            }
        }
        errorMap.forEach((objectIdString, JSONObject)->{
            arrayOfErrors.put(JSONObject);
        });

        return arrayOfErrors;



    }

    public LocalDate convertToLocalDateViaSqlDate(Date dateToConvert) {
        return new java.sql.Date(dateToConvert.getTime()).toLocalDate();
    }

    public boolean checkFrequencyCompatibility(String serverRecord, String clientRecord){
        boolean validation;

        if (serverRecord.compareTo(clientRecord) == 0){
            validation = false;
            return validation;
        }
        switch (clientRecord){
            case "Daily - AM/PM":
                if (serverRecord.compareTo("Daily - AM")==0){
                    validation = false;
                    break;
                }
                if (serverRecord.compareTo("Daily - PM")==0){
                    validation = false;
                    break;
                }
            case "Daily":
            //case "ˆDaily":
                if(serverRecord.compareTo("Monday") == 0 || serverRecord.compareTo("Tuesday") == 0 ||
                        serverRecord.compareTo("Wednesday") == 0 || serverRecord.compareTo("Thursday") == 0 ||
                        serverRecord.compareTo("Friday") == 0 || serverRecord.compareTo("Saturday") == 0 ||
                        serverRecord.compareTo("Sunday") == 0)  {
                    validation = false;
                    break;
                }

            default:
                if (clientRecord.matches("Daily.*")){
                    if(serverRecord.compareTo("Monday") == 0 || serverRecord.compareTo("Tuesday") == 0 ||
                            serverRecord.compareTo("Wednesday") == 0 || serverRecord.compareTo("Thursday") == 0 ||
                            serverRecord.compareTo("Friday") == 0 || serverRecord.compareTo("Saturday") == 0 ||
                            serverRecord.compareTo("Sunday") == 0)  {
                        validation = false;
                        break;
                    }

                }

                validation = true;

        }
        if (validation)
        {
            switch (serverRecord)
            {
                case "Daily":
                    if (clientRecord.compareTo("Monday") == 0 || clientRecord.compareTo("Tuesday") == 0 ||
                            clientRecord.compareTo("Wednesday") == 0 || clientRecord.compareTo("Thursday") == 0 ||
                            clientRecord.compareTo("Friday") == 0 || clientRecord.compareTo("Saturday") == 0 ||
                            clientRecord.compareTo("Sunday") == 0)
                    {
                        validation = false;
                        break;
                    }

                default:
                    validation = true;

            }
        }

        return validation;

    }

    public static class WaterInfo
    {
        //private String _objectId;
        private Date _date;
        private double _quantity;
        private double _weight;

        public WaterInfo() {}

        public WaterInfo( Double quantity, Double weight)
        {
            //_objectId = objectId;
            //setDate(date);
            _quantity = quantity;
            setWeight(weight);
        }
        public WaterInfo( Date date, Double quantity)
        {
            //_objectId = objectId;
            setDate(date);
            _quantity = quantity;
            //setWeight(weight);
        }
        public WaterInfo(Date date, Double quantity, Double weight)
        {
            //_objectId = objectId;
            setDate(date);
            _quantity = quantity;
            setWeight(weight);
        }

        public Date getDate()
        {
            return _date;
        }

        public double getQuantity()
        {
            return _quantity;
        }

        public double getWeigth()
        {
            return _weight;
        }

        public void setDate(Date date)
        {
            _date = date;
        }

        public void setQuantity(double quantity)
        {
            _quantity = quantity;
        }

        public void setWeight(double weight)
        {
            _weight = weight;
        }
    }

    public static class WaterDataBaseRecord {

        private String taskId;
        private String objectId;
        private String lsid;
        private String animalId;
        private Date date;
        private Date startDateCoalesced;
        private Date endDateCoalescedFuture;
        private String dataSource;
        private String project;
        private String frequency;
        private String assignedTo;
        private Double volume;

        public void setTaskId(String taskId)
        {
            this.taskId = taskId;
        }

        public void setObjectId(String objectId)
        {
            this.objectId = objectId;
        }

        public void setLsid(String lsid)
        {
            this.lsid = lsid;
        }

        public void setAnimalId(String animalId)
        {
            this.animalId = animalId;
        }

        public void setDate(Date date)
        {
            this.date = date;
        }

        public void setStartDateCoalesced(Date startDateCoalesced)
        {
            this.startDateCoalesced = startDateCoalesced;
        }

        public void setEnddateCoalescedFuture(Date enddateCoalescedFuture){ this.endDateCoalescedFuture = enddateCoalescedFuture; }

        public void setDataSource(String dataSource)
        {
            this.dataSource = dataSource;
        }

        public void setProject(String project)
        {
            this.project = project;
        }

        public void setFrequency(String frequency)
        {
            this.frequency = frequency;
        }

        public void setVolume(Double volume)
        {
            this.volume = volume;
        }

        public void setAssignedTo(String assignedTo)
        {
            this.assignedTo = assignedTo;
        }



        public String getTaskId()
        {
            return taskId;
        }

        public String getObjectId()
        {
            return objectId;
        }

        public String getLsid()
        {
            return lsid;
        }

        public String getAnimalId()
        {
            return animalId;
        }

        public Date getDate()
        {
            return date;
        }

        public Date getStartDateCoalesced()
        {
            return startDateCoalesced;
        }

        public Date getEndDateCoalescedFuture()
        {
            return endDateCoalescedFuture;
        }

        public String getDataSource()
        {
            return dataSource;
        }

        public String getProject()
        {
            return project;
        }

        public String getFrequency()
        {
            return frequency;
        }

        public Double getVolume()
        {
            return volume;
        }

        public String getAssignedTo()
        {
            return assignedTo;
        }

        public void setFromMap (Map<String, Object> propertiesMap){

            for (Map.Entry<String, Object> prop : propertiesMap.entrySet())
            {
                if (prop.getKey().equalsIgnoreCase("taskId") && prop.getValue() instanceof String)
                    setTaskId((String)prop.getValue());
                else if (prop.getKey().equalsIgnoreCase("objectId") && prop.getValue() instanceof String)
                    setObjectId((String)prop.getValue());
                else if (prop.getKey().equalsIgnoreCase("animalId") && prop.getValue() instanceof String)
                    setAnimalId((String)prop.getValue());
                else if (prop.getKey().equalsIgnoreCase("startDate") && prop.getValue() instanceof Date)
                    setStartDateCoalesced((Date)prop.getValue());
                else if (prop.getKey().equalsIgnoreCase("endDate") && prop.getValue() instanceof Date)
                    setEnddateCoalescedFuture((Date)prop.getValue());
                else if (prop.getKey().equalsIgnoreCase("dataSource") && prop.getValue() instanceof String)
                    setDataSource((String)prop.getValue());
                else if (prop.getKey().equalsIgnoreCase("frequency") && prop.getValue() instanceof String)
                    setFrequency((String)prop.getValue());

            }


        }
    }

    //Generic function to get lookup table to get meaning from rowid
    //improvement to return a map with all the items in the table and only call the db once
    public String getMeaningFromRowid (String lookupColumn, String lookupTable){
        return getMeaningFromRowid(lookupColumn, lookupTable, "ehr_lookups");
    }
    public String getMeaningFromRowid (String lookupColumn, String lookupTable, String lookupSchema){

        TableInfo husbandryFrequency = getTableInfo(lookupSchema, lookupTable);
        int frequencyNumber = Integer.parseInt(lookupColumn);
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("rowid"), frequencyNumber, CompareType.EQUAL);
        filter.addCondition(FieldKey.fromString("active"), true);
        //filter.addCondition(FieldKey.fromString("active"), true, CompareType.EQUAL);
        TableSelector frequencyRecord = new TableSelector(husbandryFrequency, PageFlowUtil.set("rowid", "meaning", "sort_order", "active"),filter, null);
        String returnMeaning = null;

        Map <String,Object>[] frequencyObject = frequencyRecord.getMapArray();

        if (frequencyObject.length > 0)
        {
            for (Map<String, Object> frequencyMap : frequencyObject)
            {
                returnMeaning = ConvertHelper.convert(frequencyMap.get("meaning"), String.class);

            }
        }


       /* //Look for any orders that overlap in the waterScheduleCoalesced table
        TableInfo waterSchedule = getTableInfo("study","waterScheduleCoalesced");
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("animalId"), animalId);
        //filter.addCondition(FieldKey.fromString("date"), startDate.getTime(),CompareType.DATE_GTE);
        //filter.addCondition(FieldKey.fromString("frequency"), frequency);

        if (waterSchedule != null){
            try (Results rs  = QueryService.get().select(waterSchedule, waterSchedule.getColumns(), filter, null, parameters, false))
            {
                Map<String, Object> rowMap = new CaseInsensitiveHashMap<>();
                if (rs.next())
                {
                    for (String colName : waterSchedule.getColumnNameSet())
                    {
                        Object value = rs.getObject(FieldKey.fromParts(colName));
                        if (value != null)
                            rowMap.put(colName, value);
                    }
                }
                WaterDataBaseRecord addRecord = new WaterDataBaseRecord();
                addRecord.setFromMap(rowMap);
                waterRecords.add(addRecord);

            }
            catch (SQLException e){
                throw new RuntimeException(e);

            }
        }*/

        return returnMeaning;
    }

    public Map<String,Object> checkIfAnimalInCondition(String animalId, Date clientDate)
    {
        Map<String,Object> returnCondition = new HashMap<>();

        Calendar filterDate = Calendar.getInstance();
        filterDate.setTime(clientDate);

        TableInfo waterGiven = getTableInfo("study","waterScheduledAnimals");
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id"), animalId);
        filter.addCondition(FieldKey.fromString("date"), filterDate.getTime(),CompareType.DATE_LTE);

        Sort sort = new Sort();
        sort.appendSortColumn(FieldKey.fromString("date"), Sort.SortDirection.DESC, false);


        TableSelector rawAnimals = new TableSelector(waterGiven, PageFlowUtil.set("id", "date", "condition", "mlsperKg"),filter, sort);
        rawAnimals.setMaxRows(1);
        Map<String, Object>[] animalsFromServer = rawAnimals.getMapArray();

        //updating and adding waters from server, objectid will take are of any duplicates

        if (animalsFromServer.length>0){
            for (Map<String, Object> animalRestricted : animalsFromServer)
            {
                String condition = ConvertHelper.convert(animalRestricted.get("condition"), String.class);
                returnCondition.put(animalId, ConvertHelper.convert(animalRestricted.get("condition"), String.class));
                returnCondition.put("mlsPerKg", ConvertHelper.convert(animalRestricted.get("mlsperKg"), Double.class));

            }
        }
        return  returnCondition;
    }

    //This function will always have lixit as the waterSource
    public JSONArray changeWaterScheduled(String animalId, Date startDate, String waterSource, Integer project, String objectId, Map<String, Object> extraContext) throws Exception
    {
        JSONArray arrayOfErrors = new JSONArray();
        JSONArray extraContextArray = new JSONArray();
        JSONObject returnErrors = new JSONObject();



        Map<String, JSONObject> errorMap = new HashMap<>();

        if(checkIfAnimalInCondition(animalId,startDate).size()==0 || checkIfAnimalInCondition(animalId,startDate).get(animalId).equals("lixit")){
            returnErrors.put("field","waterSource");
            returnErrors.put("severity", "ERROR");
            returnErrors.put("message", "Error animal not in WaterScheduleAnimal table or is already in "+waterSource +" condition");
            arrayOfErrors.put(returnErrors);
            //errorMap.put(animalId, returnErrors);

        }

        TableInfo waterOrders = getTableInfo("study","waterOrders");
        SimpleFilter filter = new SimpleFilter (FieldKey.fromString("id"), animalId);
        filter.addCondition(FieldKey.fromString("waterSource"),"regulated");
        filter.addCondition(FieldKey.fromString("enddateCoalescedFuture"),startDate,CompareType.DATE_GT);

        TableSelector waterOrderRecords = new TableSelector(waterOrders, PageFlowUtil.set("lsid", "objectid","id", "date","volume","frequency","enddateCoalescedFuture"),filter,null);
        Map <String,Object>[] waterOrderObjects = waterOrderRecords.getMapArray();
        List<Map<String, Object>> toUpdate = new ArrayList<>();
        List<Map<String, Object>> oldKeys = new ArrayList<>();

        if (waterOrderObjects.length >0)
        {



            for (Map<String, Object> waterOrderMap : waterOrderObjects)
            {

                String lsid = ConvertHelper.convert(waterOrderMap.get("lsid"), String.class);

                Map<String, Object> updateWaterOrder = new CaseInsensitiveHashMap<>();
                updateWaterOrder.put("lsid", lsid);
                updateWaterOrder.put("enddate", startDate);
                updateWaterOrder.put("skipWaterRegulationCheck", true);
                toUpdate.add(updateWaterOrder);

                Map<String, Object> keyMap = new CaseInsensitiveHashMap<>();
                keyMap.put("lsid", lsid);
                oldKeys.add(keyMap);
                returnErrors.put("field", "waterSource");
                returnErrors.put("severity", "INFO");
                returnErrors.put("message", "This one or more water orders that will be closed and the animal will be switch to Lixit");
                JSONObject extraContextObject = new JSONObject();

                extraContextObject.put("date", waterOrderMap.get("date"));
                extraContextObject.put("volume", waterOrderMap.get("volume"));
                String frequencyMeaning = getMeaningFromRowid(waterOrderMap.get("frequency").toString(), "husbandry_frequency", "wnprc");
                extraContextObject.put("frequency", frequencyMeaning);

                arrayOfErrors.put(returnErrors);
                extraContextArray.put(extraContextObject);

            }


        }

        List<Map<String, Object>> rowToAdd = null;


        JSONObject scheduledAnimalRecord = new JSONObject();
        scheduledAnimalRecord.put("date", startDate);
        scheduledAnimalRecord.put("id",animalId);
        scheduledAnimalRecord.put("condition",waterSource);
        scheduledAnimalRecord.put("project", project);
        scheduledAnimalRecord.put("mlsPerKg", "20");

        rowToAdd = SimpleQueryUpdater.makeRowsCaseInsensitive(scheduledAnimalRecord);
        //ti = QueryService.get().getUserSchema(getUser(), getContainer(), "study").getTable("waterScheduledAnimals");
        //service = ti.getUpdateService();

        //if(errorMap.get(animalId)!= null &&  !"ERROR".equals(errorMap.get(animalId).get("severity")))
        if( arrayOfErrors.length() > 0 &&  !"ERROR".equals(returnHighestError(arrayOfErrors)))
        {
            try
            {
                if (!toUpdate.isEmpty())
                {
                    Container container = getContainer();
                    User user = getUser();
                    List<Map<String, Object>> updatedRows = waterOrders.getUpdateService().updateRows(user, container, toUpdate, oldKeys, null, null);
                    if (updatedRows.isEmpty())
                    {
                        returnErrors.put("field", "project");
                        returnErrors.put("severity", "ERROR");
                        returnErrors.put("message", "Error closing water orders ");
                        arrayOfErrors.put(returnErrors);
                        //errorMap.put(animalId, returnErrors);
                    }
                }
                insertRows(rowToAdd, "study", "waterScheduledAnimals");
            }
            catch (Exception e)
            {
                returnErrors.put("field", "project");
                returnErrors.put("severity", "ERROR");
                returnErrors.put("message", "Error adding animal to waterScheduleAnimals table "+e.getMessage());
                arrayOfErrors.put(returnErrors);
                //errorMap.put(animalId, returnErrors);

            }
        }
        if (extraContextArray.length()>0){
            extraContext.put("extraContextArray", extraContextArray);
        }

        /*errorMap.forEach((objectIdString, JSONObject)->{
            arrayOfErrors.put(JSONObject);
        });*/

        return arrayOfErrors;
    }

    public String returnHighestError (JSONArray arrayOfErrors){
        String highestError = "INFO";
        for (int i = 0; i < arrayOfErrors.length();i++ ){
            JSONObject error = arrayOfErrors.getJSONObject(i);
            if ("ERROR".equals(error.get("severity"))){
                highestError = "ERROR";
            }else if ("WARN".equals(error.get("severity")) && !"ERROR".equals(highestError)){
                highestError = "WARN";
            } else if ("INFO".equals(error.get("severity")) && (!"ERROR".equals(highestError) || !"WARN".equals(highestError))){
                highestError = "INFO";
            }
        }
        return highestError;


    }


    public void sendProjectNotification(String hostName){

        _log.info("Using java helper to send email for project request record: ");
        Module ehr = ModuleLoader.getInstance().getModule("EHR");
        ProjectRequestNotification notification = new ProjectRequestNotification(ehr,user,hostName);
        Container ehrContainer =  ContainerManager.getForPath("/WNPRC/EHR");
        notification.sendManually(ehrContainer,user);
    }

    public String getVLStatus(User user, Container container, Integer status) throws SQLException
    {

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Key"), status);
        QueryHelper viralLoadQuery = new QueryHelper(container, user, "lists", "status");

        // Define columns to get
        List<FieldKey> columns = new ArrayList<>();
        columns.add(FieldKey.fromString("Key"));
        columns.add(FieldKey.fromString("Status"));

        // Execute the query
        String thestatus = null;
        try ( Results rs = viralLoadQuery.select(columns, filter) )
        {
            if (rs.next()){
                thestatus = rs.getString(FieldKey.fromString("Status"));
            }
        }
        return thestatus;
    }

    public void sendViralLoadQueueNotification(String[] keys, Map<String,Object> emailProps) throws SQLException
    {
        Module ehr = ModuleLoader.getInstance().getModule("EHR");
        Container viralLoadContainer = ContainerManager.getForPath("/WNPRC/WNPRC_Units/Research_Services/Virology_Services/viral_load_sample_tracker/");
        String recordStatus = getVLStatus(user, viralLoadContainer, (Integer) emailProps.get("status"));
        if ("08-complete-email-Zika_portal".equals(recordStatus)){
            //_log.info("Using java helper to send email for viral load queue record: "+key);
            ViralLoadQueueNotification notification = new ViralLoadQueueNotification(ehr, keys, user, viralLoadContainer, emailProps);
            Container ehrContainer =  ContainerManager.getForPath("/WNPRC/EHR");
            notification.sendManually(ehrContainer);
        }
    }

    // Returns a list of vendor ids if they do not match the current enteredVendorId
    public List<String> checkOldVendorIds(String objectid, String animalId, String enteredVendorId) throws SQLException
    {
        SimpleQueryFactory queryFactory = new SimpleQueryFactory(user, container);
        SimplerFilter filter = new SimplerFilter("Id", CompareType.EQUAL, animalId);
        filter.addCondition("objectid", CompareType.DOES_NOT_CONTAIN, objectid);

        JSONArray arrivals = queryFactory.selectRows("study", "arrival", filter);
        List<String> l = new ArrayList<>();
        for (int i = 0; i < arrivals.length(); i++)
        {
            String vendorId = (String) arrivals.getJSONObject(i).get("vendor_id");
            if (vendorId != null)
            {
                if (!enteredVendorId.equals(vendorId))
                {
                    l.add(vendorId);
                    return l;
                }
            }
        }
        return l;
    }

    // get the friendly label of a field given a table and field name
    public static String getFieldLabel(TableInfo ti, String fieldName)
    {
        return (ti != null && fieldName != null) ? ti.getColumn(fieldName).getLabel() : null;
    }

    // builds up a difference map with field label -> [old value, new value]
    public static Map<String, ArrayList<String>> buildDifferencesMap(TableInfo ti, Map<String, Object> oldRow, Map<String, Object> newRow)
    {
        Map<String, ArrayList<String>> theDifferences = new TreeMap<>();
        Map<String, MapDifference.ValueDifference<Object>> getDiff = Maps.difference(oldRow,newRow).entriesDiffering();
        for (Map.Entry<String, MapDifference.ValueDifference<Object>> in : getDiff.entrySet()){
            if (ti.getColumn(in.getKey()).isUserEditable()){
                ArrayList<String> oldValNewValArr = new ArrayList<>();
                if (in.getValue().leftValue() !=  null)
                {
                    oldValNewValArr.add(in.getValue().leftValue().toString());
                }
                else
                {
                    oldValNewValArr.add("");
                }
                if (in.getValue().rightValue() !=  null)
                {
                    oldValNewValArr.add(in.getValue().rightValue().toString());
                }
                else
                {
                    oldValNewValArr.add("");
                }
                theDifferences.put(getFieldLabel(ti, in.getKey()), oldValNewValArr);
            }

        }
        return theDifferences;
    }

}
