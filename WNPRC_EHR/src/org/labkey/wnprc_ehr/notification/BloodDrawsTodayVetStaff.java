/*
 * Copyright (c) 2024-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.labkey.wnprc_ehr.notification;

import org.labkey.api.data.Container;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;

public class BloodDrawsTodayVetStaff extends AbstractEHRNotification {
    //Class Variables
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    NotificationToolkit.StyleToolkit styleToolkit = new NotificationToolkit.StyleToolkit();
    NotificationToolkit.DateToolkit dateToolkit = new NotificationToolkit.DateToolkit();



    //Constructors
    /**
     * This constructor is used to register the notification in WNPRC_EHRModule.java.
     * @param owner
     */
    public BloodDrawsTodayVetStaff(Module owner) {super(owner);}



    //Notification Details
    @Override
    public String getName() {
        return "Blood Draws Today (Vet Staff)";
    }
    @Override
    public String getDescription() {
        return "The report is designed to identify potential problems related to all blood draws (today) assigned to Vet Staff.";
    }
    @Override
    public String getEmailSubject(Container c) {
        return "Blood Draws Today (Vet Staff): " + dateToolkit.getCurrentTime();
    }
    @Override
    public String getScheduleDescription() {
        return "Daily at 6:00AM, 1:00PM, and 3:00PM";
    }
    @Override
    public String getCronString() {
        return notificationToolkit.createCronString("0", "6,13,15", "*");
    }
    @Override
    public String getCategory() {
        return "Revamped Notifications - Blood Draws Update";
    }



    //Message Creation
    @Override
    public String getMessageBodyHTML(Container c, User u) {
        // Gets BloodDrawNotificationObject.
        BloodDrawsTodayAll.BloodDrawsTodayObject myBloodDrawNotificationObject = new BloodDrawsTodayAll.BloodDrawsTodayObject(c, u, "vetStaff");

        // Begins message body.
        final StringBuilder messageBody = new StringBuilder();

        // Creates CSS.
        messageBody.append(styleToolkit.beginStyle());
        messageBody.append(styleToolkit.setBasicTableStyle());
        messageBody.append(styleToolkit.setHeaderRowBackgroundColor("#d9d9d9"));
        messageBody.append(styleToolkit.endStyle());

        // Begins message info.
        messageBody.append("<p>This email contains all scheduled blood draws for today (for Vet Staff only).  It was run on: " + dateToolkit.getCurrentTime() + "</p>");

        // Creates table.
        if (myBloodDrawNotificationObject.resultsByArea.isEmpty()) {
            notificationToolkit.sendEmptyNotificationRevamp(c, u, "Blood Draws Today (Vet Staff)");
            return null;
        }
        else {
            messageBody.append(myBloodDrawNotificationObject.printTablesAsHTML());
            return messageBody.toString();
        }

    }
}
