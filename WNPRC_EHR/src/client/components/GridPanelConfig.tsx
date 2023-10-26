import * as React from 'react';
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
import { FC } from 'react';

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
    cellStyles,
    filterConfig,
    title,
    columnStyles,
    }) => {
    const filterArray = [];
    if(filterConfig) {
        const subjects = filterConfig.subjects;
        const filterDate = filterConfig.date;
        const filterType = filterConfig.filters.inputType;

        if (filterType !== "none") {
            if (filterType === "roomCage" && filterConfig.filters.room !== null) {
                //const area = filterConfig.filters.area.split(',');
                const room = filterConfig.filters.room.split(',');
                const cage = filterConfig.filters.cage.split(',');
                //if (area[0] !== "") filterArray.push(Filter.create("Id/curLocation/area", area, Filter.Types.EQUAL.getMultiValueFilter()));
                if (room[0] !== "") filterArray.push(Filter.create("Id/curLocation/room", room, Filter.Types.EQUAL.getMultiValueFilter()));
                if (cage[0] !== "") filterArray.push(Filter.create("Id/curLocation/cage", cage, Filter.Types.EQUAL.getMultiValueFilter()));
            } else if (filterType === "multiSubject") {
                filterArray.push(Filter.create("Id", filterConfig.filters.nonRemovable['0'].value, Filter.Types.EQUAL.getMultiValueFilter()));
            } else if (filterType === "singleSubject") {
                filterArray.push(Filter.create("Id", subjects[0], Filter.Types.EQUAL));
            }
        }
        if (filterDate) {
            filterArray.push(Filter.create("date", filterDate, Filter.Types.DATE_EQUAL));
        }
    }
    if(cellStyles) {
        cellStyles.forEach((cell) => {
            if (cell.flagData.type === "dataset") {
                const config = {
                    schemaName: cell.flagData.schemaName,
                    queryName: cell.flagData.queryName,
                };
                labkeyActionSelectWithPromise(config).then((data) => {
                    data.rows.forEach((row) => {
                        cell.flagData.data.push(row.code);
                    });
                }).catch((data) => {
                    console.log("loading-unsuccess");
                });
            }
        });
    }
    const serverContext = withAppUser(getServerContext());
    const queryConfigs = {
        containersModel: {
            schemaQuery: new SchemaQuery(schemaName, queryName, viewName),
            containerFilter: Query.containerFilter.allFolders,
            omittedColumns: ['SortOrder','Searchable','Type','Title','ContainerType','Workbook','IdPrefixedName'],
            includeTotalCount: true,
            filterArray: filterArray,
            maxRows: 100,
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
                    cellStyles={cellStyles}
                    title={title}
                    columnStyles={columnStyles}
                />
            </AppContextProvider>
        </ServerContextProvider>
    );
}