import * as React from 'react';

/**
 * Simple component to encapsulate the styling for the translucent loading panel and spinner. Assumes that
 * the container to cover has a "position: relative" somewhere in the stack which will demarcate the area
 * to be covered by the loading panel. Also assumes Bootstrap's css is included in the page.
 */
export class LoadingOverlay extends React.Component<{message?: string, minHeight?: number}> {
    /** Style for the loading overlay panel */
    private loadStyle: React.CSSProperties = {
        backgroundColor: 'rgba(51,122,183,0.10)',
        height:   '100%',
        left:     0,
        position: 'absolute',
        top:      0,
        width:    '100%',
        zIndex:   10,
    };

    /** Style for the (Bootstrap) glyph spinner */
    private spinStyle: React.CSSProperties = {
        bottom:   20,
        fontSize: '3em',
        position: 'absolute',
        right:    20,
        top:      'auto',
    };

    public render() {
        return (
            <div style={this.loadStyle}>
                <div className="text-primary" style={{minHeight: this.props.minHeight, ...this.spinStyle}}>
                    <span style={{marginRight: '0.5em'}}>{this.props.message}</span>
                    <span className="glyphicon glyphicon-refresh spinning"/>
                </div>
            </div>);
    }
}
