/*
 *
 *  * Copyright (c) 2026 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

package org.labkey.cageui.action;

import com.fasterxml.jackson.annotation.JsonProperty;

public class HousingConditionRecordsForm
{
    private String objectid;
    @JsonProperty("special_condition")
    private String specialCondition;
    @JsonProperty("pair_condition")
    private String pairCondition;
    @JsonProperty("cage_condition")
    private String cageCondition;
    @JsonProperty("social_condition")
    private String socialCondition;

    public String getObjectid()
    {
        return objectid;
    }

    public void setObjectid(String objectid)
    {
        this.objectid = objectid;
    }

    public String getSpecialCondition()
    {
        return specialCondition;
    }

    public void setSpecialCondition(String specialCondition)
    {
        this.specialCondition = specialCondition;
    }

    public String getPairCondition()
    {
        return pairCondition;
    }

    public void setPairCondition(String pairCondition)
    {
        this.pairCondition = pairCondition;
    }

    public String getCageCondition()
    {
        return cageCondition;
    }

    public void setCageCondition(String cageCondition)
    {
        this.cageCondition = cageCondition;
    }

    public String getSocialCondition()
    {
        return socialCondition;
    }

    public void setSocialCondition(String socialCondition)
    {
        this.socialCondition = socialCondition;
    }
}
