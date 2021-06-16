package org.labkey.selfregistration;

public class SelfRegistrationManager
{
    private static final SelfRegistrationManager _instance = new SelfRegistrationManager();

    private SelfRegistrationManager()
    {
        // prevent external construction with a private default constructor
    }

    public static SelfRegistrationManager get()
    {
        return _instance;
    }
}