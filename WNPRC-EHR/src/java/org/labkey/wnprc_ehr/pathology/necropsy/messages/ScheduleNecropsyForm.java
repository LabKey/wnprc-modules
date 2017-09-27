package org.labkey.wnprc_ehr.pathology.necropsy.messages;

import com.github.jonathonrichardson.java2ts.annotation.SerializeToTS;
import org.labkey.api.security.GroupManager;
import org.labkey.api.security.SecurityManager;
import org.labkey.api.security.User;
import org.labkey.api.security.UserManager;
import org.labkey.api.security.UserPrincipal;


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

    public UserPrincipal getAssignedTo() {
        if (this.assignedTo == null) {
            return null;
        }

        UserPrincipal userPrincipal = UserManager.getUser(this.assignedTo);
        if (userPrincipal == null) {
            userPrincipal = SecurityManager.getGroup(this.assignedTo);
        }

        return userPrincipal;
    }

    public User getPathologist() {
        if (this.pathologist == null) {
            return null;
        }

        return UserManager.getUser(this.pathologist);
    }

    public User getAssistant() {
        if (this.assistant == null) {
            return null;
        }

        return UserManager.getUser(this.assistant);
    }

}
