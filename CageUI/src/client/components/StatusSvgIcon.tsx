import * as React from 'react';
import { FC } from 'react';
import { ReactSVG } from 'react-svg';
import { ActionURL } from '@labkey/api';

interface StatusSvgIconProps {
    status: 'valid' | 'invalid' | 'warning';
}

export const StatusSvgIcon: FC<StatusSvgIconProps> = (props) => {
    const { status } = props;

    switch (status) {
        case 'valid':
            return (
                <ReactSVG
                    src={`${ActionURL.getContextPath()}/cageui/static/validStatus.svg`}
                    beforeInjection={(svg) => {
                        svg.setAttribute('width', '25px');
                        svg.setAttribute('height', '25px');
                    }}
                />
            );
        case 'invalid':
            return (
                <ReactSVG
                    src={`${ActionURL.getContextPath()}/cageui/static/invalidStatus.svg`}
                    beforeInjection={(svg) => {
                        svg.setAttribute('width', '25px');
                        svg.setAttribute('height', '25px');
                    }}
                />
            );
        case 'warning':
            return (
                <ReactSVG
                    src={`${ActionURL.getContextPath()}/cageui/static/warningStatus.svg`}
                    beforeInjection={(svg) => {
                        svg.setAttribute('width', '25px');
                        svg.setAttribute('height', '25px');
                    }}
                />
            );
        default:
            return null;
    }
};
