import * as React from "react";

/**
 * Simple component to encapsulate the styling for the translucent loading panel and spinner. Assumes that
 * the container to cover has a "position: relative" somewhere in the stack which will demarcate the area
 * to be covered by the loading panel. Also assumes Bootstrap's css is included in the page.
 */
export class LoadingOverlay extends React.Component
{
    /** Style for the loading overlay panel */
    private loadStyle: React.CSSProperties = {
        backgroundColor: 'rgba(51,122,183,0.10)',
        height:   '100%',
        left:     0,
        position: 'absolute',
        top:      0,
        width:    '100%',
        zIndex:   10
    };

    /** Style for the (Bootstrap) glyph spinner */
    private spinStyle: React.CSSProperties = {
        bottom:   20,
        fontSize: '6em',
        position: 'absolute',
        right:    20,
        top:      'auto'
    };

    render() {
        return (
            <div style={this.loadStyle}>
                <span className="glyphicon glyphicon-refresh text-primary spinning" style={this.spinStyle}/>
            </div>);
    }
}