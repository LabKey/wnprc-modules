package org.labkey.gringotts.annotation;

import org.labkey.gringotts.api.annotation.VaultInfo;

/**
 * Created by jon on 10/19/16.
 */
public class AnnotationUtil {
    public static VaultInfo getVaultInfo(Class clazz) {
        if (clazz.isAnnotationPresent(VaultInfo.class)) {
            return (VaultInfo) clazz.getAnnotation(VaultInfo.class);
        }
        else {
            return null;
        }
    }
}
