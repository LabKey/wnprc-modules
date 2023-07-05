export interface configProps {
    schemaName: string;
    queryName: string;
    viewName: string;
    input?: {
        controller: string,
        view: string,
        formType: string
    };
    cellStyle?: any;
    filterConfig?: any;
}

export const gridConfig: configProps = {
    schemaName: "",
    queryName: "",
    viewName: "",
    input: {
        controller: "",
        view: "",
        formType: ""
    },
    filterConfig: {
        subjects: "",
        date: "",
        filters: "",
    },
}