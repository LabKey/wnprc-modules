package org.labkey.animalrequests;

import org.labkey.api.action.SpringActionController;

public class AnimalRequestsController extends SpringActionController
{
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(AnimalRequestsController.class);
    public static final String NAME = "animalrequests";

    public AnimalRequestsController()
    {
        setActionResolver(_actionResolver);
    }
}
