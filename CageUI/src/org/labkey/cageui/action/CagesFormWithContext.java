package org.labkey.cageui.action;

import java.util.ArrayList;
import java.util.Map;

public class CagesFormWithContext
{
    private ArrayList<CagesForm> _cagesForm;
    private Map<String,Map<String, Object>> _extraContext;

    public ArrayList<CagesForm> getCagesForm()
    {
        return _cagesForm;
    }

    public void setCagesForm(ArrayList<CagesForm> cagesForm)
    {
        _cagesForm = cagesForm;
    }

    public Map<String,Map<String, Object>> getExtraContext()
    {
        return _extraContext;
    }

    public void setExtraContext(Map<String,Map<String, Object>> extraContext)
    {
        _extraContext = extraContext;
    }
}
