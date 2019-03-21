package org.labkey.wnprc_ehr.dataentry.validators.exception;

import org.labkey.api.util.SkipMothershipLogging;

/**
 * Created by jon on 10/25/16.
 */
public class InvalidAnimalIdException extends Exception implements SkipMothershipLogging {
    public InvalidAnimalIdException(String message) {
        super(message);
    }
}
