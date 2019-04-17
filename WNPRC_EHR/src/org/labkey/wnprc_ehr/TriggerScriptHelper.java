package org.labkey.wnprc_ehr;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.ehr.EHRQCState;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.demographics.AnimalRecord;
import org.labkey.api.ehr.security.EHRSecurityEscalator;
import org.labkey.api.ldk.notification.NotificationService;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.security.User;
import org.labkey.api.security.UserManager;
import org.labkey.api.study.security.SecurityEscalator;
import org.labkey.dbutils.api.SimpleQuery;
import org.labkey.dbutils.api.SimpleQueryFactory;
import org.labkey.dbutils.api.SimpleQueryUpdater;
import org.labkey.dbutils.api.SimplerFilter;
import org.labkey.ehr.demographics.EHRDemographicsServiceImpl;
import org.labkey.webutils.api.json.JsonUtils;
import org.labkey.wnprc_ehr.notification.DeathNotification;
import org.labkey.wnprc_ehr.notification.PregnancyNotification;
import org.labkey.wnprc_ehr.notification.VvcNotification;
import org.mortbay.util.ajax.JSON;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Comparator;
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
        if (!NotificationService.get().isServiceEnabled() && NotificationService.get().isActive(new PregnancyNotification(), container)){
            _log.info("Notification service is not enabled, will not send pregnancy notification");
            return;
        }
        if (ids.size() != objectids.size()) {
            _log.warn("Mismatch between list of animal ids and object ids.  Will not send pregnancy notification");
            return;
        }
        for (int i = 0; i < ids.size(); i++) {
            PregnancyNotification pregnancyNotification = new PregnancyNotification();
            pregnancyNotification.setParam(PregnancyNotification.idParamName, ids.get(i));
            pregnancyNotification.setParam(PregnancyNotification.objectidsParamName, objectids.get(i));
            pregnancyNotification.sendManually(container, user);
        }
    }

    public void updateBreedingOutcome(final List<String> lsids) {
        try (SecurityEscalator escalator = EHRSecurityEscalator.beginEscalation(user, container, "Escalating so that breeding encounter outcome can be changed to true")) {
            SimpleQueryUpdater queryUpdater = new SimpleQueryUpdater(user, container, "study", "breeding_encounters");

            List<Map<String, Object>> updateRows = new ArrayList<>();
            for (String lsid : lsids) {
                JSONObject row = new JSONObject();
                row.put("lsid", lsid);
                row.put("outcome", true);
                updateRows.add(row);
            }

            queryUpdater.update(updateRows);
        } catch (Exception e) {
            _log.error(e);
        }
    }

    public void createBreedingRecordsFromHousingChanges(final List<Map<String, Object>> housingRows) {
        //Filter out any rows that aren't related to breeding
        List<Map<String, Object>> filteredHousingRows = new ArrayList<>();
        for (Map<String, Object> housingRow : housingRows) {
            String reason = (String) housingRow.get("reason");
            if ("Breeding".equals(reason) || "Breeding ended".equals(reason)) {
                housingRow.put("sex", EHRDemographicsServiceImpl.get().getAnimal(container, (String) housingRow.get("Id")).getOrigGender());
                filteredHousingRows.add(housingRow);
            }
        }
        String keySeparator = "|";
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm");
        Map<String, List<Map<String, Object>>> groupedAnimals = new TreeMap<>();

        //filteredHousingRows = getTestData();

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
                        throw new RuntimeException("This female (" + group.get(i).get("Id") + ") has multiple breeding encounters open");
                    }
                } else if (group.get(i).get("sex").equals("f") && group.get(i).get("reason").equals("Breeding ended")) {
                    //get open breeding encounter record
                    List<JSONObject> openEncounters = getOpenEncounters((String) group.get(i).get("Id"));
                    List<Map<String, Object>> updateRows = closeOngoingBreedingEncounter(filteredHousingRows, openEncounters, group, i);
                    saveBreedingEncounter(updateRows, true);
                }
            }
        }
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
    public void sendVvcNotification(String requestid){
        Module ehr = ModuleLoader.getInstance().getModule("EHR");
        VvcNotification sendNotifcation = new VvcNotification(ehr, requestid);
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
        JSONObject openEncounter = openEncounters.get(0);
        StringBuilder remark = new StringBuilder("\n--Breeding Ended--");
        boolean remarkFound = false;
        boolean ejacConfirmed = group.get(index).get("ejacConfirmed") != null ? (Boolean) group.get(index).get("ejacConfirmed") : false;

        if (!StringUtils.isEmpty((String) group.get(index).get("remark")) && group.get(index).get("reason").equals("Breeding ended")) {
            remark.append("\n")
                    .append(group.get(index).get("Id"))
                    .append(": ")
                    .append(group.get(index).get("remark"));
        }

        String[] sireList = openEncounter.getString("sireid").split(",");
        for (int j = 0; j < sireList.length; j++) {
            for(int k = 0; k < filteredHousingRows.size(); k++) {
                if (sireList[j].equals(filteredHousingRows.get(k).get("Id")) && filteredHousingRows.get(k).get("date").equals(group.get(index).get("date")) && filteredHousingRows.get(k).get("reason").equals("Breeding ended")) {
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
        if (remarkFound) {
            openEncounter.put("remark", openEncounter.getString("remark") != null ? openEncounter.getString("remark") + remark : remark.toString());
        }

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

    private List<Map<String, Object>> getTestData() {
        List<Map<String, Object>> testData = new ArrayList<>();

        //female 1 - end
        JSONObject row4 = new JSONObject();
        row4.put("Id", "r09048");
        row4.put("date", new Timestamp(118, 10, 20, 13, 15, 0, 0));
        row4.put("room", "c420");
        row4.put("cage", "0039");
        row4.put("remark", "female 1 end");
        row4.put("ejacConfirmed", false);
        row4.put("reason", "Breeding ended");
        row4.put("performedby", "gg");
        row4.put("sex", "f");
        testData.add(row4);

        //male 1a - end
        JSONObject row5 = new JSONObject();
        row5.put("Id", "r16080");
        row5.put("date", new Timestamp(118, 10, 20, 13, 15, 0, 0));
        row5.put("room", "c420");
        row5.put("cage", "0039");
        row5.put("remark", "male 1a end");
        row5.put("ejacConfirmed", true);
        row5.put("reason", "Breeding ended");
        row5.put("performedby", "gg");
        row5.put("sex", "m");
        testData.add(row5);

        //male 1b - end
        JSONObject row6 = new JSONObject();
        row6.put("Id", "r15020");
        row6.put("date", new Timestamp(118, 10, 20, 13, 15, 0, 0));
        row6.put("room", "c420");
        row6.put("cage", "0039");
        row6.put("remark", "male 1b end");
        row6.put("ejacConfirmed", false);
        row6.put("reason", "Breeding ended");
        row6.put("performedby", "gg");
        row6.put("sex", "m");
        testData.add(row6);

        //female 1 - start
        JSONObject row1 = new JSONObject();
        row1.put("Id", "r09048");
        row1.put("date", new Timestamp(118, 10, 20, 8, 15, 0, 0));
        row1.put("room", "c420");
        row1.put("cage", "0039");
        row1.put("remark", "female 1 start");
        row1.put("project", "20150801");
        row1.put("reason", "Breeding");
        row1.put("performedby", "gg");
        row1.put("sex", "f");
        testData.add(row1);

        //male 1a - start
        JSONObject row2 = new JSONObject();
        row2.put("Id", "r16080");
        row2.put("date", new Timestamp(118, 10, 20, 8, 15, 0, 0));
        row2.put("room", "c420");
        row2.put("cage", "0039");
        row2.put("remark", "male 1a start");
        row2.put("project", "20150801");
        row2.put("reason", "Breeding");
        row2.put("performedby", "gg");
        row2.put("sex", "m");
        testData.add(row2);

        //male 1b - start
        JSONObject row3 = new JSONObject();
        row3.put("Id", "r15020");
        row3.put("date", new Timestamp(118, 10, 20, 8, 15, 0, 0));
        row3.put("room", "c420");
        row3.put("cage", "0039");
        row3.put("remark", "male 1b start");
        row3.put("project", "20150801");
        row3.put("reason", "Breeding");
        row3.put("performedby", "gg");
        row3.put("sex", "m");
        testData.add(row3);

        //female 2a - start
        JSONObject row7 = new JSONObject();
        row7.put("Id", "r15005");
        row7.put("date", new Timestamp(118, 10, 22, 8, 15, 0, 0));
        row7.put("room", "cb11");
        row7.put("cage", "0067");
        row7.put("remark", "female 2a start");
        row7.put("project", "20150902");
        row7.put("reason", "Breeding");
        row7.put("performedby", "gg");
        row7.put("sex", "f");
        testData.add(row7);

        //female 2b - start
        JSONObject row8 = new JSONObject();
        row8.put("Id", "r14118");
        row8.put("date", new Timestamp(118, 10, 22, 8, 15, 0, 0));
        row8.put("room", "cb11");
        row8.put("cage", "0067");
        row8.put("remark", "female 2b start");
        row8.put("project", "20150902");
        row8.put("reason", "Breeding");
        row8.put("performedby", "gg");
        row8.put("sex", "f");
        testData.add(row8);

        //male 2 - start
        JSONObject row9 = new JSONObject();
        row9.put("Id", "r14003");
        row9.put("date", new Timestamp(118, 10, 22, 8, 15, 0, 0));
        row9.put("room", "cb11");
        row9.put("cage", "0067");
        row9.put("remark", "male 2 start");
        row9.put("project", "20150902");
        row9.put("reason", "Breeding");
        row9.put("performedby", "gg");
        row9.put("sex", "m");
        testData.add(row9);

        //male 3 - start
        JSONObject row13 = new JSONObject();
        row13.put("Id", "r14003");
        row13.put("date", new Timestamp(118, 10, 22, 11, 15, 0, 0));
        row13.put("room", "ab110");
        row13.put("cage", "0029");
        row13.put("remark", "male 3 start");
        row13.put("project", "20180109");
        row13.put("reason", "Breeding");
        row13.put("performedby", "gg");
        row13.put("sex", "m");
        testData.add(row13);

        //female 2b - end
        JSONObject row11 = new JSONObject();
        row11.put("Id", "r14118");
        row11.put("date", new Timestamp(118, 10, 22, 11, 15, 0, 0));
        row11.put("room", "cb11");
        row11.put("cage", "0071");
        row11.put("remark", "female 2b end");
        row11.put("ejacConfirmed", true);
        row11.put("reason", "Breeding ended");
        row11.put("performedby", "gg");
        row11.put("sex", "f");
        testData.add(row11);

        //male 2 - end
        JSONObject row12 = new JSONObject();
        row12.put("Id", "r14003");
        row12.put("date", new Timestamp(118, 10, 22, 11, 15, 0, 0));
        row12.put("room", "cb11");
        row12.put("cage", "0067");
        row12.put("remark", "male 2 end");
        row12.put("ejacConfirmed", false);
        row12.put("reason", "Breeding ended");
        row12.put("performedby", "gg");
        row12.put("sex", "m");
        testData.add(row12);

        //female 2a/3 - end/start
        JSONObject row10 = new JSONObject();
        row10.put("Id", "r15005");
        row10.put("date", new Timestamp(118, 10, 22, 11, 15, 0, 0));
        row10.put("room", "ab110");
        row10.put("cage", "0029");
        row10.put("remark", "female 2a/3 start again");
        row10.put("project", "20150902");
        row10.put("reason", "Breeding");
        row10.put("performedby", "gg");
        row10.put("sex", "f");
        testData.add(row10);

        return testData;
    }
}
