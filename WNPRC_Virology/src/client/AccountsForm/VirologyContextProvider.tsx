import * as React from "react";
import { createContext, useState } from "react";
interface ContextProps {
    accounts: Array<number>
    setAccountsExternal: (accounts: Array<number>) => void
}

const AppContext = createContext({} as ContextProps);

const ContextProvider: React.FunctionComponent = ({ children }) => {
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
