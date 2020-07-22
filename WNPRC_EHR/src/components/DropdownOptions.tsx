import { useEffect, useState } from "react";
import * as React from "react";

interface PropTypes {
  options: any;
  value: any;
  name: any;
  id: string;
  classname: string;
  valuekey: string;
  displaykey: string;
  initialvalue: string;
  onfocus?: any;
  required: boolean;
}

/**
 * Renders dropdown select options. Expects a set of options w/ value & label properties,
 * as well as a @value function to handle the option that is selected and id and name.
 */
const DropdownOptions: React.FunctionComponent<PropTypes> = (props) => {
  const {
    options,
    value,
    name,
    id,
    classname,
    valuekey,
    displaykey,
    initialvalue,
    onfocus,
    required
  } = props;
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
      onChange={(e) => setOption(e.target.value)}
      required={required}
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
