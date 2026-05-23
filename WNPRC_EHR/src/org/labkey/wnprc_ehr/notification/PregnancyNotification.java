/*
 * Copyright (c) 2020-2026 Board of Regents of the University of Wisconsin System
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

import jakarta.mail.Address;
import org.labkey.api.data.Container;
import org.labkey.api.ldk.notification.NotificationService;
import org.labkey.api.security.User;
import org.labkey.api.security.UserPrincipal;
import org.labkey.api.security.ValidEmail;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Created by jon on 7/13/16.
 */
public class PregnancyNotification extends AbstractJspEmailNotification {
    public static String idParamName = "Id";
    public static String objectidsParamName = "objectid";

    @Override
    public String getName() {
        return "Pregnancy Notification";
    }

    @Override
    public String getEmailSubject(Container c) {
        String subject = "Pregnancy Notification";

        if (params.has(idParamName)) {
            subject += ": " + getParam(idParamName);
        }
        return subject;
    }

    @Override
    public String getCronString() {
        return null;
    }

    @Override
    public String getScheduleDescription() {
        return "Sent immediately when an animal has a pregnancy record created";
    }

    @Override
    public String getDescription() {
        return "The report sends an alert whenever an animal has a pregnancy record created";
    }

    @Override
    String getPathToJsp() {
        return "/org/labkey/wnprc_ehr/email_templates/notifications/PregnancyNotification.jsp";
    }


    public void sendManually (Container container, User user){
        List<String> emails = getRecipientEmailAddresses(container);
        sendManually(container, user, emails);

    }

    public List<String> getRecipientEmailAddresses(Container container) {
        Set<UserPrincipal> recipients = NotificationService.get().getRecipients(this, container);

        List<String> emails = new ArrayList<>();
        for (UserPrincipal u : recipients) {
            try {
                List<Address> addresses = NotificationService.get().getEmailsForPrincipal(u);
                if (addresses != null) {
                    emails.addAll(addresses.stream().filter(e -> e.toString() != null).map(Object::toString).collect(Collectors.toList()));

//                    for (Address a : addresses) {
//                        if (a.toString() != null) {
//                            emails.add(a.toString());
//                        }
//                    }
                }
            }
            catch (ValidEmail.InvalidEmailException e) {
                log.error("Could not get emails for UserPrincipal " + u.getUserId() + " of type " + u.getType());
            }
        }

        return emails;
    }
}
