package org.labkey.wnprc_ehr.history;

import org.labkey.api.data.Container;
import org.labkey.api.data.Results;
import org.labkey.api.ehr.history.AbstractDataSource;
import org.labkey.api.module.ModuleLoader;

import java.sql.SQLException;

/**
 * User: bimber
 * Date: 2/17/13
 * Time: 4:52 PM
 */
public class DefaultTBDataSource extends AbstractDataSource
{
    public DefaultTBDataSource()
    {
        super("study", "TB Tests", "TB Test", "TB Tests", ModuleLoader.getInstance().getModule("WNPRC_EHR"));
    }

    @Override
    protected String getHtml(Container container, Results rs, boolean redacted) throws SQLException {
        StringBuilder sb = new StringBuilder();

        sb.append("TB Test Performed\n");
        sb.append(safeAppend(rs, "Lot", "lot"));
        sb.append(safeAppend(rs, "Result", "result"));
        sb.append(safeAppend(rs, "Remark", "remark"));

        return sb.toString();
    }
}
