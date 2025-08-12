import * as React from 'react';
import { FC, useState } from 'react';
import '../../cageui.scss';

interface SubViewContentProps {
    tabs?: {
        name: string;
        children?: React.ReactNode;
    }[]
}
export const SubViewContent: FC<SubViewContentProps> = (props) => {
    const [activeTab, setActiveTab] = useState(0); // State to track the active tab
    const {tabs} = props;

    // Each subview for room/rack/cage should have a details page
    return (
        <div className="page-tab-container">
            <div className="tab-buttons">
                {tabs.map((view, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveTab(index)}
                        className={index === activeTab ? "active" : ""}
                    >
                        {view.name}
                    </button>
                ))}
            </div>
            <div className="tab-content">
                {tabs[activeTab].children}
            </div>
        </div>
    );
}