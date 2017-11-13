package org.labkey.wnprc_ehr.history;

import org.labkey.api.ehr.history.SortingLabworkType;
import org.labkey.api.module.Module;

/**
 * User: bimber
 * Date: 3/6/13
 * Time: 12:27 PM
 */
public class WNPRCUrinalysisLabworkType extends SortingLabworkType {
    public WNPRCUrinalysisLabworkType(Module module) {
        super("Urinalysis", "study", "Urinalysis Results", "Urinalysis", module);
    }
}
