package org.labkey.cageui.action;

public class CagesForm
{
    private int _rowid;
    private int _rack;
    private String _cageNum;
    private boolean _isDefault;

    public int getRowid()
    {
        return _rowid;
    }

    public void setRowid(int rowid)
    {
        _rowid = rowid;
    }

    public int getRack()
    {
        return _rack;
    }

    public void setRack(int rack)
    {
        _rack = rack;
    }

    public String getCageNum()
    {
        return _cageNum;
    }

    public void setCageNum(String cageNum)
    {
        _cageNum = cageNum;
    }

    public boolean isDefault()
    {
        return _isDefault;
    }

    public void setDefault(boolean aDefault)
    {
        _isDefault = aDefault;
    }
}
