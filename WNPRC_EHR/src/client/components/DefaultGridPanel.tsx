// noinspection TypeScriptValidateTypes

import React, { FC, useEffect, useState } from 'react';

import { produce } from 'immer';

import {
    ExtendedMap,
    GridPanel,
    GridProps,
    InjectedQueryModels,
    QueryColumn,
    QueryInfo,
    QueryModel, selectRows,
    withQueryModels
} from '@labkey/components';
import { Filter } from '@labkey/api';
import { labkeyActionSelectWithPromise } from '../query/helpers';
import "../theme/css/index.css";

// Any props you might use will go here
interface myProps {
    input?: {
        controller: string,
        view: string,
        formType: string
    };
    cellStyles?: any;
    viewName?: string;
    title?: string;
    columnStyles?: any;
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
                                             input,
                                             cellStyles,
                                             viewName,
                                             title,
                                             columnStyles
                                         }) => {

    //declare any states here
    const [queryModel, setQueryModel] = useState<QueryModel>(queryModels.containersModel);

    useEffect(() => {
        if(queryModels?.containersModel?.queryInfo && cellStyles) {
            const { containersModel } = queryModels;
            const { queryInfo } = containersModel;
            /*
            const styleColumn = cellStyle.flagColumn.toLowerCase();
            // Add custom cell renderer to column
            const oldColumn = queryInfo.getColumn(styleColumn);
            const newColumn = new QueryColumn({...oldColumn, ...{"cell": cellRenderer}});


            // Color a single column
             const oldColumns = queryInfo.columns;
             const newColumns = oldColumns.merge(oldColumns.set(styleColumn, newColumn));
             const newQueryInfo = new QueryInfo({...queryInfo, ...{"columns": newColumns}});

             // Update QueryModel with new QueryInfo
             setQueryModel(
                 produce<QueryModel>(draft => {
                     Object.assign(draft, {...containersModel, ...{'queryInfo': newQueryInfo}});
                 })
             );
              */
            /** Color all columns **/
            const styledColumns = new ExtendedMap<string, QueryColumn>();
            queryInfo.columns.forEach((column, key) => {
                const newColumn2 = new QueryColumn({...column, ...{"cell": cellRenderer}});
                styledColumns.set(key, newColumn2);
            });
            const newQueryInfo2 = new QueryInfo({...queryInfo, ...{"columns": styledColumns}});

            // Update QueryModel with new QueryInfo
            setQueryModel(
                produce<QueryModel>(draft => {
                    Object.assign(draft, {...containersModel, ...{'queryInfo': newQueryInfo2}});
                })
            );
        }
    },[queryModels?.containersModel]);

    const cellRenderer = (data, row, col, rowIndex, columnIndex) => {
        let backgroundClr = null;
        const cellVal = data.get('value');
        for(let i = 0; i < cellStyles.length; i++) {
            if (cellStyles[i].cellColumns.includes(col.index)) {
                const flagValue = row.get(cellStyles[i].flagData.flagColumn).get('value');
                if(cellStyles[i].flagData.type === "dataset") {
                    if (cellStyles[i].flagData.data.includes(flagValue) && cellVal !== null) {
                        backgroundClr = cellStyles[i].flagData.color;
                    }
                }
                else if(cellStyles[i].flagData.type === "boolean"){
                    for(let j = 0; j < cellStyles[i].flagData.data.length; j++){
                        if(cellStyles[i].flagData.data[j] === flagValue){
                            backgroundClr = cellStyles[i].flagData.color[j];
                        }
                    }
                }
                break;
            }
        }
        return (
            <div style={{
                backgroundColor: backgroundClr,
                padding: 5,
            }}
                 className={(columnStyles && columnStyles.hasOwnProperty(col.index)) ? columnStyles[col.index] : undefined}
            >
                {data.get('formattedValue') ?? data.get('value')}
            </div>
        );
    };

    const onRefreshGrid = () => {
        const { containersModel } = queryModels;
        actions.loadModel(containersModel.id);
    };

    const onInsert = () => {
        window.location = LABKEY.ActionURL.buildURL(input.controller, input.view , LABKEY.ActionURL.getContainer(), {
            formType: input.formType,
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
            {queryModel?.queryInfo && cellStyles
                ? <GridPanel
                    model={queryModel}
                    ButtonsComponent={renderGridButtons}
                    actions={actions}
                    asPanel={true}
                    showSearchInput={false}
                    allowSelections={true}
                    allowViewCustomization={true}
                    title={title}

                />
                : <GridPanel
                    model={queryModels.containersModel}
                    ButtonsComponent={renderGridButtons}
                    actions={actions}
                    asPanel={true}
                    showSearchInput={false}
                    allowSelections={true}
                    allowViewCustomization={true}
                    title={title}
                />
            }
        </div>
    );

}


// Next wrap your component with withQueryModels, here we set the type
// to OwnProps so the returned component, ExampleGridPanel, can
// be used in a type-safe manner. In this case, if the user forgets to
// pass in a title or the asPanel property, we'll get a compiler error as intended.

export const DefaultGridPanel = withQueryModels<myProps>(DefaultGridPanelImpl);
