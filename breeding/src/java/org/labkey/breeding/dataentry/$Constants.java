package org.labkey.breeding.dataentry;

/**
 * Package-scoped constant values used for the data entry forms. Note the dollar sign in the front--that is used
 * specifically to sort the file to the top of any list sorted by file name (such as the file tree shown in most IDEs)
 */
final class $Constants
{
    /**
     * Prevents instantiation and inheritance. Shouldn't be making instances of this under any circumstances.
     */
    private $Constants() { /* no-op */ }

    /**
     * Category name for the breeding data entry forms (to determine the section for the links)
     */
    static final String FORM_CATEGORY = "Colony Records";
}
