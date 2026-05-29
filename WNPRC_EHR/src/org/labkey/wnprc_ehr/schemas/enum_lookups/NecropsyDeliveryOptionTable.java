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
public class NecropsyDeliveryOptionTable extends AbstractSimpleStaticTable<NecropsyDeliveryOptionTable.NecropsyDeliveryOption, NecropsyDeliveryOptionTable.Fields> {
    static public String NAME = "necropsy_delivery_options";

    public NecropsyDeliveryOptionTable(@Nullable UserSchema userSchema) {
        super(NAME, userSchema);
    }

    @Override
    public Class getFieldSet() {
        return Fields.class;
    }

    @Override
    public List getEntries() {
        return Arrays.asList(NecropsyDeliveryOption.values());
    }

    public enum Fields implements FieldSet<NecropsyDeliveryOption> {
        key {
            @Override
            public String getValueForField(NecropsyDeliveryOption row) {
                return row.name();
            }
        },
        title {
            @Override
            public String getValueForField(NecropsyDeliveryOption row) {
                return row.getTitle();
            }
        },
        description {
            @Override
            public String getValueForField(NecropsyDeliveryOption row) {
                return row.getDescription();
            }
        }
    }

    public enum NecropsyDeliveryOption {
        VET_SERVICES ("Vet Services",                     "", null),
        INVESTIGATOR ("Investigator",                     "", null),
        SPI          ("SPI",                              "", null),
        ANIMAL_CARE  ("Animal Care",                      "", null),
        OTHER        ("Other (Explain in Comment Field)", "", null);

        String title;
        String description;
        LocalDate disabledDate;

        NecropsyDeliveryOption(String title, String description, LocalDate disabledDate) {
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
