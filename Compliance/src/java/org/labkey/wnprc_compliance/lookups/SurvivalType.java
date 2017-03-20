package org.labkey.wnprc_compliance.lookups;

/**
 * Created by Jon on 3/18/2017.
 */
public enum SurvivalType {
    MINOR ("Body cavities are not exposed. Animals typically do not show significant signs of postoperative pain, have minimal complications, and quickly return to normal function."),
    MAJOR ("Body cavities are exposed, and tissues are extensively dissected or transected. Animals may show substantial impairment of physical or physiologic functions."),
    TERMINAL ("Procedures are terminal, and animals do not regain consciousness prior to death."),
    NOT_SURGERY ("Examples:  Fine-needle biopsies, intravitreal or subcutaneous injections, simple catheter insertions. These should be described in Other Nonsurgical Procedures.")
    ;


    SurvivalType(String description) {

    }
}
