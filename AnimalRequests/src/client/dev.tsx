/*
 * Copyright (c) 2026 Board of Regents of the University of Wisconsin System
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
import React from 'react';
import { createRoot } from 'react-dom/client';
import { AnimalRequestForm } from './containers/Forms/AnimalRequestForm';
import { getEHRData } from './query/actions';

import './theme/css/index.css';
import './theme/css/react-datepicker.css';
import './theme/css/bootstrap.min.css';
import './theme/css/tooltip.css';

const render = (): void => {
    // TODO: Do this once in application init
    const dataArr: Promise<any>[] = [
        getEHRData('ehr','investigatorsWithName', '', '', [], 'IncludeExternal'),
        getEHRData('ehr_lookups','animal_requests_viral_status'),
        getEHRData('ehr_lookups','animal_requests_origin','meaning'),
        getEHRData('ehr_lookups','animal_requests_species','common'),
        getEHRData('ehr_lookups','animal_requests_sex'),
        getEHRData('ehr_lookups','animal_requests_active_projects','-project','project,account,enddate'),
        getEHRData('ehr','protocol','-protocol'),
        getEHRData('ehr_lookups','animal_requests_disposition'),
        getEHRData('ehr_lookups','animal_requests_infectiousdisease'),
        getEHRData('ehr_lookups', 'animal_requests_yes_no')
    ];

    createRoot(document.getElementById('app')).render(
        <AnimalRequestForm
            loading={true}
            submitted={false}
            uniqueProtocolInvestigator={[{value: ''}]}
            animal_requests_viral_status={[{value: ''}]}
            animal_requests_origin={[{value: ''}]}
            animal_requests_species={[{value: ''}]}
            animal_requests_sex={[{value: ''}]}
            animal_requests_active_projects={[{value: ''}]}
            protocol={[{value: ''}]}
            animal_requests_disposition={[{value: ''}]}
            animal_requests_infectiousdisease={[{value: ''}]}
            animal_requests_yes_no={[{value: ''}]}
            dataArr={dataArr}
        />
    );
};

render();