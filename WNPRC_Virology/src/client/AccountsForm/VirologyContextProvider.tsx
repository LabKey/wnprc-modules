/*
 * Copyright (c) 2023-2026 Board of Regents of the University of Wisconsin System
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
import * as React from "react";
import { createContext, useState } from "react";
interface ContextProps {
    accounts?: Array<number>
    setAccountsExternal?: (accounts: Array<number>) => void
    children?: React.ReactNode;
}

const AppContext = createContext({} as ContextProps);

const ContextProvider: React.FunctionComponent<ContextProps> = ({ children }) => {
    const [accounts, setAccounts] = useState<Array<number>>(null);

    const setAccountsExternal = (accounts: Array<number>) => {
        setAccounts(accounts);
    };

    const defaultContext = {
        setAccountsExternal,
        accounts,
    };

    return (
        <AppContext.Provider value={defaultContext}>{children}</AppContext.Provider>
    );
};

export { AppContext, ContextProvider };
