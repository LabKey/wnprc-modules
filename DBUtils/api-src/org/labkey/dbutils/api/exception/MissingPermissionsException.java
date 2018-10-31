package org.labkey.dbutils.api.exception;

import org.labkey.api.security.permissions.Permission;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by jon on 10/28/16.
 */
public class MissingPermissionsException extends Exception {
    Class<? extends Permission>[] missingPermissions;

    private MissingPermissionsException(String message, Class<? extends Permission>... missingPermissions) {
        super(message);
        this.missingPermissions = missingPermissions;
    }

    static public MissingPermissionsException createNew (Class < ?extends Permission >... requiredPermissionClasses) {
        String message;

        List<String> requiredPermissions = new ArrayList();
        for(Class<? extends Permission> perm : requiredPermissionClasses) {
            requiredPermissions.add(getPermission(perm).getName());
        }

        if (requiredPermissions.size() == 1)
        {
            message = String.format("The %s permission is needed to perform this action.", requiredPermissions.get(0));
        }
        else if (requiredPermissions.size() == 2) {
            message = String.format(
                    "The %s and %s permissions are needed to perform this action.",
                    requiredPermissions.get(0),
                    requiredPermissions.get(1)
            );
        }
        else {
            StringBuilder builder = new StringBuilder();
            for (int i = 0; i < requiredPermissions.size() - 1; i++) {
                builder.append(requiredPermissions.get(i) + ", ");
            }

            builder.append("and " + requiredPermissions.get(requiredPermissions.size() - 1));

            message = String.format("The %s permissions are needed to perform this action.");
        }

        return new MissingPermissionsException(message, requiredPermissionClasses);
    }

    public static Permission getPermission(Class<? extends Permission> cls)
    {
            try
            {
                return cls.newInstance();
            }
            catch(InstantiationException e)
            {
                throw new RuntimeException(e);
            }
            catch(IllegalAccessException e)
            {
                throw new RuntimeException(e);
            }


    }
}
