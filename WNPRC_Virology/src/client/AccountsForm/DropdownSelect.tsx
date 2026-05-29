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
import { useContext, useEffect, useState } from 'react';
import Select from "react-select";

import { ConfigProps, DropdownSelectProps } from '../typings/main';
import { AppContext } from './VirologyContextProvider';
import { Filter, Security } from '@labkey/api';
import { labkeyActionSelectWithPromise } from '../helpers/helper';

const DropdownSelect: React.FunctionComponent<DropdownSelectProps> = props => {
  const [selectedOptions, setSelectedOptions] = useState<Array<object>>();

  const dropdownLabel = props.dropdownLabel;
  const options = props.options;

  //load up any existing options
  useEffect(() => {
    if (typeof(options) == 'undefined') {
      return;
    }
    let optionsObject = {}
    for (let i = 0; i < options.length; i++) {
      optionsObject[options[i]["value"]] = options[i]["label"]
    }

    let filterArr = [];
    filterArr.push(Filter.create("folder_name", Security.currentContainer.name, Filter.Types.EQUALS))
    let config: ConfigProps = {
      schemaName: "wnprc_virology_linked",
      queryName: "folders_accounts_mappings",
      filterArray: filterArr
    };

    labkeyActionSelectWithPromise(config).then(data => {
      let temp = [];
      if (data["rows"].length > 0) {
        data["rows"].forEach(item => {
          temp.push({ value: item["account"], label: optionsObject[item["account"]]});
        });
        setSelectedOptions(temp);
        setAccountsContext(temp);
      }
    });

  },[options]);

  const {
    setAccountsExternal,
    accounts
  } = useContext(AppContext);

  const setAccountsContext = (accounts:object) => {
    let valArr = [];
    if (accounts != null) {
      Object.keys(accounts).map(account => {
        valArr.push(accounts[account].value)
      });
    }
    setAccountsExternal(valArr)
  }

  const handleChange = e => {
    setSelectedOptions(e);
    setAccountsContext(e);
  };

  const dropdown = (
      <>
            <label htmlFor="options">{dropdownLabel}:</label>
            <Select
                id="options"
                value={selectedOptions}
                onChange={handleChange}
                options={options}
                name="option-select"
                isMulti
                isSearchable
            />
      </>
  );

  return (
      dropdown
  );
};

export default DropdownSelect;
