package org.labkey.wnprc_ehr.pathology.necropsy.messages;

import com.github.jonathonrichardson.java2ts.annotation.SerializeToTS;
import org.labkey.api.security.User;
import org.labkey.api.security.UserManager;

import java.util.Date;

/**
 * Created by jon on 4/4/17.
 */
@SerializeToTS
public class ScheduleNecropsyForm {
    public Date    scheduledDate;
    public String  location;
    public Integer assignedTo;
    public Integer pathologist;
    public Integer assistant;

    public User getAssignedTo() {
        return UserManager.getUser(this.assignedTo);
    }

    public User getPathologist() {
        return UserManager.getUser(this.pathologist);
    }

    public User getAssistant() {
        return UserManager.getUser(this.assistant);
    }

}
