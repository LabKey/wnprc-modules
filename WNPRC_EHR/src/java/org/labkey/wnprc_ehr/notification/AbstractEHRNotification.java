/*
 * Copyright (c) 2012-2014 LabKey Corporation
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

import org.apache.commons.lang3.time.DateUtils;
import org.apache.log4j.Logger;
import org.labkey.api.data.Container;
import org.labkey.api.data.PropertyManager;
import org.labkey.api.data.Results;
import org.labkey.api.ldk.notification.AbstractNotification;
import org.labkey.api.ldk.notification.NotificationService;
import org.labkey.api.module.Module;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.study.Study;
import org.labkey.api.study.StudyService;

import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;

/**
 * User: bimber
 * Date: 12/19/12
 * Time: 7:32 PM
 */
abstract public class AbstractEHRNotification extends AbstractNotification
{
    protected final static Logger log = Logger.getLogger(AbstractEHRNotification.class);
    protected final static SimpleDateFormat _dateTimeFormat = new SimpleDateFormat("yyyy-MM-dd kk:mm");
    protected final static SimpleDateFormat _dateFormat = new SimpleDateFormat("yyyy-MM-dd");
    protected final static SimpleDateFormat _timeFormat = new SimpleDateFormat("kk:mm");
    protected final static SimpleDateFormat _hourFormat = new SimpleDateFormat("kk");
    protected static final String lastSave = "lastSave";
    protected boolean sentNotification = true;

    public AbstractEHRNotification(Module owner)
    {
        super(owner);
    }

    protected NotificationService _ns = NotificationService.get();

    public boolean isAvailable(Container c)
    {
        if (!super.isAvailable(c))
            return false;

        return StudyService.get().getStudy(c) != null;
    }

    protected UserSchema getStudySchema(Container c, User u)
    {
        return QueryService.get().getUserSchema(u, c, "study");
    }

    protected UserSchema getEHRSchema(Container c, User u)
    {
        return QueryService.get().getUserSchema(u, c, "ehr");
    }

    protected UserSchema getEHRLookupsSchema(Container c, User u)
    {
        return QueryService.get().getUserSchema(u, c, "ehr_lookups");
    }

    protected Study getStudy(Container c)
    {
        return StudyService.get().getStudy(c);
    }

    public String getCategory()
    {
        return "EHR";
    }

    protected String appendField(String name, Results rs) throws SQLException
    {
        return rs.getString(FieldKey.fromString(name)) == null ? "" : rs.getString(FieldKey.fromString(name));
    }

    public String getCronString()
    {
        return null;//"0 0/5 * * * ?";
    }

    protected Map<String, String> getSavedValues(Container c)
    {
        return PropertyManager.getProperties(c, getClass().getName());
    }

    protected void saveValues(Container c, Map<String, String> newValues)
    {
        PropertyManager.PropertyMap map = PropertyManager.getWritableProperties(c, getClass().getName(), true);

        Long lastSaveMills = map.containsKey(lastSave) ? Long.parseLong(map.get(lastSave)) : null;

        //if values have already been cached for this alert on this day, dont re-cache them.
        if (lastSaveMills != null)
        {
            if (DateUtils.isSameDay(new Date(), new Date(lastSaveMills)))
            {
                return;
            }
        }

        newValues.put(lastSave, String.valueOf(new Date().getTime()));
        map.putAll(newValues);

        map.save();

        //PropertyManager.saveProperties(map);
    }

    protected String getParameterUrlString(Map<String, Object> params)
    {
        StringBuilder sb = new StringBuilder();
        for (String key : params.keySet())
        {
            sb.append("&query.param.").append(key).append("=");
            if (params.get(key) instanceof Date)
            {
                sb.append(_dateFormat.format(params.get(key)));
            }
            else
            {
                sb.append(params.get(key));
            }
        }


        return sb.toString();
    }
    public void setSentNotification(boolean sent){
        this.sentNotification= sent;

    }
}
