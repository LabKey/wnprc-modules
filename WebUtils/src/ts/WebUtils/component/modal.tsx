import * as React from "react";
import * as ReactDOM from "react-dom";
import Component = React.Component;
import * as $ from "jquery";

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

interface Modal {
    title: string;
    body: JSX.Element;
    footer?: JSX.Element;
    onCancel?: () => void;
}

interface ModalWrapperProps {

}

interface ModalWrapperState {
    stack: Modal[]
}

export class ModalWrapper extends Component<ModalWrapperProps, ModalWrapperState> {
    private modal: HTMLDivElement;

    constructor(props: ModalWrapperProps) {
        super(props);

        this.state = {
            stack: []
        };

        this.pop = this.pop.bind(this);
    }

    componentDidMount() {
        let $modal = $(this.modal);

        ($(this.modal) as any).modal({
            backdrop: 'static',
            show: (this.state.stack.length > 0),
            keyboard: false
        });

        this._showOrHide();
    }

    componentWillUpdate() {
        this._showOrHide();
    }

    private _showOrHide() {
        ($(this.modal) as any).modal((this.state.stack.length > 0) ? 'show' : 'hide');
    }

    pushState(val: Modal) {
        let stack = this.state.stack;
        stack.push(val);

        this.setState({ stack });
        //this.forceUpdate();
    }

    pop() {
        let stack = this.state.stack;
        stack.pop();
        this.setState({ stack });
        //this.forceUpdate();
    }

    render() {
        let stack = this.state.stack;
        let top = stack[stack.length - 1];

        let title = (top) ? top.title : "";
        let body = (top) ? top.body : null;

        return (
            <div className="modal fade" tabIndex={-1} role="dialog" ref={(div) => {if (div != null) {this.modal = div}}}>
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="close" onClick={this.pop} aria-label="Close"><span aria-hidden="true">&times;</span></button>
                            <h4>{title}</h4>
                        </div>

                        <div className="modal-body">
                            {body}
                        </div>

                        {
                            (top && top.footer) && (
                                <div className="modal-footer">
                                    {top.footer}
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        );
    }
}

let id = guid();

let $modalDiv = $(document.createElement("div"));
$modalDiv.attr('id', id);
$('#bootstrap-box').prepend($modalDiv);

let modal: ModalWrapper;

ReactDOM.render(
    <ModalWrapper ref={(component) => {if (component != null) {modal = component}}}/>,
    $modalDiv.get(0)
);

export {modal}

export function displayError(e: any) {
    modal.pushState({
        title: "Error",
        body: (
            <div>
                <p style={{color: 'red'}}>{e.message || e.exception || "An unknown error occurred"}</p>
            </div>
        )
    });
}