/*
 * Copyright (c) 2012-2013 LabKey Corporation
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

import org.apache.log4j.Logger;
import org.labkey.api.data.Container;
import org.labkey.api.data.Results;
import org.labkey.api.ldk.notification.Notification;
import org.labkey.api.ldk.notification.NotificationService;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.study.Study;
import org.labkey.api.study.StudyService;
import org.labkey.ehr.EHRModule;

import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.Set;

/**
 * User: bimber
 * Date: 12/19/12
 * Time: 7:32 PM
 */
abstract public class AbstractEHRNotification implements Notification
{
    protected final static Logger log = Logger.getLogger(Notification.class);
    protected final static SimpleDateFormat _dateTimeFormat = new SimpleDateFormat("yyyy-MM-dd kk:mm");
    protected final static SimpleDateFormat _dateFormat = new SimpleDateFormat("yyyy-MM-dd");
    protected final static SimpleDateFormat _timeFormat = new SimpleDateFormat("kk:mm");

    protected NotificationService _ns = NotificationService.get();
    protected String _baseUrl;

    public boolean isAvailable(Container c)
    {
        if (!c.getActiveModules().contains(ModuleLoader.getInstance().getModule(EHRModule.class)))
            return false;

        if (StudyService.get().getStudy(c) == null)
            return false;

        return true;
    }

    protected UserSchema getStudySchema(Container c, User u)
    {
        return QueryService.get().getUserSchema(u, c, "study");
    }

    protected UserSchema getEHRSchema(Container c, User u)
    {
        return QueryService.get().getUserSchema(u, c, "ehr");
    }
    protected Study getStudy(Container c)
    {
        return StudyService.get().getStudy(c);
    }

    public String getCategory()
    {
        return "EHR";
    }

    public String getCronString()
    {
        return null;//"0 0/5 * * * ?";
    }
}
