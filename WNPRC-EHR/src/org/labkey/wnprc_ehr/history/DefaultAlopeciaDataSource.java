package org.labkey.wnprc_ehr.history;

import org.labkey.api.data.Container;
import org.labkey.api.data.Results;
import org.labkey.api.ehr.history.AbstractDataSource;

import java.sql.SQLException;

/**
 * User: bimber
 * Date: 2/17/13
 * Time: 4:52 PM
 */
public class DefaultAlopeciaDataSource extends AbstractDataSource
{
    public DefaultAlopeciaDataSource()
    {
        super("study", "Alopecia");
    }

    @Override
    protected String getHtml(Container container, Results rs, boolean redacted) throws SQLException
    {
        StringBuilder sb = new StringBuilder();

        sb.append(safeAppend(rs, "Alopecia Score", "score"));
        sb.append(safeAppend(rs, "Cause", "cause"));

        return sb.toString();
    }
}
