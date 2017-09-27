/*
 * Copyright (c) 2013-2016 LabKey Corporation
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
package org.labkey.ehr.notification;

import org.labkey.api.data.Container;
import org.labkey.api.security.User;

import java.util.Date;

/**
 * User: bimber
 * Date: 12/10/13
 * Time: 5:58 PM
 */
public class DeathNotification extends AbstractEHRNotification
{
    @Override
    public String getName()
    {
        return "Death Notification";
    }

    @Override
    public String getEmailSubject(Container c)
    {
        return "Death Notification: " + _dateTimeFormat.format(new Date());
    }

    @Override
    public String getCronString()
    {
        return null;
    }

    @Override
    public String getScheduleDescription()
    {
        return "Sent immediately when an animal is marked as dead";
    }

    @Override
    public String getDescription()
    {
        return "The report sends an alert whenever an animal is marked as dead.";
    }

    @Override
    public String getMessageBodyHTML(Container c, User u)
    {
        //this is never actually called as a notification.  it is used as a placeholder so we can use it to track the list of subscribed users
        return null;
    }
}
