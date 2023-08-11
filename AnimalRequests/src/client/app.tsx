import * as React from 'react';
import { createRoot } from 'react-dom/client';
import './theme/css/index.css';
import './theme/css/react-datepicker.css';
import './theme/css/bootstrap.min.css';
import './theme/css/tooltip.css';

import {AnimalRequestForm} from "./containers/Forms/AnimalRequestForm";
import { getEHRData } from './query/actions';
window.addEventListener('DOMContentLoaded', (event) => {
    //this has to be an array of promises
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
    createRoot(
        document.getElementById('app')
    ).render(<AnimalRequestForm
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
    />);
});