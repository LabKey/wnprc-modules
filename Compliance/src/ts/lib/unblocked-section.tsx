import * as React from "react";
import * as $ from "jquery";

export interface UnblockedSectionProps {
    isUnblocked: boolean;
}

export class UnblockedSection extends React.Component<UnblockedSectionProps, {}> {
    private _innerDiv: HTMLDivElement;
    private _outerDiv: HTMLDivElement;

    constructor(props: UnblockedSectionProps) {
        super(props);
    }

    componentDidMount() {
        if (this.props.isUnblocked) {
            this.makeEditable();
        }
    }

    componentDidUpdate() {
        if (this.props.isUnblocked) {
            this.makeEditable();
        }
        else {
            this.unmakeEditable();
        }
    }

    makeEditable(): void {
        if (!this._innerDiv || !this._outerDiv) {
            return;
        }

        let $innerDiv = $(this._innerDiv);
        let $outerDiv = $(this._outerDiv);

        $outerDiv
            .width($innerDiv.width())
            .height($innerDiv.height());

        $innerDiv.css({
            position: 'absolute',
            'z-index': 2000, // The Z-index of jQuery.blockUI elements are between 1000 and 1020.
            'background-color': 'white',
            'border-radius': '8px'
        });

        $innerDiv
            .width($outerDiv.outerWidth())
            .height($outerDiv.outerHeight());

    }

    unmakeEditable() {
        if (!this._innerDiv || !this._outerDiv) {
            return;
        }

        let $innerDiv = $(this._innerDiv);
        let $outerDiv = $(this._outerDiv);

        $innerDiv.css('height', '').css('width', '');
        $outerDiv.css('height', '').css('width', '');

        $innerDiv.css({
            position: '',
            'z-index': '',
            'background-color': '',
            'border-radius': ''
        });
    }

    render() {
        return (
            <div ref={(div) => {this._outerDiv = div;}}>
                <div ref={(div) => {this._innerDiv = div}}>
                    {this.props.children}
                </div>
            </div>
        )
    }
}
