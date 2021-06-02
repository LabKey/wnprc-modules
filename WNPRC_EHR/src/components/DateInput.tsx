import * as React from "react";

interface DateInputProps {
  opendate: () => void;
  iconpath?: string;
  inputprops?: any;
}

/**
 * Meant to use as a custom date input for react-datepicker
 */
class DateInput extends React.Component<DateInputProps>
{
  render()
  {
    const {opendate, iconpath, ...inputprops} = this.props;

    const openDatepicker = () => {
      this.props.opendate();
    };

    return (
      <>
        <input className="custom-date-input" {...inputprops} />
        <img id="date-calendar-img" onClick={openDatepicker} src={iconpath}/>
      </>
    );
  }
}

export default DateInput;
