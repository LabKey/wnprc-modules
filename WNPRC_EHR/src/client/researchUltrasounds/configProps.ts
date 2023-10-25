import { configProps } from '../components/grid_panel/configProps';
export const gridConfig: configProps = {
    schemaName: "study",
    queryName: "ResearchUltrasoundsInfo",
    viewName: "",
    input: {
        controller: "ehr",
        view: "dataEntryForm",
        formType: "Research Ultrasounds"
    },
    cellStyles: [{
        cellColumns: ["reviewCompleted"],
        flagData: {
            type: "boolean",
            flagColumn: "reviewCompleted",
            data: ["No", "Yes"],
            color: ["rgb(250,119,102)","rgb(144,219,130)"]
        }
    }]
}