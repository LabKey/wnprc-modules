package org.labkey.wnprc_ehr.history;

import org.labkey.api.data.Container;
import org.labkey.api.data.Results;
import org.labkey.api.ehr.history.AbstractDataSource;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.FieldKey;

import java.sql.SQLException;

/**
 * User: bimber
 * Date: 2/17/13
 * Time: 4:52 PM
 */
public class DefaultBodyConditionDataSource extends AbstractDataSource {
    public DefaultBodyConditionDataSource()
    {
        super("study", "Body Condition", ModuleLoader.getInstance().getModule("WNPRC_EHR"));
    }

    @Override
    protected String getHtml(Container container, Results rs, boolean redacted) throws SQLException {
        StringBuilder sb = new StringBuilder();

        sb.append(safeAppend(rs, "BCS", "score"));

        if (rs.hasColumn(FieldKey.fromString("weightstatus")) && rs.getObject("weightStatus") != null)
        {
            Boolean value = rs.getBoolean("weightStatus");
            sb.append("Weight Monitoring Needed?: ").append(value).append("\n");
        }

        return sb.toString();
    }
}
