import * as React from "react";
import CSSProperties = React.CSSProperties;

export interface Editable {
    save:() => Promise<any>;
    cancel:() => Promise<any>;
}

export interface EditableSectionProps {
    title: string;
    editMode: boolean | null;
    handleEdit: () => void;
    handleSave: () => void;
    handleCancel: () => void;
}

export class EditableSection extends React.Component<EditableSectionProps, {}> {
    render() {
        let iStyle: CSSProperties = {
            marginRight: '6px'
        };

        return (
            <div className="container-fluid">
                <h3>
                    {this.props.title}
                    {
                        (this.props.editMode == null) ? (
                            null
                        ) :
                        (this.props.editMode) ? (
                            <span className="pull-right">
                                <a href="#" className="btn btn-primary btn-sm" style={{marginLeft: '5px'}} onClick={this.props.handleCancel}>
                                    <i className="fa fa-remove" style={iStyle}/>Cancel
                                </a>
                                <a href="#" className="btn btn-primary btn-sm" style={{marginLeft: '5px'}} onClick={this.props.handleSave}>
                                    <i className="fa fa-save" style={iStyle}/>Save
                                </a>
                            </span>
                        ) : (
                            <span className="pull-right">
                                <a href="#" className="btn btn-primary btn-sm" style={{marginLeft: '5px'}} onClick={this.props.handleEdit}>
                                    <i className="fa fa-pencil" style={iStyle}/>Edit
                                </a>
                            </span>
                        )
                    }
                </h3>
                <hr />

                {this.props.children}
            </div>
        )
    }
}