import React, { FC, useState } from 'react';

import {
    GridPanel,
    InjectedQueryModels,
    withQueryModels
} from '@labkey/components';


// Any props you might use will go here
interface myProps {
    formType: string;

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
    formType
    }) => {

    //declare any states here

    const onRefreshGrid = () => {

        const { containersModel } = queryModels;

        actions.loadModel(containersModel.id);
    };

    const onInsert = () => {
        window.location = LABKEY.ActionURL.buildURL('ehr', 'dataEntryForm', LABKEY.ActionURL.getContainer(), {
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
                <button className={'labkey-button'} onClick={onInsert}>
                    Insert New
                </button>
            </div>

        )
    };

    const { containersModel } = queryModels;

    return (
        <GridPanel
            model={containersModel}
            ButtonsComponent={renderGridButtons}
            actions={actions}
            asPanel={true}
            showSearchInput={false}
        />
    );

}


// Next wrap your component with withQueryModels, here we set the type
// to OwnProps so the returned component, ExampleGridPanel, can
// be used in a type-safe manner. In this case, if the user forgets to
// pass in a title or the asPanel property, we'll get a compiler error as intended.

export const DefaultGridPanel = withQueryModels<myProps>(DefaultGridPanelImpl);
