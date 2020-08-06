package org.labkey.gringotts.api.annotation;

/**
 * Created by jon on 10/19/16.
 */
public @interface SerializeField {
    String columnName() default "";
}
