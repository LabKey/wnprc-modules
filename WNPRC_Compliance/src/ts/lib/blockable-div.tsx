import * as React from "react";
import * as $ from "jquery";

export interface BlockableDivProps {
    disabled: boolean;
    className: string;
}

export class BlockableDiv extends React.Component<BlockableDivProps, {isBlocked: boolean}> {
    _div: HTMLDivElement | null;
    private _isBlocked: boolean;

    constructor(props: BlockableDivProps) {
        super(props);

        this._isBlocked = props.disabled;
    }

    componentDidMount() {
        if (this._div) {
            let $div = $(this._div) as any;

            if (this.props.disabled) {
                $div.block({message: null});
            }
            else {
                $div.unblock();
            }
        }
    }

    componentDidUpdate() {
        if (this._div) {
            let $div = $(this._div) as any;

            if (this._isBlocked !== this.props.disabled) {
                (this.props.disabled) ? $div.block({message: null}) : $div.unblock();
                this._isBlocked = this.props.disabled;
            }
        }
    }

    render() {
        return (
            <div ref={(div) => {this._div = div} } className={this.props.className}>
                {this.props.children}
            </div>
        )
    }
}