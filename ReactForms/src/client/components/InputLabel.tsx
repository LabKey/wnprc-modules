import * as React from "react";

interface LabelInputProps {
  labelFor: string;
  label: string;
  className?: string;
}

const InputLabel: React.FunctionComponent<LabelInputProps> = (props) => {
  const { labelFor, label, className } = props;

  return <label className={className} htmlFor={labelFor}>{label}: </label>;
};

export default InputLabel;
