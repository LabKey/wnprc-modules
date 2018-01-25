package org.labkey.wnprc_ehr.service.dataentry;

import org.labkey.api.data.Container;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.Permission;
import org.labkey.dbutils.api.exception.MissingPermissionsException;
import org.labkey.dbutils.api.security.SecurityEscalator;
import org.labkey.dbutils.api.security.StudySecurityEscalator;
import org.labkey.dbutils.api.service.SecurityEscalatedService;
import org.labkey.wnprc_ehr.security.EHRSecurityEscalator;

import java.util.HashSet;
import java.util.Set;

/**
 * Created by jon on 1/11/17.
 */
public abstract class DataEntryService extends SecurityEscalatedService
{
    public DataEntryService(User user, Container container, Class<? extends Permission>... requiredPermissions) throws MissingPermissionsException
    {
        super(user, container, requiredPermissions);
    }

    @Override
    public User getEscalationUser()
    {
        return EHRService.get().getEHRUser(container);
    }

    @Override
    public Set<SecurityEscalator> getEscalators(User user, Container container, String escalationComment)
    {
        Set<SecurityEscalator> escalators = new HashSet<>();

        escalators.add(EHRSecurityEscalator.beginEscalation(user, container, escalationComment));
        escalators.add(StudySecurityEscalator.beginEscalation(user, container, escalationComment));

        return escalators;
    }
}
