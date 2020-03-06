import * as React from "react";

/**
 * Meant to use as a custom date input for react-datepicker
 */
const DateInput: React.FunctionComponent<any> = props => {
  const { opendate, ...otherprops } = props;

  const contextPath = LABKEY.ActionURL.getContextPath();

  const openDatepicker = () => {
    props.opendate();
  };

  return (
    <>
      <input className="custom-date-input" {...otherprops} />
      <img
        id="date-calendar-img"
        onClick={openDatepicker}
        src={`${contextPath}/EnterWeights/app/images/icons8-calendar-24.png`}
      />
    </>
  );
};

export default DateInput;
