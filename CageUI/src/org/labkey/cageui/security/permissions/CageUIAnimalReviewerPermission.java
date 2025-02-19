package org.labkey.cageui.security.permissions;

import org.labkey.api.security.permissions.AbstractPermission;

public class CageUIAnimalReviewerPermission extends AbstractPermission
{
    public CageUIAnimalReviewerPermission()
    {
        super("Cage UI Animal Reviewer",
                "This permission allows the user to approve animal moves");
    }

}
