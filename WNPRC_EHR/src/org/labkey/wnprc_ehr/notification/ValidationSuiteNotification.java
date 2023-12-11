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
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ConvertHelper;
import org.labkey.api.data.Results;
import org.labkey.api.data.ResultsImpl;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.Selector;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.module.Module;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.security.User;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.wnprc_ehr.WNPRC_EHREmail;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Calendar;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.Map;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.TreeMap;
import org.labkey.wnprc_ehr.notification.NotificationToolkit;

/**
 * User: aschmidt34
 * Date: 8/24/23
 * Time: 1:03 PM
 */
public class ValidationSuiteNotification extends AbstractEHRNotification
{
    //Class variables.
    NotificationToolkit notificationToolkit = new NotificationToolkit();
    NotificationToolkit.StyleToolkit styleToolkit = new NotificationToolkit.StyleToolkit();



    //Constructors
    public ValidationSuiteNotification(Module owner)
    {
        super(owner);
    }



    //Notification Details
    @Override
    public String getName()
    {
        return "Validation Suite Notification";
    }
    @Override
    public String getDescription()
    {
        return "This notifies users of any animal ID's, dams, or sires that might have been entered incorrectly.";
    }
    @Override
    public String getEmailSubject(Container c)
    {
        return "Validation Suite Check: " + notificationToolkit.getCurrentTime();
    }
    @Override
    public String getScheduleDescription()
    {
        return "Daily at 3PM.";
    }
    @Override
    public String getCronString()
    {
        return(notificationToolkit.createCronString(new String[]{"15"}));
    }
    @Override
    public String getCategory()
    {
        return "Revamped Notifications";
    }



    //Message Creation
    @Override
    public String getMessageBodyHTML(final Container c, User u)
    {

        //Creates return string.
        StringBuilder messageBody = new StringBuilder();

        //Creates CSS.
        messageBody.append(styleToolkit.beginStyle());
        messageBody.append(styleToolkit.setBasicTableStyle());
        messageBody.append(styleToolkit.setColumnBackgroundColor(1, "#d9d9d9"));
        messageBody.append(styleToolkit.setColumnTextColor(1, "red"));
        messageBody.append(styleToolkit.endStyle());

        //Creates header.
        messageBody.append(notificationToolkit.createHTMLHeader("Similar Names"));

        //Adds body text.
        messageBody.append("This is a list of all Dams, Sires, and Animal ID's with similar names.  " +
                "Please reach out via the ticket tracker if you find any names that need to be updated.");

        //Adds tables.
        if (notificationToolkit.getTableRowCount(c, u, "study", "validationSuiteSuffixCheckerRhesusDamSire", "notificationView") > 0) {
            messageBody.append(notificationToolkit.getTableAsHTML(c, u, "validationSuiteSuffixCheckerRhesusDamSire", "notificationView"));
            messageBody.append("<br>");
        }
        if (notificationToolkit.getTableRowCount(c, u, "study", "validationSuiteSuffixCheckerRhesusDamSireID", "notificationView") > 0) {
            messageBody.append(notificationToolkit.getTableAsHTML(c, u, "validationSuiteSuffixCheckerRhesusDamSireID", "notificationView"));
            messageBody.append("<br>");
        }
        if (notificationToolkit.getTableRowCount(c, u, "study", "validationSuiteSuffixCheckerRhesusID", "notificationView") > 0) {
            messageBody.append(notificationToolkit.getTableAsHTML(c, u, "validationSuiteSuffixCheckerRhesusID", "notificationView"));
            messageBody.append("<br>");
        }
        if (notificationToolkit.getTableRowCount(c, u, "study", "validationSuiteSuffixCheckerRhesusIDDamSire", "notificationView") > 0) {
            messageBody.append(notificationToolkit.getTableAsHTML(c, u, "validationSuiteSuffixCheckerRhesusIDDamSire", "notificationView"));
            messageBody.append("<br>");
        }

        //Returns string.
        return messageBody.toString();
    }

}