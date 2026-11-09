/*
 *
 *  * Copyright (c) 2026 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

package org.labkey.cageui.notification;

import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;
import org.labkey.cageui.action.HousingForm;
import org.labkey.cageui.action.HousingNotification;
import org.labkey.wnprc_ehr.notification.AbstractEHRNotification;
import org.labkey.wnprc_ehr.notification.NotificationToolkit;

import java.util.ArrayList;

public class CageUIHousingTransferNotification extends AbstractEHRNotification
{
    // Class Variables
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    ArrayList<HousingNotification> housingRecords;

    public CageUIHousingTransferNotification(Module owner, ArrayList<HousingNotification> records)
    {
        super(owner);
        housingRecords = records;
    }

    @Override
    public String getName()
    {
        return "Housing Transfer Alert";
    }

    @Override
    public String getScheduleDescription()
    {
        return "Sent when a user flags a housing transfer";
    }

    @Override
    public @Nullable String getMessageBodyHTML(Container c, User u)
    {
        // Creates variables.
        final StringBuilder messageBody = new StringBuilder();

        // Fills in email body.
        messageBody.append("<h3>");
        messageBody.append("The following housing transfers were flagged for review");
        messageBody.append("</h3>");

        // Add HTML table for housing records
        if (housingRecords != null && !housingRecords.isEmpty()) {
            messageBody.append("<table border=\"1\" style=\"border-collapse: collapse; width: 100%;\">");
            messageBody.append("<thead>");
            messageBody.append("<tr style=\"background-color: #f2f2f2;\">");
            messageBody.append("<th style=\"border: 1px solid #ddd; padding: 8px; text-align: left;\">Review</th>");
            messageBody.append("<th style=\"border: 1px solid #ddd; padding: 8px; text-align: left;\">ID</th>");
            messageBody.append("<th style=\"border: 1px solid #ddd; padding: 8px; text-align: left;\">Task ID</th>");
            messageBody.append("<th style=\"border: 1px solid #ddd; padding: 8px; text-align: left;\">Date</th>");
            messageBody.append("<th style=\"border: 1px solid #ddd; padding: 8px; text-align: left;\">End Date</th>");
            messageBody.append("<th style=\"border: 1px solid #ddd; padding: 8px; text-align: left;\">Room</th>");
            messageBody.append("<th style=\"border: 1px solid #ddd; padding: 8px; text-align: left;\">Cage</th>");
            messageBody.append("<th style=\"border: 1px solid #ddd; padding: 8px; text-align: left;\">Condition</th>");
            messageBody.append("<th style=\"border: 1px solid #ddd; padding: 8px; text-align: left;\">Reason</th>");
            messageBody.append("<th style=\"border: 1px solid #ddd; padding: 8px; text-align: left;\">Remark</th>");
            messageBody.append("<th style=\"border: 1px solid #ddd; padding: 8px; text-align: left;\">Project</th>");
            messageBody.append("<th style=\"border: 1px solid #ddd; padding: 8px; text-align: left;\">Performed By</th>");
            messageBody.append("<th style=\"border: 1px solid #ddd; padding: 8px; text-align: left;\">Ejac Confirmed</th>");
            messageBody.append("</tr>");
            messageBody.append("</thead>");
            messageBody.append("<tbody>");

            for (HousingNotification notif : housingRecords) {
                HousingForm record = notif.getHousingRecord();
                messageBody.append("<tr>");
                messageBody.append("<td style=\"border: 1px solid #ddd; padding: 8px;\">").append("<a href=\""+ notif.getUrl() + "\"> Review Here </a>").append("</td>");
                messageBody.append("<td style=\"border: 1px solid #ddd; padding: 8px;\">").append(record.getId()).append("</td>");
                messageBody.append("<td style=\"border: 1px solid #ddd; padding: 8px;\">").append(record.getTaskId()).append("</td>");
                messageBody.append("<td style=\"border: 1px solid #ddd; padding: 8px;\">").append(record.getDate() != null ? record.getDate().toString() : "").append("</td>");
                messageBody.append("<td style=\"border: 1px solid #ddd; padding: 8px;\">").append(record.getEndDate() != null ? record.getEndDate().toString() : "").append("</td>");
                messageBody.append("<td style=\"border: 1px solid #ddd; padding: 8px;\">").append(record.getRoom()).append("</td>");
                messageBody.append("<td style=\"border: 1px solid #ddd; padding: 8px;\">").append(notif.getCageNumber()).append("</td>");
                messageBody.append("<td style=\"border: 1px solid #ddd; padding: 8px;\">").append(notif.getCondLabel()).append("</td>");
                messageBody.append("<td style=\"border: 1px solid #ddd; padding: 8px;\">").append(record.getReason()).append("</td>");
                messageBody.append("<td style=\"border: 1px solid #ddd; padding: 8px;\">").append(record.getRemark()).append("</td>");
                messageBody.append("<td style=\"border: 1px solid #ddd; padding: 8px;\">").append(record.getProject() != null ? record.getProject().toString() : "").append("</td>");
                messageBody.append("<td style=\"border: 1px solid #ddd; padding: 8px;\">").append(record.getPerformedBy()).append("</td>");
                messageBody.append("<td style=\"border: 1px solid #ddd; padding: 8px;\">").append(record.getEjacConfirmed() != null ? record.getEjacConfirmed().toString() : "").append("</td>");
                messageBody.append("</tr>");
            }

            messageBody.append("</tbody>");
            messageBody.append("</table>");
        }

        // Returns message.
        return messageBody.toString();
    }


    @Override
    public String getDescription()
    {
        return "The notification is an alert for supervisors when a user flags a housing transfer row as potentially incorrect or needing attention";
    }

    @Override
    public String getEmailSubject(Container c)
    {
        return "Housing Transfer Alert";
    }

    @Override
    public String getCategory() {
        return "CageUI Notifications";
    }

    public void sendManually (Container container, User user){
        notificationToolkit.sendNotification(this, user, container, new ArrayList<>());
    }
}
