package org.labkey.webutils.api.action.annotation;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

/**
 * Created by jon on 3/9/17.
 */
@Retention(RetentionPolicy.RUNTIME)
public @interface BundlePath {
    String value();
}
