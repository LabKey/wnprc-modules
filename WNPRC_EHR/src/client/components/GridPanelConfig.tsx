import React, {FC} from 'react';
import { Query, getServerContext, Filter } from '@labkey/api';
import {
    SchemaQuery,
    ServerContextProvider,
    withAppUser,
    AppContextProvider
} from '@labkey/components';


import { DefaultGridPanel } from "./DefaultGridPanel";
import { configProps } from './grid_panel/configProps';
import { labkeyActionSelectWithPromise } from '../query/helpers';

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
    filterConfig,
    }) => {
    const baseFilters = [];
    const filterArray = [];
    if(filterConfig) {
        const subjects = filterConfig.subjects;
        const filterDate = filterConfig.date;
        const filterType = filterConfig.filters.inputType;


        if (filterType !== "none") {
            if (filterType === "roomCage") {
                const area = filterConfig.filters.area.split(',');
                const room = filterConfig.filters.room.split(',');
                const cage = filterConfig.filters.cage.split(',');
                if (area[0] !== "") baseFilters.push(Filter.create("Id/curLocation/area", area, Filter.Types.EQUAL.getMultiValueFilter()));
                if (room[0] !== "") baseFilters.push(Filter.create("Id/curLocation/room", room, Filter.Types.EQUAL.getMultiValueFilter()));
                if (cage[0] !== "") baseFilters.push(Filter.create("Id/curLocation/cage", cage, Filter.Types.EQUAL.getMultiValueFilter()));
            } else if (filterType === "multiSubject") {
                baseFilters.push(Filter.create("Id", filterConfig.filters.nonRemovable['0'].value, Filter.Types.EQUAL.getMultiValueFilter()));
            } else if (filterType === "singleSubject") {
                baseFilters.push(Filter.create("Id", subjects, Filter.Types.EQUAL));
            }
        }
        if (filterDate) {
            filterArray.push(Filter.create("date", filterDate, Filter.Types.DATE_EQUAL));
        }
    }

    if(cellStyle.type === "dataset"){
        let config = {
            schemaName: cellStyle.styleSchema,
            queryName: cellStyle.styleQuery,
        };
        labkeyActionSelectWithPromise(config).then((data) => {
            console.log("Data:", data);
            data.rows.forEach((row) => {
                cellStyle.data.push(row.code);
            });
        }).catch((data)=> {
            console.log("loading-unsuccess");
        });
    }

    const serverContext = withAppUser(getServerContext());
    const queryConfigs = {
        containersModel: {
            schemaQuery: new SchemaQuery(schemaName, queryName, viewName),
            containerFilter: Query.containerFilter.allFolders,
            omittedColumns: ['SortOrder','Searchable','Type','Title','ContainerType','Workbook','IdPrefixedName'],
            includeTotalCount: true,
            baseFilters: baseFilters,
            filterArray: filterArray
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