package org.labkey.wnprc_virology;

public class WNPRC_VirologyManager
{
    private static final WNPRC_VirologyManager _instance = new WNPRC_VirologyManager();

    private WNPRC_VirologyManager()
    {
        // prevent external construction with a private default constructor
    }

    public static WNPRC_VirologyManager get()
    {
        return _instance;
    }
}