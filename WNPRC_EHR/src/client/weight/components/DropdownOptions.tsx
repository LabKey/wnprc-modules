/*
 * Copyright (c) 2021-2026 Board of Regents of the University of Wisconsin System
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
import { useEffect, useState } from "react";
import * as React from "react";
import { DropdownOptionsProps } from "../typings/main";


/**
 * Renders dropdown select options. Expects a set of options w/ value & label properties,
 * as well as a @value function to handle the option that is selected and id and name.
 */
const DropdownOptions: React.FunctionComponent<DropdownOptionsProps> = props => {
  const { options, value, name, id, classname, valuekey, displaykey, initialvalue} = props;
  const [option, setOption] = useState(initialvalue);

  useEffect(() => {
      value(option);
  }, [option]);

  return (
    <select
      id={id}
      className={classname}
      name={name}
      value={initialvalue != "" ? initialvalue : option}
      onChange={e => setOption(e.target.value)}
    >
      <option></option>
      {options &&
        options.map((x, index) => {
          return (
            <option key={index} value={x[valuekey]}>
              {x[displaykey]}
            </option>
          );
        })}
    </select>
  );
};

export default DropdownOptions;
