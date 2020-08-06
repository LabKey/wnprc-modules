/*
 * Copyright (c) 2017 LabKey Corporation
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

package org.labkey.wnprc_billing;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager.ContainerListener;
import org.labkey.api.data.DatabaseTableType;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Table;
import org.labkey.api.data.TableInfo;
import org.labkey.api.security.User;
import java.util.Collections;
import java.util.Collection;

import java.beans.PropertyChangeEvent;

public class WNPRC_BillingContainerListener implements ContainerListener
{
    @Override
    public void containerCreated(Container c, User user)
    {
    }

    @Override
    public void containerDeleted(Container c, User user)
    {
        DbScope scope = WNPRC_BillingSchema.getInstance().getSchema().getScope();
        SimpleFilter containerFilter = SimpleFilter.createContainerFilter(c);
        try (DbScope.Transaction transaction = scope.ensureTransaction())
        {
            TableInfo tierRatesTable = WNPRC_BillingSchema.getInstance().getTierRates();
            if (tierRatesTable.getTableType() == DatabaseTableType.TABLE)
            {
                Table.delete(tierRatesTable, containerFilter);
            }

            TableInfo groupCategoryAssociations = WNPRC_BillingSchema.getInstance().getGroupCategoryAssociations();
            if (groupCategoryAssociations.getTableType() == DatabaseTableType.TABLE)
            {
                Table.delete(groupCategoryAssociations, containerFilter);
            }

            transaction.commit();
        }
    }

    @Override
    public void propertyChange(PropertyChangeEvent evt)
    {
    }

    @Override
    public void containerMoved(Container c, Container oldParent, User user)
    {
    }

    @NotNull @Override
    public Collection<String> canMove(Container c, Container newParent, User user)
    {
        return Collections.emptyList();
    }
}