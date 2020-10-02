package org.labkey.wnprc_ehr.calendar;

public enum Office365TokenCache {
    SURGERY_SCHEDULE("surgery_schedule"),
    ON_CALL_SCHEDULE("on_call_schedule");

    private final String cacheKey;

    Office365TokenCache(String cacheKey) {
        this.cacheKey = cacheKey;
    }

    public String getCacheKey() {
        return cacheKey;
    }
}