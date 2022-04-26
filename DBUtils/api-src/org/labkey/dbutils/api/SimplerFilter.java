package org.labkey.dbutils.api;

import org.labkey.api.data.CompareType;
import org.labkey.api.data.Filter;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.query.FieldKey;

/**
 * Created by jon on 7/14/16.
 */
public class SimplerFilter extends SimpleFilter {
    public SimplerFilter(String columnName, CompareType compareType, Object value) {
        super();

        this.addCondition(columnName, compareType, value);
    }

    public SimplerFilter(Filter filter) {
        super(filter);
    }

    @Override
    public SimplerFilter clone() {
        return new SimplerFilter((Filter) this);
    }

    public SimplerFilter addCondition(String columnName, CompareType compareType, Object value) {
        super.addCondition(FieldKey.fromString(columnName), value, compareType);
        return this;
    }
}
