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
    //Sets up class variables.
    NotificationToolkit notificationToolkit = new NotificationToolkit();

    public ValidationSuiteNotification(Module owner)
    {
        super(owner);
    }

    @Override
    public String getName()
    {
        return "Validation Suite";
    }
    @Override
    public String getDescription()
    {
        return "This notifies users of any animal ID's, dams, or sires that might have been entered incorrectly.";
    }
    @Override
    public String getEmailSubject(Container c)
    {
        return "Validation Suite Check: " + AbstractEHRNotification._dateTimeFormat.format(new Date());
    }
    @Override
    public String getMessageBodyHTML(final Container c, User u)
    {
        StringBuilder messageBody = this.createNotification(c, u);
        return messageBody.toString();
    }

    //DEFAULT
    @Override
    public String getCronString()
    {
        return "0 0 13 * * ?";
//        String testCronString = notificationToolkit.createCronString(new String[]{"16", "18", "21"});
//        return testCronString;
    }
    @Override
    public String getScheduleDescription()
    {
        return "daily at 1PM";
    }


    //
    public StringBuilder createNotification(Container c, User u) {

        //Gets number of notifications.

        final StringBuilder msg = new StringBuilder();

        //Gets ID matches.
        final StringBuilder msgIDCount = new StringBuilder("" + (notificationToolkit.getTableRowCount(c, u, "validationSuiteSuffixCheckerRhesusID") / 2));
        final StringBuilder msgIDHeader = new StringBuilder(notificationToolkit.createHeader("<br>ID Checks (" + msgIDCount + ")" + ":<br>"));
        final StringBuilder msgID = new StringBuilder(notificationToolkit.getDataFromTable(c, u, "validationSuiteSuffixCheckerRhesusID", new String[]{"id"}, new String[]{"ID: "}, "last_four"));
        final StringBuilder msgIDSpaced = new StringBuilder(notificationToolkit.addSpaceEveryOtherLine(msgID.toString()));

        //Gets Dam & Sire matches.
        final StringBuilder msgDamSireCount = new StringBuilder("" + (notificationToolkit.getTableRowCount(c, u, "validationSuiteSuffixCheckerRhesusDamSire") / 2));
        final StringBuilder msgDamSireHeader = new StringBuilder(notificationToolkit.createHeader("<br>Dam & Sire Checks (" + msgDamSireCount + ")" + ":<br>"));
        final StringBuilder msgDamSire = new StringBuilder(notificationToolkit.getDataFromTable(c, u, "validationSuiteSuffixCheckerRhesusDamSire", new String[]{"dam", "sire"}, new String[]{"Dam: ", "Sire: "}, "last_four"));
        final StringBuilder msgDamSireSpaced = new StringBuilder(notificationToolkit.addSpaceEveryOtherLine(msgDamSire.toString()));

        //Gets Dam/Sire & ID matches.
        final StringBuilder msgDamSireIDCount = new StringBuilder("" + (notificationToolkit.getTableRowCount(c, u, "validationSuiteSuffixCheckerRhesusDamSireID") / 2));
        final StringBuilder msgDamSireIDHeader = new StringBuilder(notificationToolkit.createHeader("<br>ID & Dam/Sire Checks (" + msgDamSireIDCount + ")" + ":<br>"));
        final StringBuilder msgDamSireID = new StringBuilder(notificationToolkit.getDataFromTable(c, u, "validationSuiteSuffixCheckerRhesusDamSireID", new String[]{"id", "dam", "sire"}, new String[]{"ID: ", "Dam: ", "Sire: "}, "last_four"));
        final StringBuilder msgDamSireIDSpaced = new StringBuilder(notificationToolkit.addSpaceEveryOtherLine(msgDamSireID.toString()));

        //Gets ID & Dam/Sire matches.
        final StringBuilder msgIDDamSireCount = new StringBuilder("" + (notificationToolkit.getTableRowCount(c, u, "validationSuiteSuffixCheckerRhesusIDDamSire") / 2));
        final StringBuilder msgIDDamSireHeader = new StringBuilder(notificationToolkit.createHeader("<br>Dam/Sire & ID Checks (" + msgIDDamSireCount + ")" + ":<br>"));
        final StringBuilder msgIDDamSire = new StringBuilder(notificationToolkit.getDataFromTable(c, u, "validationSuiteSuffixCheckerRhesusIDDamSire", new String[]{"id", "dam", "sire"}, new String[]{"ID: ", "Dam: ", "Sire: "}, "last_four"));
        final StringBuilder msgIDDamSireSpaced = new StringBuilder(notificationToolkit.addSpaceEveryOtherLine(msgIDDamSire.toString()));

        //Creates return message.
        msg.append("" + msgIDHeader + msgIDSpaced
                + msgDamSireHeader + msgDamSireSpaced
                + msgDamSireIDHeader + msgDamSireIDSpaced
                + msgIDDamSireHeader + msgIDDamSireSpaced
        );
        return msg;
    }
}