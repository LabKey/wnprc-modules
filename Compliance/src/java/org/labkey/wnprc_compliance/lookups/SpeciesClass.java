package org.labkey.wnprc_compliance.lookups;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Don't change the names of these items!  The database stores the name of the enum value in fields.  In this case,
 * it is stored in wnprc_compliance.animals_per_protocol.  If you need to change something about the keys, use properties
 * to add a getDisplayName() or similar.
 */
public enum SpeciesClass {
    RHESUS_MACAQUE     ("Rhesus Macaque",  Species.RHESUS_MACAQUE),
    CYNOMOLGUS_MACAQUE ("Cynos Macaque",   Species.CYNOMOLGUS_MACAQUE),
    COMMON_MARMOSET    ("Common Marmoset", Species.COMMON_MARMOSET),
    MACAQUE            ("Macaque",         Arrays.asList(Species.RHESUS_MACAQUE, Species.CYNOMOLGUS_MACAQUE))
    ;

    List<Species> species = new ArrayList<>();
    String displayName;

    SpeciesClass(String displayName, Species species) {
        this(displayName, Arrays.asList(species));
    }

    SpeciesClass(String displayName, List<Species> speciesList) {
        this.species.addAll(speciesList);
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return this.displayName;
    }
}
