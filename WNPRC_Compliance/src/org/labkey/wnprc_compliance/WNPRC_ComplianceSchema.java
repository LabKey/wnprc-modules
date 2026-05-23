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
package org.labkey.wnprc_compliance;

import org.labkey.api.data.Container;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.dialect.SqlDialect;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.security.User;

public class WNPRC_ComplianceSchema extends SimpleUserSchema {
    public static final String NAME = "wnprc_compliance";
    public static final String DESCRIPTION = "";

    public WNPRC_ComplianceSchema(User user, Container container) {
        super(NAME, DESCRIPTION, user, container, DbSchema.get(NAME, DbSchemaType.Module));
    }

    public SqlDialect getSqlDialect() {
        return getDbSchema().getSqlDialect();
    }
}
