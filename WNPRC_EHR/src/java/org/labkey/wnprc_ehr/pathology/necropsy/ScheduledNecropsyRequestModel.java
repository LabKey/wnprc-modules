package org.labkey.wnprc_ehr.pathology.necropsy;

import org.json.JSONObject;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.security.User;
import org.labkey.dbutils.api.SimpleQuery;
import org.labkey.dbutils.api.SimpleQueryFactory;
import org.labkey.dbutils.api.SimplerFilter;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Created by jon on 5/22/17.
 */
public class ScheduledNecropsyRequestModel {
    private Date submittedDate;
    private Date scheduledDate;

    public String animalId;
    public String taskNumber;
    public String taskLsid;
    public String requestNumber;
    public String requestLsid;

    public ScheduledNecropsyRequestModel(String requestid, User user, Container container) throws Exception {
        SimpleQueryFactory factory = new SimpleQueryFactory(user, container);

        JSONObject[] requests = factory.selectRows("study", "Necropsy Requests", new SimplerFilter("lsid", CompareType.EQUAL, requestid)).toJSONObjectArray();
        if (requests.length == 0) {
            throw new Exception("Request " + requestid + " does not exist");
        }
        JSONObject request = requests[0];

        this.requestLsid = requestid;
        this.requestNumber = String.valueOf(request.optInt("requestid", 0));
        this.submittedDate = _getDate(request, "created");


        JSONObject[] necropsies = factory.selectRows("study", "necropsy", new SimplerFilter("requestid", CompareType.EQUAL, requestid)).toJSONObjectArray();

        if (necropsies.length > 1) {
            throw new Exception("More than one necropsy found for requestid " + requestid);
        }

        if (necropsies.length == 0) {
            throw new Exception("No necropsies found for requestid " + requestid);
        }

        JSONObject necropsy = necropsies[0];
        this.scheduledDate = _getDate(necropsy, "date");

        this.animalId = necropsy.optString("id", "<No Animal Specified>");

        if (necropsy.isNull("taskid")) {
            throw new Exception("Request " + requestid + " has not yet been scheduled");
        }

        String taskid = necropsy.getString("taskid");
        JSONObject task = factory.selectRows("ehr", "tasks", new SimplerFilter("taskid", CompareType.EQUAL, taskid)).toJSONObjectArray()[0];
        this.taskLsid = taskid;
        this.taskNumber = String.valueOf(task.optInt("rowid", 0));
    }

    public Date getSubmittedDate() {
        return this.submittedDate;
    }

    public Date getScheduledDate() {
        return this.scheduledDate;
    }

    private Date _getDate(JSONObject json, String field) throws ParseException {
        String dateStr = json.getString(field);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        Date date = sdf.parse(dateStr);
        return date;
    }
}
