export const configProps = {
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
        green: "Yes",
        red: "No",
    }
}