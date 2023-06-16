import * as React from "react";
import { FC } from 'react';
import { DefaultFormContainer } from '../components/DefaultFormContainer';
import { CustomInputPane } from '../components/CustomInputPane';
import {RestraintPane} from '../components/RestraintPane';
import {InstructionsPane} from '../components/InstructionsPane';

export const ResearchUltrasounds: FC<any> = (props) => {
    const taskid: string = LABKEY.ActionURL.getParameter('taskid');
    return (
        <div>
            <DefaultFormContainer
                taskId={taskid}
                taskTitle={"Research Ultrasounds"}
                taskType={"Research Ultrasounds"}
                command={taskid ? "update" : "insert"}
                components={[
                    {
                        type: InstructionsPane,
                        componentProps: {
                            instructions: "In the form below you can enter multiple comma separated values" +
                                " for all measurement fields (all fields from BPM to Nuchal Fold).\n\s" +
                                "\n\s" +
                                "For example, if you took 3 crown rump measurements of 28.33mm, 29.12mm, and 28.75mm," +
                                " you would enter them into the 'Crown Rump (mm)' field as:\n\s" +
                                "**28.33,29.12,28.75**\s"
                        }
                    },
                    {
                        type: CustomInputPane,
                        syncedValues: {
                            TaskPane: ["taskid"],
                        },
                        validation: true,
                        componentProps: {
                            title: "Research Ultrasounds",
                            inputPath: 'researchUltrasoundsEntry',
                            schemaName: "study",
                            queryName: "research_ultrasounds",
                        }
                    },{
                        type: RestraintPane,
                        componentProps: {
                            schemaName: "study",
                            queryName: "restraints"
                        },
                        syncedValues: {
                            CustomInputPane: ["Id"],
                            TaskPane: ["taskid"],
                        },
                    }
                ]}
                redirectSchema={"study"}
                redirectQuery={"research_ultrasounds"}
            />
        </div>
    );
};
