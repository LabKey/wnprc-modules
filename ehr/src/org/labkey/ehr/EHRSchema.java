/*
 * Copyright (c) 2009-2016 LabKey Corporation
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

package org.labkey.ehr;

import org.labkey.api.data.DbSchema;
import org.labkey.api.data.dialect.SqlDialect;

public class EHRSchema
{
    private static final EHRSchema _instance = new EHRSchema();
    public static final String EHR_SCHEMANAME = "ehr";
    public static final String EHR_LOOKUPS = "ehr_lookups";

    public static final String TABLE_FORMTYPES = "formtypes";
    public static final String TABLE_FORMPANELSECTIONS = "formpanelsections";
    public static final String TABLE_LOOKUPS = "lookups";
    public static final String TABLE_LOOKUP_SETS = "lookup_sets";
    public static final String TABLE_LABWORK_TYPES = "labwork_types";
    public static final String TABLE_LAB_TESTS = "lab_tests";

    public static final String TABLE_TASKS = "tasks";
    public static final String TABLE_REQUESTS = "requests";

    public static final String TABLE_ENCOUNTER_FLAGS = "encounter_flags";
    public static final String TABLE_ENCOUNTER_SUMMARIES = "encounter_summaries";
    public static final String TABLE_ENCOUNTER_PARTICIPANTS = "encounter_participants";
    public static final String TABLE_SNOMED_TAGS = "snomed_tags";
    public static final String TABLE_SNOMED = "snomed";
    public static final String TABLE_PROTOCOL = "protocol";
    public static final String TABLE_PROTOCOL_COUNTS = "protocol_counts";
    public static final String TABLE_PROTOCOL_EXEMPTIONS = "protocolexemptions";
    public static final String TABLE_PROTOCOL_PROCEDURES = "protocolProcedures";
    public static final String TABLE_PROJECT = "project";
    public static final String TABLE_ANIMAL_GROUPS = "animal_groups";
    public static final String TABLE_FLAG_VALUES = "flag_values";

    public static EHRSchema getInstance()
    {
        return _instance;
    }

    private EHRSchema()
    {
        // private constructor to prevent instantiation from
        // outside this class: this singleton should only be
        // accessed via org.labkey.ehr.EHRSchema.getInstance()
    }

    public DbSchema getSchema()
    {
        return DbSchema.get(EHR_SCHEMANAME);
    }

    public DbSchema getEHRLookupsSchema()
    {
        return DbSchema.get(EHR_LOOKUPS);
    }

    public SqlDialect getSqlDialect()
    {
        return getSchema().getSqlDialect();
    }
}
