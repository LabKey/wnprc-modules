package org.labkey.apikey.api.exception;

/**
 * Created by jon on 11/15/16.
 */
public class ServiceDoesNotExist extends Exception {
    public ServiceDoesNotExist(String msg) {
        super(msg);
    }
}
