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

import { Dayjs } from 'dayjs';
import { Option } from '@labkey/components';

export type HousingRowMetadata = {
    cageOptions: Option<string>[];
    projectOptions?: Option<string>[];
    animalsInDestinationCage?: string[];
};

export type ExtendedHousingTransferData = HousingTransferData & {
    metadata?: HousingRowMetadata;
};

export interface HousingTransferData {
    id: string;
    inDate: Dayjs;
    outDate: Dayjs;
    destinationRoom: Option<number>;
    destinationCage: Option<string>;
    condition: Option<string>[];
    reasonForMove: Option<string>[];
    project: string;
    remarks: string;
    performedBy: string;
    triggeredBy?: string; // ID of the animal that triggered this animal's addition to the grid
}