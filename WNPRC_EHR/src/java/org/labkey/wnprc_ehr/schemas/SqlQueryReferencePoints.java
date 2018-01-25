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
}
