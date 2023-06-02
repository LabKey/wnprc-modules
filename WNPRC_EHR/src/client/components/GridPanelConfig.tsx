import React, {FC} from 'react';
import { Query, getServerContext, Filter } from '@labkey/api';
import {
    SchemaQuery,
    ServerContextProvider,
    withAppUser,
    AppContextProvider
} from '@labkey/components';


import { DefaultGridPanel } from "./DefaultGridPanel";

interface configProps {
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

/*
Grid Panel Configuration
This is the HOC for the default grid panel. This is where the grid panel picks up the schema, query and any other props
that describe the future grid data. Any customization options on the grid itself is done in the DefaultGridPanel
component.

@param configProps The properties passed in, usually defining the schema, query, and insert form.
*/
export const GridPanelConfig: FC<configProps> = ({
    schemaName,
    queryName,
    viewName,
    input,
    cellStyle,
    filterConfig
    }) => {

    const baseFilters = [];
    if(filterConfig["inputType"] !== "none"){
        if(filterConfig["inputType"] === "roomCage"){
            baseFilters.push(Filter.create("area", filterConfig["area"], Filter.Types.EQUAL.getMultiValueFilter()));
            baseFilters.push(Filter.create("room", filterConfig["room"], Filter.Types.EQUAL.getMultiValueFilter()));
            baseFilters.push(Filter.create("cage", filterConfig["cage"], Filter.Types.EQUAL.getMultiValueFilter()));
        }
        else if (filterConfig["inputType"]=== "multiSubject"){
            baseFilters.push(Filter.create("Id", filterConfig["subjects"], Filter.Types.EQUAL.getMultiValueFilter()));
        }
        else if(filterConfig["inputType"] === "singleSubject"){
            baseFilters.push(Filter.create("Id", filterConfig["subjects"], Filter.Types.EQUAL));
        }
    }

    const serverContext = withAppUser(getServerContext());
    const queryConfigs = {
        containersModel: {
            schemaQuery: new SchemaQuery(schemaName, queryName, viewName),
            containerFilter: Query.containerFilter.allFolders,
            omittedColumns: ['SortOrder','Searchable','Type','Title','ContainerType','Workbook','IdPrefixedName'],
            includeTotalCount: true,
            baseFilters: baseFilters,
        }
    };

    // return rendered view of breeding table to app.tsx
    return (
        <ServerContextProvider initialContext={serverContext}>
            <AppContextProvider>
                <DefaultGridPanel
                    queryConfigs={queryConfigs}
                    input={input}
                    autoLoad
                    cellStyle={cellStyle}
                    viewName={viewName}
                />
            </AppContextProvider>
        </ServerContextProvider>
    );
}