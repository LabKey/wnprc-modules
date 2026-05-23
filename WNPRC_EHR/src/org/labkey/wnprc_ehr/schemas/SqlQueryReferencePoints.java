/*
 * Copyright (c) 2018-2026 Board of Regents of the University of Wisconsin System
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
package org.labkey.wnprc_ehr.schemas;

import org.labkey.api.query.Queryable;
import org.labkey.wnprc_ehr.schemas.enum_lookups.NecropsySampleDeliveryDestination;

/**
 * These are constants that can be referenced by SQL queries using the following syntax:
 *
 *    column = javaConstant('org.labkey.wnprc_ehr.schemas.SqlQueryReferencePoints.CONSTANT_NAME')
 *
 * This allows us to avoid using "magic" strings in Sql Queries by using Java to look up the value
 * of the String, rather than copying it.  This provides a link that allows us to backtrack what
 * depends on a static String, warns us if the constant is destroyed, and can automatically update
 * the query (if applicable), should the string change.
 *
 * If you add a new String here, make sure you annotate it with @Queryable, and leave a comment
 * stating how/where it should be used.  Since these are all changes to the structure of the class,
 * any additions/modifications here require a restart of tomcat.
 *
 * Created by jon on 12/8/16.
 */
public class SqlQueryReferencePoints {
    /*
     * This marks the PK of the Courier To AVRL option for the Necropsy Schedule.sql query to reference.
     */
    @Queryable
    public static final String COURIER_TO_AVRL = NecropsySampleDeliveryDestination.SampleDeliveryDestination.COURIER_AVRL.name();
    @Queryable
    public static final String COURIER_TO_WIMR = NecropsySampleDeliveryDestination.SampleDeliveryDestination.COURIER_WIMR.name();
    @Queryable
    public static final String COURIER_TO_CCOURT = NecropsySampleDeliveryDestination.SampleDeliveryDestination.COURIER_CCOURT.name();
    @Queryable
    public static final String COURIER_TO_BMQ = NecropsySampleDeliveryDestination.SampleDeliveryDestination.COURIER_BMQ.name();
    @Queryable
    public static final String COURIER_TO_ELEMENTS = NecropsySampleDeliveryDestination.SampleDeliveryDestination.COURIER_ELEMENTS.name();
}
