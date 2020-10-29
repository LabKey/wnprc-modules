import * as React from "react";

/**
 * Shows labkey loading spinner next to some text.
 */
const EHRSpinner: React.FunctionComponent<any> = (props) => {
  const { text } = props;
  return (
    <>
      <i className="fa fa-spinner fa-pulse"></i> {text}
    </>
  );
};

export default EHRSpinner;
