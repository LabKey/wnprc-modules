// noinspection TypeScriptValidateTypes

import React, { FC, useEffect, useState } from 'react';

import { produce } from 'immer';

import {
    GridPanel,
    InjectedQueryModels,
    QueryColumn,
    QueryModel,
    withQueryModels
} from '@labkey/components';


// Any props you might use will go here
interface myProps {
    formType: string;
    input?: string;
    cellStyle?: any;
}


// Here we create a type that includes InjectedQueryModels because
// we're wrapping the component with withQueryModels which will inject
// queryModels and actions objects.
type Props = myProps & InjectedQueryModels;

// Here we use the name ExampleGridPanelImpl, users will not use this
// component directly, only the wrapped version below which we expose
// to users as ExampleGridPanel.
const DefaultGridPanelImpl: FC<Props> = ({
    actions,
    queryModels,
    formType,
    input,
    cellStyle,
    }) => {

    //declare any states here
    const [queryModel, setQueryModel] = useState<QueryModel>(queryModels.containersModel);
    console.log(cellStyle);
    const styleColumn = cellStyle.column;

    useEffect(() => {
        if(queryModels?.containersModel?.queryInfo) {
            const { containersModel } = queryModels;
            const { queryInfo } = containersModel;

            // Add custom cell renderer to column
            const oldColumn = queryInfo.getColumn(styleColumn);
            const newColumn = new QueryColumn({...oldColumn, ...{"cell": cellRenderer}});

            // Add the new column to the list of columns and add to QueryInfo
            // Note: QueryInfo and the columns list are currently defined with ImmutableJS, this is likely to change
            // in future versions to immer, so these lines will need to be changed when that conversion happens
            const oldColumns = queryInfo.get("columns");
            const newQueryInfo = queryInfo.set("columns", oldColumns.set(styleColumn, newColumn));

            // Update QueryModel with new QueryInfo
            setQueryModel(
                produce<QueryModel>(draft => {
                    Object.assign(draft, {...containersModel, ...{'queryInfo': newQueryInfo}});
                })
            );
        }
    },[queryModels?.containersModel]);

    const cellRenderer = (data, row, col, rowIndex, columnIndex) => {
        const value = data.get('value');
        const backgroundClr = value === cellStyle.green
            ? "rgb(144,219,130)"
            : value === cellStyle.red
            ? "rgb(250,119,102)"
            : null;
        return (
            <div style={{
                backgroundColor: backgroundClr,
                padding: 5,
            }}
            >
                {value}
            </div>
        );
    };

    const onRefreshGrid = () => {
        const { containersModel } = queryModels;
        actions.loadModel(containersModel.id);
    };

    const onInsert = () => {
        window.location = LABKEY.ActionURL.buildURL('wnprc_ehr', input , LABKEY.ActionURL.getContainer(), {
            formType: formType,
            returnUrl: window.location
        })
    };

    // This is an example of a custom button bar element in your GridPanel that can interact with the QueryModel.
    const renderGridButtons = () => {
        return (
            <div className={'labkey-button-bar'}>
                <button className={'labkey-button'} onClick={onRefreshGrid}>
                    Refresh Grid
                </button>
                {input && <button className={'labkey-button'} onClick={onInsert}>
                    Insert New
                </button>}
            </div>

        )
    };


    return (
        <div>
            {queryModel?.queryInfo && <GridPanel
                model={queryModel}
                ButtonsComponent={renderGridButtons}
                actions={actions}
                asPanel={true}
                showSearchInput={false}
            />}
        </div>
    );

}


// Next wrap your component with withQueryModels, here we set the type
// to OwnProps so the returned component, ExampleGridPanel, can
// be used in a type-safe manner. In this case, if the user forgets to
// pass in a title or the asPanel property, we'll get a compiler error as intended.

export const DefaultGridPanel = withQueryModels<myProps>(DefaultGridPanelImpl);
