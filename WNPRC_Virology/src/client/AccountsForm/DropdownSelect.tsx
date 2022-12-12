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
  const controlWidth = props.controlWidth ? props.controlWidth : 600;
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
      }
    });

  },[options]);

  const customStyles = {
    control: provided => ({
      // none of react-select's styles are passed to <Control />
      ...provided,
      width: controlWidth,
      borderRadius: "unset"
    }),
  };

  const {
    setAccountsExternal,
    accounts
  } = useContext(AppContext);

  const handleChange = e => {
    setSelectedOptions(e);
    let valArr = [];
    for (let val in e) {
      valArr.push(e[val].value)
    }
    setAccountsExternal(valArr)
  };

  const dropdown = (
      <>
        <div className="row">
          <div className="col-xs-12">
            <label htmlFor="options">{dropdownLabel}:</label>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12">
            <Select
                id="options"
                value={selectedOptions}
                onChange={handleChange}
                options={options}
                styles={customStyles}
                name="option-select"
                isMulti
                isSearchable
            />
          </div>
        </div>
      </>
  );

  return (
      dropdown
  );
};

export default DropdownSelect;
