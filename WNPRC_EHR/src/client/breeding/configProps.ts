import { configProps } from '../components/grid_panel/configProps';
export const gridConfig: configProps = {
    schemaName: "study",
    queryName: "PregnancyInfo",
    viewName: "",
    input: {
        controller: "ehr",
        view: "dataEntryForm",
        formType : "Pregnancies"
    }
}