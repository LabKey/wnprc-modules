import * as React from "react";
import { FC } from 'react';
import { DefaultFormContainer } from '../../components/DefaultFormContainer';
import { CustomInputPane } from '../../components/CustomInputPane';
import {ActionURL} from '@labkey/api';
import { EditableGridPanel } from '../../components/EditableGridPanel';
import { TaskPane } from '../../components/TaskPane';
import {MUIEditableGridPanel} from '../../components/ResizeableTable';

export const Ultrasounds: FC<any> = (props) => {

    const taskid: string = ActionURL.getParameter('taskid');
    const formStartTime: Date = new Date(new Date().toISOString().slice(0, 16).replace('T', ' '));

    const formType: string = ActionURL.getParameter('formType');
    const reviewRequired = formType ? !formType.includes('Review') : true;
    const components: any[] = [
        {
            type: TaskPane,
            name: "TaskPane",
            schemaName: "ehr",
            queryName: "tasks",
            componentProps: {
                title: "Research Ultrasounds",
                schemaName: "ehr",
                queryName: "tasks"
            }
        },{
            type: EditableGridPanel,
            name: "EditableGridPanel",
            schemaName: "study",
            queryName: "ultrasounds",
            componentProps: {
                prevTaskId: taskid,
                title: "Ultrasounds",
                blacklist: ["crown_rump_gest_day", "gest_sac_gest_day","biparietal_diameter_gest_day", "femur_length_gest_day"]
            }
        },{
            type: EditableGridPanel,
            name: "EditableGridPanel",
            schemaName: "study",
            queryName: "blood",
            componentProps: {
                prevTaskId: taskid,
                title: "Blood",
                blacklist: []
            }
        },{
            type: MUIEditableGridPanel,
            name: "MUIEditableGridPanel",
            schemaName: "study",
            queryName: "blood",
            componentProps: {
                prevTaskId: taskid,
                title: "Blood",
                data: [{
                    firstName: 'Dylan',
                    lastName: 'Murray',
                    email: 'dmurray@yopmail.com',
                    city: 'East Daphne',
                    country: 'USA',
                }]
            }
        }
    ];
    return (
        <div>
            <DefaultFormContainer
                prevTaskId={taskid}
                reviewRequired={reviewRequired}
                taskType={"Ultrasounds"}
                command={taskid ? "update" : "insert"}
                components={components}
                redirectSchema={"study"}
                redirectQuery={"ultrasounds"}
                formStartTime={formStartTime}
                animalInfoPane={false}
            />
        </div>
    );
}