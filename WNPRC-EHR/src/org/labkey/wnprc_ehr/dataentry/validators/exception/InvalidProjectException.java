package org.labkey.wnprc_ehr.dataentry.validators.exception;

import org.labkey.api.util.SkipMothershipLogging;

/**
 * Created by jon on 10/25/16.
 */
public class InvalidProjectException extends Exception implements SkipMothershipLogging {
    public InvalidProjectException(String message) {
        super(message);
    }
}
