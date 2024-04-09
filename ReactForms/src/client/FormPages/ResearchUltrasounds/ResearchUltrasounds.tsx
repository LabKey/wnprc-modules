import * as React from "react";
import { FC } from 'react';
import { DefaultFormContainer } from '../../components/DefaultFormContainer';
import { CustomInputPane } from '../../components/CustomInputPane';
import {InstructionsPane} from '../../components/InstructionsPane';
import {TaskPane} from '../../components/TaskPane';
import {ActionURL} from '@labkey/api';

import { findAccount } from '../../query/helpers';
export const ResearchUltrasounds: FC<any> = (props) => {
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
                defaultValues: {
                    updateTitle: "Research Ultrasounds",
                    qcstate: 2,
                }
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
            required: ["ehr-tasks.qcstate"],
            schemaName: "study",
            queryName: "research_ultrasounds",
            componentProps: {
                title: "Research Ultrasounds",
                blacklist: ["taskid", "QCState", "history", "Container"],
                wnprcMetaData: {
                    Id: {
                        type: "text"
                    },
                    project: {
                        type: "dropdown",
                        watchVar: "study-research_ultrasounds.Id",
                        lookup: {
                            schemaName: "study",
                            queryName: "Assignment",
                            displayColumn: "project",
                            keyColumn: "project",
                        },
                        defaultOpts: [{value:300901, label:"300901"},{value:400901, label:"400901"}]
                    },
                    account: {
                        type: "text",
                        autoFill: {
                            watch: "study-research_ultrasounds.project",
                            lookup: {
                                schemaName: "ehr",
                                queryName: "project",
                                column: "account"
                            }}
                    }
                }
            }
        },{
            type: CustomInputPane,
            name: "RestraintPane",
            schemaName: "study",
            queryName: "restraints",
            required: ["study-research_ultrasounds.Id","study-research_ultrasounds.date", "ehr-tasks.qcstate"],
            componentProps: {
                blacklist: ["Id", "taskid", "project","folder", "QCState", "history", "Container", "description", "date"],
                title: "Restraint",
            }
        }
    ];
    if(formType === "Research Ultrasounds Review") {
        const review = {
            type: CustomInputPane,
            name: "ReviewPane",
            required: ["TaskPane.qcstate"],
            commandOverride: 'insert',
            schemaName: "study",
            queryName: "ultrasound_review",
            componentProps: {
                title: "Ultrasound Review",
                blacklist: ['taskid', 'Container', 'history', 'QCState', 'ultrasound_id'],
                wnprcMetaData: {
                    Id: {
                        type: "text"
                    }
                }
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
                animalInfoPane={true}
            />
        </div>
    );
};
