package org.labkey.wnprc_ehr.etl;

import org.labkey.api.di.columnTransform.ColumnTransform;

public class MgapParseIdTransform extends ColumnTransform
{
    @Override
    protected Object doTransform(Object inputValue)
    {
        String parsedId = null;
        String originalId = (String) getInputValue();
        if (originalId != null && originalId.trim().length() > 0)
        {
            parsedId = originalId.replace("WNPRC-", "");


        }

        return parsedId;
    }
}
