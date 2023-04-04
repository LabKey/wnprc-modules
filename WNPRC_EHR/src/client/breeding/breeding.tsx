import React, {FC} from 'react';
import { Query, getServerContext } from '@labkey/api';
import {
    SchemaQuery,
    ServerContextProvider,
    withAppUser,
    AppContextProvider
} from '@labkey/components';


import { DefaultGridPanel } from "../components/DefaultGridPanel";

export const Breeding: FC<any> = (props) => {

    const serverContext = withAppUser(getServerContext());
    const queryConfigs = {
        containersModel: {
            schemaQuery: new SchemaQuery('study', 'PregnancyInfo'),
            containerFilter: Query.containerFilter.allFolders,
            omittedColumns: ['SortOrder','Searchable','Type','Title','ContainerType','Workbook','IdPrefixedName','Key'],
            includeTotalCount: true,
        }
    };

    // return rendered view of breeding table to app.tsx
    return (
        <ServerContextProvider initialContext={serverContext}>
            <AppContextProvider>
                <DefaultGridPanel
                    queryConfigs={queryConfigs}
                    asPanel={true}
                    autoLoad
                />
            </AppContextProvider>
        </ServerContextProvider>
    );
}