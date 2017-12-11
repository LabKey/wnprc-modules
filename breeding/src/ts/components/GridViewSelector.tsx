import * as React from 'react';

/** View selector for the master detail grid */
export class GridViewSelector extends React.Component<{setView: (selectedItem: any) => void, options: any[] }> {
    public render() {
        return (
            <div className="dropdown">
                <button className="btn dropdown-toggle" type="button" data-toggle="dropdown">
                    Grid Views
                </button>
                <ul className="dropdown-menu">
                    { this.props.options.map((v) => (
                        <li>
                            <a href="#" onClick={this.props.setView.bind(this, v)}>
                                {v.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>);
    }
}
