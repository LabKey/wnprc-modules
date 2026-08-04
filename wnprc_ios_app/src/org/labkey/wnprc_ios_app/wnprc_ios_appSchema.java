/*
 * Copyright (c) 2025 LabKey Corporation
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

package org.labkey.wnprc_ios_app;

import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.dialect.SqlDialect;

public class wnprc_ios_appSchema
{
    private static final wnprc_ios_appSchema _instance = new wnprc_ios_appSchema();
    // Schema name.
    public static final String NAME = "wnprc_ios_app";
    // Table names to expose via schema browser.
    public static final String PUSH_NOTIFICATIONS_TABLE_NAME = "push_notifications";
    public static final String SESSION_LOG_TABLE_NAME = "session_log";
    public static final String REPORTED_ISSUES_TABLE_NAME = "reported_issues";
    public static final String USER_ANIMAL_ABSTRACT_PREFERENCES_TABLE_NAME = "user_animal_abstract_preferences";



    public static wnprc_ios_appSchema getInstance()
    {
        return _instance;
    }

    private wnprc_ios_appSchema()
    {
        // private constructor to prevent instantiation from
        // outside this class: this singleton should only be
        // accessed via org.labkey.wnprc_ios_app.wnprc_ios_appSchema.getInstance()
    }

    public DbSchema getSchema()
    {
        return DbSchema.get(NAME, DbSchemaType.Module);
    }

    public SqlDialect getSqlDialect()
    {
        return getSchema().getSqlDialect();
    }

    public TableInfo getPushNotificationsTable() {
        return getSchema().getTable(PUSH_NOTIFICATIONS_TABLE_NAME);
    }

    public TableInfo getSessionLogTable() {
        return getSchema().getTable(SESSION_LOG_TABLE_NAME);
    }

    public TableInfo getReportedIssuesTable() {
        return getSchema().getTable(REPORTED_ISSUES_TABLE_NAME);
    }

    public TableInfo getUserAnimalAbstractPreferencesTableName() {
        return getSchema().getTable(USER_ANIMAL_ABSTRACT_PREFERENCES_TABLE_NAME);
    }
}
