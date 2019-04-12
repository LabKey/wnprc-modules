package org.labkey.wnprc_ehr;

import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.TableInfo;
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
import org.labkey.wnprc_ehr.notification.DeathNotification;
import org.labkey.wnprc_ehr.notification.PregnancyNotification;
import org.labkey.wnprc_ehr.notification.VvcNotification;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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



}
