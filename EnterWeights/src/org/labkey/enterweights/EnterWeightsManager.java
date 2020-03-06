package org.labkey.enterweights;

public class EnterWeightsManager
{
    private static final EnterWeightsManager _instance = new EnterWeightsManager();

    private EnterWeightsManager()
    {
        // prevent external construction with a private default constructor
    }

    public static EnterWeightsManager get()
    {
        return _instance;
    }
}
