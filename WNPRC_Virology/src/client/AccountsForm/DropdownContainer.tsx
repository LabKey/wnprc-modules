import * as React from 'react';
import { useState, useContext, useEffect } from 'react';
import { ActionURL, Ajax } from '@labkey/api';
import { Button } from 'react-bootstrap';
import CSS from "csstype";

import { AppContext } from "./VirologyContextProvider";
import DropdownSelect from "./DropdownSelect";
import { ConfigProps, DropdownContainerProps } from '../typings/main';
import { labkeyActionSelectWithPromise } from '../helpers/helper';

const DropdownContainer: React.FunctionComponent<any> = (props: DropdownContainerProps) => {

    const updateAccounts = props.update;

    const containerStyles: CSS.Properties = {
        maxWidth: '660px'
    }

    const buttonRowStyle: CSS.Properties = {
        float: 'right'
    }

    const [disabled, setDisabled] = useState(false);
    const {
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

    function onSubmit() {
        setDisabled(true);
        if (updateAccounts==true)
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
        <div style={containerStyles}>
            <div className="row">
                <div className="col-xs-9">
                    <DropdownSelect
                        options={options}
                        dropdownLabel="Accounts"
                    />
                </div>
                <div className="col-xs-3"></div>
            </div>
            <div className="row">&nbsp;</div>
            <div className="row">
                <div className="col-xs-9"></div>
                <div className="col-xs-3">
                    {!updateAccounts && <Button
                        variant="primary"
                        onClick={onSubmit}
                        disabled={disabled}
                        style={buttonRowStyle}
                        >
                        Save and Configure Permissions
                    </Button>}
                    {updateAccounts && <Button
                            variant="primary"
                            onClick={onSubmit}
                            disabled={disabled}
                            style={buttonRowStyle}
                    >
                        Update Accounts
                    </Button>}
                </div>
            </div>
        </div>
    )
}

export default DropdownContainer;

