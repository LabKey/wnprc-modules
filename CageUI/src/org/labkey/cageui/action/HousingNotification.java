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

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.labkey.api.view.ActionURL;

import java.util.Date;

public class HousingNotification
{
    private HousingForm housingRecord;
    private String cageNumber;
    private String condLabel;
    private String url;

    public HousingForm getHousingRecord()
    {
        return housingRecord;
    }

    public void setHousingRecord(HousingForm housingRecord)
    {
        this.housingRecord = housingRecord;
    }

    public String getCageNumber()
    {
        return cageNumber;
    }

    public void setCageNumber(String cageNumber)
    {
        this.cageNumber = cageNumber;
    }

    public String getCondLabel()
    {
        return condLabel;
    }

    public void setCondLabel(String condLabel)
    {
        this.condLabel = condLabel;
    }

    public String getUrl()
    {
        return url;
    }

    public void setUrl(String url)
    {
        this.url = url;
    }
}
