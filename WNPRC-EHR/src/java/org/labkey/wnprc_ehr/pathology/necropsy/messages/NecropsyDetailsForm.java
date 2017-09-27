package org.labkey.wnprc_ehr.pathology.necropsy.messages;

import com.github.jonathonrichardson.java2ts.annotation.SerializeToTS;

import java.util.Date;

/**
 * Created by jon on 4/5/17.
 */
@SerializeToTS
public class NecropsyDetailsForm {
    public String taskId;
    public String animalId;
    public String requestId;
    public String project;
    public String account;
    public String protocol;
    public Date scheduledDate;
    public String necropsyLocation;
    public String whoDeliversToNx;
    public String deliveryComment;
    public String currentRoom;
    public String currentCage;
    public String housingType;
    public boolean hasTissuesForAVRL;
}
