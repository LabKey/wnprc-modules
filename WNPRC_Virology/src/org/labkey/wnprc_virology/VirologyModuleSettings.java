package org.labkey.wnprc_virology;

import org.labkey.api.data.PropertyManager;
import org.labkey.api.util.ConfigurationException;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public class VirologyModuleSettings
{
    public static final String PROPERTY_CATEGORY = "wnprc_virology.virologyConfig";

    public static final String RSEHR_QC_STATUS_STRING_PROP = "rsehrQCStatus";
    public static final String ZIKA_PORTAL_QC_STATUS_STRING_PROP = "zikaPortalQCStatus";
    public static final String VIROLOGY_RSEHR_PARENT_FOLDER_STRING_PROP = "virologyRSEHRParentFolderPath";
    public static final String VIROLOGY_EHR_VL_SAMPLE_QUEUE_PATH_PROP = "virologyEHRVLSampleQueueFolderPath";
    public static final String VIROLOGY_RSEHR_JOB_INTERVAL_PROP = "virologyRSEHRJobInterval"; // in minutes
    public static final String ZIKA_PORTAL_URL_PROP = "zikaPortalURL";

    private Map<String, Object> _settings;

    public VirologyModuleSettings()
    {
        _settings = createSettingsMap();
    }

    public static void setVirologyModuleSettings(Map<String, String> props) throws ConfigurationException
    {
        PropertyManager.PropertyMap writableProps = PropertyManager.getWritableProperties(PROPERTY_CATEGORY, true);
        writableProps.clear();

        writableProps.putAll(props);
        writableProps.save();
    }

    public Map<String, Object> getSettingsMap()
    {
        return Collections.unmodifiableMap(_settings);
    }

    public Map<String, Object> createSettingsMap()
    {
        Map<String, Object> ret = new HashMap<>();

        Map<String, String> map = PropertyManager.getProperties(PROPERTY_CATEGORY);
        for (String key : map.keySet())
        {
            //cleaning settings
            /*if (key.equals(ALLOWED_DN_PROP) && StringUtils.trimToNull(map.get(key)) != null)
            {
                ret.put(key, map.get(key).split(DELIM));
            }
            else
            {
                ret.put(key, map.get(key));
            }*/

            ret.put(key, map.get(key));
        }

        //default settings
        if (ret.get(VIROLOGY_RSEHR_JOB_INTERVAL_PROP) == null)
            ret.put(VIROLOGY_RSEHR_JOB_INTERVAL_PROP, "5");

        return ret;
    }

    public String getRSEHRQCStatusString()
    {
        return (String)_settings.get(RSEHR_QC_STATUS_STRING_PROP);
    }

    public String getZikaPortalQCStatusString()
    {
        return (String)_settings.get(ZIKA_PORTAL_QC_STATUS_STRING_PROP);
    }

    public String getVirologyRSEHRParentFolderPath()
    {
        return (String)_settings.get(VIROLOGY_RSEHR_PARENT_FOLDER_STRING_PROP);
    }

    public String getVirologyEHRVLSampleQueueFolderPath()
    {
        return (String)_settings.get(VIROLOGY_EHR_VL_SAMPLE_QUEUE_PATH_PROP);
    }

    public String getVirologyRSEHRJobInterval()
    {
        return (String)_settings.get(VIROLOGY_RSEHR_JOB_INTERVAL_PROP);

    }

    public String getZikaPortalUrl()
    {
        return (String)_settings.get(ZIKA_PORTAL_URL_PROP);

    }
}