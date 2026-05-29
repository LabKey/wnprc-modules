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

import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.api.data.Container;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.security.User;

/**
 * Created by jon on 1/13/16.
 */
public class SimpleQueryFactory {
    User _user;
    Container _container;

    public SimpleQueryFactory(User user, Container container) {
        _user      = user;
        _container = container;
    }

    public SimpleQuery makeQuery(String schemaName, String queryName, String viewName) {
        return new SimpleQuery(schemaName, queryName, viewName, _user, _container);
    }

    public SimpleQuery makeQuery(String schemaName, String queryName) {
        return new SimpleQuery(schemaName, queryName, _user, _container);
    }

    public JSONArray selectRows(String schema, String queryName, SimpleFilter filter) {
        SimpleQuery query = this.makeQuery(schema, queryName);

        JSONObject results = query.getResults(filter);

        JSONArray resultRows = results.getJSONArray("rows");
        return (resultRows != null) ? resultRows : new JSONArray();
    }

    public JSONArray selectRows(String schema, String query) {
        return selectRows(schema, query, null);
    }

    public SimpleQueryUpdater getUpdater(String schemaName, String queryName) {
        return new SimpleQueryUpdater(_user, _container, schemaName, queryName);
    }
}
