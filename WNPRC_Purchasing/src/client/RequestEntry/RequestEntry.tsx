/*
 * Copyright (c) 2020 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, {FC, useCallback, useEffect, useState} from 'react'
import {RequestOrderPanel} from "../components/RequestOrderPanel";
import {LineItemModel, RequestOrderModel} from "../model";
import {LineItemsPanel} from "../components/LineItemsPanel";

export const App : FC = () => {

    const [requestOrderModel, setRequestOrderModel] = useState<RequestOrderModel>(RequestOrderModel.create({}));
    const [lineItems, setLineItems] = useState<Array<LineItemModel>>([LineItemModel.create({rowIndex: 0})]);
    const [lineItemRowIndex, setLineItemRowIndex] = useState<number>(0);
    const [hasRequestEntryPermission, setHasRequestEntryPermission] = useState<boolean>();
    const [isLoadingModel, setLoadingModel] = useState<boolean>(true);
    const [message, setMessage] = useState<string>();
    const [onChange, setOnChange] = useState<any>();

    useEffect(() => {
        setRequestOrderModel(requestOrderModel);
        setLineItems(lineItems);
    }, []);

    const requestOrderModelChange = useCallback((model:RequestOrderModel)=> {
        setRequestOrderModel(model);
    }, []);

    const lineItemsChange = useCallback((lineItemArray : Array<LineItemModel>)=> {
        setLineItems(lineItemArray);
    }, []);

    return (
        <>
            <RequestOrderPanel onInputChange={requestOrderModelChange} model={requestOrderModel}/>
            <LineItemsPanel onChange={lineItemsChange} lineItems={lineItems}/>
        </>
    )
}