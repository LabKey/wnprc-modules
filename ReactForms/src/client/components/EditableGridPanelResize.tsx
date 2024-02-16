import { throttle } from 'lodash';

// Resizable
export const resizableGrid = (elParent, idx, columnWidth, setColumnWidth, elNew, isResizing, setIsResizing) => {
    const elsPanes = elParent.querySelectorAll(":scope > .pane");
    let fr = columnWidth;
    let elPaneCurr = null;
    let paneIndex = -1;
    let frStart = 0;
    let frNext = 0;

    const frToCSS = () => {
        elParent.style["grid-template-columns"] = fr.join("fr ") + "fr";
    };

    const pointerDown = (evt) => {
        if (isResizing || !evt.target.closest(".gutter")) return;
        setIsResizing(true);
        elPaneCurr = evt.currentTarget;
        fr = [...elsPanes].map((elPane) => elPane.clientWidth / elParent.clientWidth);
        // Modify fr in place
        setColumnWidth(fr);
        //console.log(fr); // Output: Modified fr array

        paneIndex = [...elsPanes].indexOf(elPaneCurr);
        frStart = fr[paneIndex];
        frNext = fr[paneIndex + 1];
        addEventListener("pointermove", pointerMove);
        addEventListener("pointerup", pointerUp);
    };

    const pointerMove = throttle((evt) => {
        evt.preventDefault();
        if(!elPaneCurr) return;
        const paneBCR = elPaneCurr.getBoundingClientRect();
        const parentSize = elParent.clientWidth;
        const pointer = {
            x: Math.max(0, Math.min(evt.clientX - paneBCR.left, elParent.clientWidth)),
            y: Math.max(0, Math.min(evt.clientY - paneBCR.top, elParent.clientHeight))
        };
        const frRel = pointer["x"] / parentSize;
        const frDiff = frStart - frRel;
        fr[paneIndex] = Math.max(0.05, frRel);
        fr[paneIndex + 1] = Math.max(0.05, frNext + frDiff);
        setColumnWidth(fr);
        frToCSS();
    }, 1000);

    const pointerUp = (evt) => {
        removeEventListener("pointermove", pointerMove);
        removeEventListener("pointerup", pointerUp);
        setIsResizing(false);
    };

    [...elsPanes].slice(0, -1).forEach((elPane, i) => {
        elPane.append(elNew("div", {
            className: "gutter"
        }));
        elPane.addEventListener("pointerdown", pointerDown);
    });
    frToCSS();
};