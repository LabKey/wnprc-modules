package org.labkey.cageui.model;

public class RackCondition
{
    private int _value;
    private String _label;

    public RackCondition(int value, String label)
    {
        _value = value;
        _label = label;
    }

    public int getValue()
    {
        return _value;
    }

    public String getLabel()
    {
        return _label;
    }
}
