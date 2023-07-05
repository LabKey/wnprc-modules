export interface ConfigProps {
    schemaName: string;
    queryName: string;
    columns?: any;
    sort?: string;
    containerPath?: string;
    filterArray?: Array<any>;
}

export interface DropdownSelectProps {
    options: Array<object>;
    dropdownLabel: string;
    controlWidth?: number;
}

export interface DropdownContainerProps {
    update: boolean;
}
