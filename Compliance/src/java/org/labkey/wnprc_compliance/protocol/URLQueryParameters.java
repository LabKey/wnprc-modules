package org.labkey.wnprc_compliance.protocol;


/**
 * Created by jon on 3/30/17.
 */
public enum URLQueryParameters {
    REVISION_ID ("revision_id")
    ;

    String key;

    URLQueryParameters(String key) {
        this.key = key;
    }

    public String getQueryKey() {
        return this.key;
    }
}
