package org.labkey.wnprc_ehr.dataentry.generics.sections;

import java.util.Arrays;
import org.apache.log4j.Logger;
import com.google.common.collect.Lists;
import org.json.JSONObject;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.SimpleFormPanelSection;
import org.labkey.api.query.FieldKey;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/**
 * Created by jon on 3/2/16.
 */
public class SimpleFormSection extends SimpleFormPanelSection {
    protected List<String> fieldNamesAtStartInOrder = new ArrayList<>();
    protected List<String> fieldNamesAtEndInOrder   = new ArrayList<>();
    protected Integer maxItemsPerColumn = null;
    protected static final Logger _log = Logger.getLogger(SimpleFormSection.class);

    public SimpleFormSection(String schemaName, String queryName, String label) {
        super(schemaName, queryName, label);
    }

    // Override to get list of field names to display.
    protected List<String> getFieldNames() {
        return null;
    }

    @Override
    protected List<FieldKey> getFieldKeys(TableInfo ti) {
        List<FieldKey> keys = super.getFieldKeys(ti);

        if (getFieldNames() != null) {
            // Build a lookup table
            Map<String, FieldKey> fieldLookup = new HashMap<>();
            for(FieldKey key : keys) {
                fieldLookup.put(key.getName().toLowerCase(), key);
            }

            List<String> fields = new ArrayList<>();
            fields.addAll(Arrays.asList(
                    "lsid",
                    "requestid",
                    "objectid",
                    "taskid",
                    "QCState"
            ));
            fields.addAll(getFieldNames());

            // Now, make the new keys array.
            keys.clear();
            for(String fieldName : fields) {
                String normalizedFieldName = (fieldName != null) ? fieldName.toLowerCase() : "";
                FieldKey field = fieldLookup.get(normalizedFieldName);

                if ((field != null) && (keys.indexOf(field) == -1)) {
                    keys.add(field);
                }
                else {
                    //_log.debug("Can't find fieldname \"" + fieldName + "\".");
                }
            }
        }

        List<FieldKey> keysAtStart = new ArrayList<>();
        List<FieldKey> keysAtEnd   = new ArrayList<>();

        for( String fieldName : fieldNamesAtStartInOrder ) {
            for (Iterator<FieldKey> iterator = keys.iterator(); iterator.hasNext();) {
                FieldKey fieldKey = iterator.next();
                if (fieldKey.getName().equals(fieldName)) {
                    keysAtStart.add(fieldKey);
                    // Remove the current element from the iterator and the list.
                    iterator.remove();
                }
            }
        }

        for( String fieldName : Lists.reverse(fieldNamesAtEndInOrder) ) {
            for (Iterator<FieldKey> iterator = keys.iterator(); iterator.hasNext();) {
                FieldKey fieldKey = iterator.next();
                if (fieldKey.getName().equals(fieldName)) {
                    keysAtEnd.add(fieldKey);
                    // Remove the current element from the iterator and the list.
                    iterator.remove();
                }
            }
        }

        keysAtStart.addAll(keys);
        keysAtStart.addAll(Lists.reverse(keysAtEnd));

        return keysAtStart;
    }

    @Override
    public JSONObject toJSON(DataEntryFormContext ctx, boolean includeFormElements) {
        JSONObject ret = super.toJSON(ctx, includeFormElements);

        if ( maxItemsPerColumn != null ) {
            // Make the form appear in two columns
            JSONObject formConfig = new JSONObject(ret.get("formConfig"));
            formConfig.put("maxItemsPerCol", maxItemsPerColumn);
            ret.put("formConfig", formConfig);
        }

        return ret;
    }

    @Override
    public String getServerSort() {
        return null;
    }
}
