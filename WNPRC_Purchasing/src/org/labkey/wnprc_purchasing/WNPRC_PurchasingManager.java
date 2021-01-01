/*
 * Copyright (c) 2020 LabKey Corporation
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

package org.labkey.wnprc_purchasing;

import org.labkey.api.data.Container;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.TableInfo;
import org.labkey.api.exp.api.ExperimentService;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.reader.TabLoader;
import org.labkey.api.resource.FileResource;
import org.labkey.api.resource.Resource;
import org.labkey.api.security.User;

import java.io.File;
import java.util.List;
import java.util.Map;

public class WNPRC_PurchasingManager
{
    private static final WNPRC_PurchasingManager _instance = new WNPRC_PurchasingManager();
    private static final String INITIAL_DATA_FOLDER = "data/";

    private WNPRC_PurchasingManager()
    {
        // prevent external construction with a private default constructor
    }

    public static WNPRC_PurchasingManager get()
    {
        return _instance;
    }

    public void addLineItems(Container c, User user)
    {
        addData(c, user, "ehr_purchasing", "lineItemStatus", "lineItemStatus.tsv");
    }

    public void addItemUnits(Container c, User user)
    {
        addData(c, user, "ehr_purchasing", "itemUnits", "itemUnits.tsv");
    }

    public void addQCStatus(Container c, User user)
    {
        addData(c, user, "core", "QCState", "QCStatus.tsv");
    }

    private void addData(Container c, User user, String schemaName, String tableName, String fileName)
    {
        TableInfo table = QueryService.get().getUserSchema(user, c, schemaName).getTable(tableName);

        Resource resource = ModuleLoader.getInstance().getModule(WNPRC_PurchasingModule.class).getModuleResource(INITIAL_DATA_FOLDER + fileName);
        File dataFile = ((FileResource) resource).getFile();
        TabLoader tabLoader = new TabLoader(dataFile, true);
        List<Map<String, Object>> data = tabLoader.load();

        insertData(c, user, table, data);
    }

    public void insertData(Container c, User user, TableInfo table, List<Map<String, Object>> data)
    {
        BatchValidationException errors = new BatchValidationException();

        try (DbScope.Transaction transaction = ExperimentService.get().ensureTransaction())
        {
            if (table != null)
            {
                QueryUpdateService qus = table.getUpdateService();
                qus.insertRows(user, c, data, errors, null, null);
            }
            if (errors.hasErrors())
                throw errors;

            transaction.commit();
        }
        catch (Exception e)
        {
            throw new RuntimeException(e);
        }
    }
}