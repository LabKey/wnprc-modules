export interface configProps {
    schemaName: string;
    queryName: string;
    viewName: string;
    title?: string;
    columnStyles?: any;
    input?: {
        controller: string,
        view: string,
        formType: string
    };
    cellStyles?: [{
        cellColumns: any[];
        flagData: {
            type: string;
            flagColumn: string;
            data: any[];
            color: string | string[];
            schemaName?: string;
            queryName?: string;
        };
    }];
    filterConfig?: {
        date: any;
        filters: any;
    };
}