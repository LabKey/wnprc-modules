package org.labkey.wnprc_ehr.buttons;

import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.security.EHRInProgressInsertPermission;
import org.labkey.api.ldk.table.SimpleButtonConfigFactory;
import org.labkey.api.module.Module;

public class WNPRCAddRecordsButton extends SimpleButtonConfigFactory
{

    public WNPRCAddRecordsButton(Module owner, String schemaName)
    {
        super(owner, "Add Records", "window.location = LABKEY.ActionURL.buildURL('wnprc_ehr','"+ schemaName + "')");
    }

    @Override
    public boolean isAvailable(TableInfo ti)
    {
        return super.isAvailable(ti) && ti.hasPermission(ti.getUserSchema().getUser(), EHRInProgressInsertPermission.class);
    }
}
