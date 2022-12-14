import * as React from 'react';
import { useState, useContext, useEffect } from 'react';
import { ActionURL, Ajax } from '@labkey/api';
import { Button } from 'react-bootstrap';

import { AppContext } from "./VirologyContextProvider";
import DropdownSelect from "./DropdownSelect";
import { ConfigProps } from '../typings/main';
import { labkeyActionSelectWithPromise } from '../helpers/helper';

const DropdownContainer: React.FunctionComponent<any> = props => {

    const [disabled, setDisabled] = useState(false);
    const {
        setAccountsExternal,
        accounts
    } = useContext(AppContext);
    const [options, setOptions] = useState<Array<object>>();

    useEffect(() => {
        let config: ConfigProps = {
            schemaName: "wnprc_virology_linked",
            queryName: "grant_accounts"
        };

        labkeyActionSelectWithPromise(config).then(data => {
            let temp = [];
            data["rows"].forEach(item => {
                temp.push({ value: item["rowid"], label: item["alias"]});
            });
            setOptions(temp);
        });
    }, []);

    //do we do a completely separate onSubmit handler here and diff virology action
    // or just pass more stuff to folderSetup..?

    //can we make the Update Accounts tab admin only?
    function onSubmit() {
        setDisabled(true);
        if (props.update==true)
        {
            Ajax.request({
                url: ActionURL.buildURL("wnprc_virology", "updateAccounts"),
                method : 'POST',
                jsonData : {accounts: accounts},
                success: function (s) {
                    window.location.reload();
                },
                failure: function (e) {
                    alert(JSON.parse(e.response).exception)
                }
            })
        } else {
            debugger;
            Ajax.request({
                url: ActionURL.buildURL("wnprc_virology", "folderSetup"),
                method : 'POST',
                jsonData : {accounts: accounts},
                success: function (s) {
                    //send user to perms form
                    window.location.replace(ActionURL.buildURL("security", "permissions"));
                },
                failure: function (e) {
                    alert(JSON.parse(e.response).exception)
                }
            })
        }

    }

    return (
        <>
            <React.StrictMode>
            <DropdownSelect
                options={options}
                dropdownLabel="Accounts"
                controlWidth={560}
            />
            </React.StrictMode>
            {!props.update && <Button
                variant="primary"
                onClick={onSubmit}
                disabled={disabled}
                >
                Save and Configure Permissions
            </Button>}
            {props.update && <Button
                    variant="primary"
                    onClick={onSubmit}
                    disabled={disabled}
            >
                Update Accounts
            </Button>}
        </>
    )
}

export default DropdownContainer;

