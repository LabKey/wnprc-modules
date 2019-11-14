package org.labkey.wnprc_ehr;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.security.EHRSecurityEscalator;
import org.labkey.api.ldk.notification.NotificationService;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.security.User;
import org.labkey.api.security.UserManager;
import org.labkey.api.study.security.SecurityEscalator;
import org.labkey.dbutils.api.SimpleQueryFactory;
import org.labkey.dbutils.api.SimpleQueryUpdater;
import org.labkey.dbutils.api.SimplerFilter;
import org.labkey.ehr.demographics.EHRDemographicsServiceImpl;
import org.labkey.webutils.api.json.JsonUtils;
import org.labkey.wnprc_ehr.notification.AnimalRequestNotification;
import org.labkey.wnprc_ehr.notification.DeathNotification;
import org.labkey.wnprc_ehr.notification.ProjectRequestNotification;
import org.labkey.wnprc_ehr.notification.VvcNotification;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;

/**
 * Created by jon on 7/13/16.
 */
public class TriggerScriptHelper {
    protected final Container container;
    protected final User user;
    protected static final Logger _log = Logger.getLogger(TriggerScriptHelper.class);
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
                housingRow.put("sex", EHRDemographicsServiceImpl.get().getAnimal(container, (String) housingRow.get("Id")).getOrigGender());
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
                        saveBreedingEncounter(insertRows, false);
                    } else if (openEncounters.size() == 1){
                        //Close currently open breeding encounter and then start new one
                        List<Map<String, Object>> updateRows = closeOngoingBreedingEncounter(filteredHousingRows, openEncounters, group, i);
                        saveBreedingEncounter(updateRows, true);
                        List<Map<String, Object>> insertRows = createNewBreedingEncounter(group, i);
                        saveBreedingEncounter(insertRows, false);
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
        encounter.put("sireid", sireid);
        encounter.put("date", animalsInEncounter.get(0).get("date"));
        encounter.put("project", animalsInEncounter.get(0).get("project"));
        encounter.put("QCState", EHRService.get().getQCStates(container).get(EHRService.QCSTATES.InProgress.getLabel()).getRowId());
        encounter.put("performedby", animalsInEncounter.get(0).get("performedby"));
        encounter.put("remark", remark);
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

    public void sendProjectNotification(Integer key, String hostName){
        _log.info("Using java helper to send email for project request record: "+key);
        Module ehr = ModuleLoader.getInstance().getModule("EHR");
        ProjectRequestNotification notification = new ProjectRequestNotification(ehr,key,user,hostName);
        Container ehrContainer =  ContainerManager.getForPath("/WNPRC/EHR");
        notification.sendManually(ehrContainer,user);
    }

    public void sendProjectNotification(String hostName){

        _log.info("Using java helper to send email for project request record: ");
        Module ehr = ModuleLoader.getInstance().getModule("EHR");
        ProjectRequestNotification notification = new ProjectRequestNotification(ehr,user,hostName);
        Container ehrContainer =  ContainerManager.getForPath("/WNPRC/EHR");
        notification.sendManually(ehrContainer,user);
    }
}
