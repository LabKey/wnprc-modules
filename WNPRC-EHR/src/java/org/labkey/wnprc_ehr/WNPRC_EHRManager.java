/*
 * Copyright (c) 2013-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.labkey.wnprc_ehr;

import org.labkey.api.data.Container;
import org.labkey.api.data.PropertyManager;
import org.labkey.api.query.Queryable;
import org.labkey.api.security.User;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * User: bimber
 * Date: 9/21/13
 * Time: 9:55 AM
 */
public class WNPRC_EHRManager
{
    private static WNPRC_EHRManager _instance = new WNPRC_EHRManager();
    public static final String VetReviewStartDateProp = "VetReviewStartDate";

    @Queryable
    public static final String AUC_RESERVED = "AUC Reserved";
    @Queryable
    public static final String PENDING_SOCIAL_GROUP = "Pending Social Group";
    @Queryable
    public static final String PENDING_ASSIGNMENT = "Pending Assignment";
    @Queryable
    public static final String BASE_GRANT_PROJECT = "0492";
    @Queryable
    public static final String U42_PROJECT = "0492-02";
    @Queryable
    public static final String U24_PROJECT = "0492-03";
    @Queryable
    public static final String TMB_PROJECT = "0300";
    @Queryable
    public static final String VET_USER_GROUP = "DCM Veterinarians";
    @Queryable
    public static final String VET_REVIEW = "Vet Review";
    @Queryable
    public static final String TECH_REVIEW = "Reviewed";
    @Queryable
    public static final String REPLACED_SOAP = "Replaced SOAP";
    @Queryable
    public static final String RECORD_AMENDMENT = "Record Amendment";
    @Queryable
    public static final String TB_TEST_INTRADERMAL = "TB Test Intradermal";
    @Queryable
    public static final String TB_TEST_SEROLOGIC = "TB Test Serologic";
    @Queryable
    public static final String SURGERY_SOAP_CATEGORY = "Surgery";
    @Queryable
    public static final String CLINICAL_SOAP_CATEGORY = "Clinical";
    @Queryable
    public static final String INFANT_PER_DIEM = "Per Diem Infants < 181 Days";
    @Queryable
    public static final String QUARANTINE_PER_DIEM = "Per Diem Quarantine";
    @Queryable
    public static final Integer INFANT_PER_DIEM_AGE = 181;
    @Queryable
    public static final String NURSERY_AREA = "Nursery Area";
    @Queryable
    public static final Double BASE_SUBSIDY = 0.47;

    private WNPRC_EHRManager()
    {

    }

    public static WNPRC_EHRManager get()
    {
        return _instance;
    }

    private String LOCK_PROP_KEY = getClass().getName() + "||animalLock";
    private final static SimpleDateFormat _dateFormat = new SimpleDateFormat("yyyy-MM-dd");
    private final static SimpleDateFormat _dateTimeFormat = new SimpleDateFormat("yyyy-MM-dd kk:mm");

    public void lockAnimalCreation(Container c, User u, Boolean lock)
    {
        PropertyManager.PropertyMap map = PropertyManager.getWritableProperties(c, LOCK_PROP_KEY, true);
        map.put("lockedBy", u.getDisplayName(u));
        map.put("locked", lock.toString());
        map.put("lockDate", _dateTimeFormat.format(new Date()));

        map.save();

        //PropertyManager.saveProperties(map);
    }

    public Map<String, Object> getAnimalLockProperties(Container c)
    {
        Map<String, String> props = PropertyManager.getProperties(c, LOCK_PROP_KEY);
        Map<String, Object> ret = new HashMap<>();
        if (props != null && !props.isEmpty())
        {
            if (props.containsKey("lockedBy"))
                ret.put("lockedBy", props.get("lockedBy"));

            if (props.containsKey("locked"))
                ret.put("locked", Boolean.parseBoolean(props.get("locked")));

            if (props.containsKey("lockDate"))
            {
                try
                {
                    ret.put("lockDate", _dateTimeFormat.parse(props.get("lockDate")));
                }
                catch (ParseException e)
                {
                    //ignore
                }
            }
        }

        return ret;
    }
}

