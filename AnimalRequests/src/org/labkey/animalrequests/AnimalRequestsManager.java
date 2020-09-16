package org.labkey.animalrequests;

public class AnimalRequestsManager
{
    private static final AnimalRequestsManager _instance = new AnimalRequestsManager();

    private AnimalRequestsManager()
    {
        // prevent external construction with a private default constructor
    }

    public static AnimalRequestsManager get()
    {
        return _instance;
    }
}
