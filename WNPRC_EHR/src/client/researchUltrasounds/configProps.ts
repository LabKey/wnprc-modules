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
    cellStyle: {
        flagColumn: "reviewCompleted",
        type: "boolean",
        green: "Yes",
        red: "No",
    }
}