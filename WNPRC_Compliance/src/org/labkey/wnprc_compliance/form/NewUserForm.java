/*
 * Copyright (c) 2018-2026 Board of Regents of the University of Wisconsin System
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
package org.labkey.wnprc_compliance.form;

import java.util.List;
import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * Created by jmrichar on 2/8/2017.
 */
public class NewUserForm {
    public String firstName;
    public String lastName;
    public String middleName;
    @JsonFormat(pattern="yyyy-MM-dd'T'HH:mm:ss")
    public Date dateOfBirth;
    public String description;
    public boolean isEmployee;
    public boolean hold;
    public boolean measles_required;
    public List<Integer> userIds;
    public List<Integer> cardNumbers;
}
