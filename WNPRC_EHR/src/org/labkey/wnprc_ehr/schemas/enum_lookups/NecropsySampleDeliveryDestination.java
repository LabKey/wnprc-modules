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
package org.labkey.wnprc_ehr.schemas.enum_lookups;

import org.jetbrains.annotations.Nullable;
import org.joda.time.LocalDate;
import org.labkey.api.query.UserSchema;
import org.labkey.dbutils.api.AbstractSimpleStaticTable;
import org.labkey.dbutils.api.FieldSet;

import java.util.Arrays;
import java.util.List;

/**
 * Created by jon on 3/17/16.
 */
public class NecropsySampleDeliveryDestination extends AbstractSimpleStaticTable<NecropsySampleDeliveryDestination.SampleDeliveryDestination, NecropsySampleDeliveryDestination.Fields> {
    static public String NAME = "necropsy_tissue_sample_delivery_options";

    public NecropsySampleDeliveryDestination(@Nullable UserSchema userSchema) {
        super(NAME, userSchema);
    }

    @Override
    public Class getFieldSet() {
        return Fields.class;
    }

    @Override
    public List getEntries() {
        return Arrays.asList(SampleDeliveryDestination.values());
    }

    public enum Fields implements FieldSet<SampleDeliveryDestination> {
        key {
            @Override
            public String getValueForField(SampleDeliveryDestination row) {
                return row.name();
            }
        },
        title {
            @Override
            public String getValueForField(SampleDeliveryDestination row) {
                return row.getTitle();
            }
        },
        description {
            @Override
            public String getValueForField(SampleDeliveryDestination row) {
                return row.getDescription();
            }
        }
    }

    public enum SampleDeliveryDestination {
        PICK_UP      ("Pick Up",         "", null),
        COURIER_AVRL ("Courier to AVRL", "", null),
        COURIER_WIMR ("Courier to WIMR", "", null),
        COURIER_CCOURT ("Courier to CCourt", "", null),
        COURIER_BMQ ("Courier to BMQ", "", null),
        COURIER_ELEMENTS ("Courier to Elements", "", null),
        FEDEX        ("FedEx",           "", null),
        UPS          ("UPS",             "", null),
        OTHER        ("Other",           "", null);

        String title;
        String description;
        LocalDate disabledDate;

        SampleDeliveryDestination(String title, String description, LocalDate disabledDate) {
            this.title = title;
            this.description = description;
            this.disabledDate = disabledDate;
        }

        public String getTitle() {
            return title;
        }

        public String getDescription() {
            return description;
        }
    }
}
