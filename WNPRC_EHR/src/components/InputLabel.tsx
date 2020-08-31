import * as React from "react";

interface LabelInputProps {
  labelFor: string;
  label: string;
}

const InputLabel: React.FunctionComponent<LabelInputProps> = (props) => {
  const { labelFor, label } = props;

  return <label htmlFor={labelFor}>{label}: </label>;
};

export default InputLabel;
