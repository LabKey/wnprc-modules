import * as React from "react";
import { FC } from 'react';
import { DefaultFormContainer } from '../../components/DefaultFormContainer';
import { CustomInputPane } from '../../components/CustomInputPane';
import {InstructionsPane} from '../../components/InstructionsPane';
import {TaskPane} from '../../components/TaskPane';
import {ActionURL} from '@labkey/api';

import {
    inputs,
    reviewInputs,
    restraintInputs,
} from './customInputs';
export const ResearchUltrasounds: FC<any> = (props) => {
    const taskid: string = ActionURL.getParameter('taskid');
    const formStartTime: Date = new Date(new Date().toISOString().slice(0, 16).replace('T', ' '));

    const formType: string = ActionURL.getParameter('formType');
    const reviewRequired = formType ? !formType.includes('Review') : true;
    const components: any[] = [
        {
            type: TaskPane,
            name: "TaskPane",
            componentProps: {
                title: "Research Ultrasounds",
                schemaName: "ehr",
                queryName: "tasks"
            }
        },{
            type: InstructionsPane,
            name: "InstructionsPane",
            componentProps: {
                instructions: "In the form below you can enter multiple comma separated values" +
                    " for all measurement fields (all fields from BPM to Nuchal Fold).\n\s" +
                    "\n\s" +
                    "For example, if you took 3 crown rump measurements of 28.33mm, 29.12mm, and 28.75mm," +
                    " you would enter them into the 'Crown Rump (mm)' field as:\n\s" +
                    "**28.33,29.12,28.75**\s"
            }
        },{
            type: CustomInputPane,
            name: "ResearchPane",
            required: ["TaskPane.qcstate"],
            componentProps: {
                title: "Research Ultrasounds",
                schemaName: "study",
                queryName: "research_ultrasounds",
                inputs: inputs,
            }
        },{
            type: CustomInputPane,
            name: "RestraintPane",
            required: ["ResearchPane.Id","ResearchPane.date", "TaskPane.qcstate"],
            componentProps: {
                schemaName: "study",
                queryName: "restraints",
                title: "Restraint",
                inputs: restraintInputs,
            }
        }
    ];
    if(formType === "Research Ultrasounds Review") {
        const review = {
            type: CustomInputPane,
            name: "ReviewPane",
            required: ["TaskPane.qcstate"],
            commandOverride: 'insert',
            componentProps: {
                title: "Ultrasound Review",
                schemaName: "study",
                queryName: "ultrasound_review",
                inputs: reviewInputs,
            }
        }

        components.push(review);
    }
    return (
        <div>
            <DefaultFormContainer
                prevTaskId={taskid}
                reviewRequired={reviewRequired}
                taskType={"Research Ultrasounds"}
                command={taskid ? "update" : "insert"}
                components={components}
                redirectSchema={"study"}
                redirectQuery={"research_ultrasounds"}
                formStartTime={formStartTime}
            />
        </div>
    );
};
