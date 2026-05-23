/*
 * Copyright (c) 2016-2026 Board of Regents of the University of Wisconsin System
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
