package org.labkey.wnprc_ehr.dataentry.generics.sections;
import com.google.common.collect.Lists;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.dataentry.SimpleFormSection;
import org.labkey.api.query.FieldKey;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/**
 * User: bimber
 * Date: 4/27/13
 * Time: 10:54 AM
 */
public class SimpleGridSection extends SimpleFormSection {
    protected List<String> fieldNamesAtStartInOrder = new ArrayList<>();
    protected List<String> fieldNamesAtEndInOrder   = new ArrayList<>();

    public SimpleGridSection(String schemaName, String queryName, String label) {
        this(schemaName, queryName, label, EHRService.FORM_SECTION_LOCATION.Body);
    }

    public SimpleGridSection(String schemaName, String queryName, String label, EHRService.FORM_SECTION_LOCATION location) {
        super(schemaName, queryName, label, "ehr-gridpanel", location);

        this.setAllowBulkAdd(false);
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
            fields.addAll(getFieldNames());
            fields.addAll(Arrays.asList(
                    "lsid",
                    "requestid",
                    "objectid",
                    "taskid",
                    "QCState"
            ));

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
    public String getServerSort() {
        return null;
    }

    @Override
    public List<String> getTbarMoreActionButtons() {
        List<String> defaultButtons = new ArrayList<>();
        defaultButtons.addAll(super.getTbarMoreActionButtons());

        defaultButtons.remove("GUESSPROJECT");

        return defaultButtons;
    }

    @Override
    public List<String> getTbarButtons() {
        List<String> defaultButtons = new ArrayList<>();
        defaultButtons.addAll(super.getTbarButtons());

        defaultButtons.remove("COPYFROMSECTION");

        return defaultButtons;
    }
}

