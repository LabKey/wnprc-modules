package org.labkey.wnprc_ehr.schemas;

/**
 * Created by jon on 2/14/17.
 */
public class Properties {
    static private String URI = "urn:ehr.primate.wisc.edu/#";

    static public String generateURI(String schemaName, String tableName, String columnName) {
        return URI + schemaName + "/" + tableName + "/" + columnName;
    }
}
