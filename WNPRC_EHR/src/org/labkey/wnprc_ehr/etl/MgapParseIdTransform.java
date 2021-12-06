package org.labkey.wnprc_ehr.etl;

import org.labkey.api.di.columnTransform.ColumnTransform;

public class MgapParseIdTransform extends ColumnTransform
{
    @Override
    protected Object doTransform(Object inputValue)
    {
        //Object prefix = getInputValue("id");
        return "this is a test";
        //String prefixStr = null == prefix ? "" : prefix.toString();
        //return prefixStr + "_" + inputValue + "_" + getConstant("myConstant");
    }
}
